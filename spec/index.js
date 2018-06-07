/* eslint handle-callback-err: 0 */

var request = require('superagent')
var expect = require('chai').expect
var vinylServe = require('../')
var through = require('through')
var browserify = require('browserify')
var vfs = require('vinyl-fs')

describe('vinyl-serve', function () {
  before(function (done) {
    vfs.src('fixture/**/*.js').pipe(through(function (vinyl) {
      vinyl.contents = browserify(vinyl.path).bundle()

      this.queue(vinyl)
    })).pipe(vinylServe(7001))

    vfs.src('fixture/**/*.html').pipe(vinylServe(7001))

    setTimeout(function () {
      done()
    }, 300)
  })

  /*
  after(() => {
    vinylServe.stop(7001)
  })
  */

  it('serves the debug page at the given port', function (done) {
    request.get('localhost:7001/__vinyl__').end(function (err, res) {
      expect(res.status).to.equal(200)
      done()
    })
  })

  it('serves the items in the vinyl stream', function (done) {
    request.get('localhost:7001/foo.js').buffer().end(function (err, res) {
      expect(res.text).to.contain('This is foo.js')
      expect(res.text).to.contain('This is bar.js')

      done()
    })
  })

  it('serves the items in the vinyl stream (under subdirectory)', function (done) {
    request.get('localhost:7001/baz/spam.js').buffer().end(function (err, res) {
      expect(res.text).to.contain('This is spam.js')

      done()
    })
  })

  it('serves the items in the vinyl stream (under subsubdirectory)', function (done) {
    request.get('localhost:7001/baz/egg/spam.js').buffer().end(function (err, res) {
      expect(res.text).to.contain('This is egg/spam.js')

      done()
    })
  })

  it('serves the 404 status when no item at the address', function (done) {
    request.get('localhost:7001/nothing').end(function (err, res) {
      expect(res.status).to.equal(404)

      done()
    })
  })

  it('serves index.html when the directory is requested', function (done) {
    request.get('localhost:7001/baz/').end(function (err, res) {
      expect(res.status).to.equal(200)
      expect(res.text).to.contain('This is baz/index.html')

      done()
    })
  })

  it('starts the server with port 7000 when none given', function (done) {
    vinylServe()

    vinylServe.getInstance().startPromise.then(function () {
      request.get('localhost:7000/__vinyl__').end(function (err, res) {
        expect(res.status).to.equal(200)

        vinylServe.stop()

        done()
      })
    })
  })

  it('throws when the given port number is not number, not undefined', function () {
    expect(function () {
      vinylServe('foo')
    }).to.throw()
  })

  describe('restart', function () {
    it('restarts the server', function (done) {
      vinylServe.restart(7001).then(function () {
        request.get('localhost:7001/__vinyl__').end(function (err, res) {
          expect(res.status).to.equal(200)
          done()
        })
      })
    })

    it('throws when no server for the port number', function () {
      expect(function () {
        vinylServe.restart(7002)
      }).to.throw()
    })
  })

  describe('stop', function () {
    it('stops the server', function (done) {
      vinylServe.stop(7001).then(function () {
        request.get('localhost:7001/__vinyl__').end(function (err) {
          expect(err).to.not.equal(null)
          expect(err.code).to.equal('ECONNREFUSED')

          done()
        })
      })
    })

    it('throws when no server for the port number', function () {
      expect(function () {
        vinylServe.stop(7002)
      }).to.throw()
    })
  })

  describe('isServerReady', () => {
    it('returns a promise which resolves when the server is ready', done => {
      vinylServe(7011)

      vinylServe.isServerReady(7011).then(() => {
        request.get('localhost:7011/__vinyl__').end(function (err, res) {
          expect(err).to.equal(null)
          expect(res.status).to.equal(200)

          vinylServe.stop(7011)

          done()
        })
      })
    })

    it('returns null when the server of the port does not exist', () => {
      expect(vinylServe.isServerReady(7012) == null).to.be.true
    })
  })

  describe('setDebugPageTitle', function () {
    it('sets the debug page title', function (done) {
      vinylServe.setDebugPageTitle('Pupupupu <i>pupu</i>')

      vinylServe(7003)

      vinylServe.isServerReady(7003).then(function () {
        request.get('localhost:7003/__vinyl__').end(function (err, res) {
          expect(res.text).to.contain('<title>Pupupupu pupu</title>')
          expect(res.text).to.contain('<h1>Pupupupu <i>pupu</i></h1>')

          vinylServe.stop(7003)

          done()
        })
      })
    })
  })

  describe('setDebugPagePath', function () {
    it('sets the debug page\'s path', function () {
      vinylServe.setDebugPagePath('__foo__')

      expect(vinylServe.getInstance().constructor.debugPagePath).to.equal('__foo__')
    })
  })

  describe('setHandlerOfStarting', function () {
    it('sets the handler of the starting of the server', function () {
      var handler = function () {}

      vinylServe.setHandlerOfStarting(handler)

      expect(vinylServe.getInstance().constructor.handlerOfStarting).to.equal(handler)
    })
  })

  describe('setHandlerOfPortError', function () {
    it('sets the handler of the port error', function () {
      var handler = function () {}

      vinylServe.setHandlerOfPortError(handler)

      expect(vinylServe.getInstance().constructor.handlerOfPortError).to.equal(handler)
    })
  })
})
