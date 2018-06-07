/* eslint handle-callback-err: 0 */

const request = require('superagent')
const expect = require('chai').expect
const vinylServe = require('../')
const through = require('through')
const browserify = require('browserify')
const vfs = require('vinyl-fs')

describe('vinyl-serve', () => {
  before(done => {
    vfs
      .src('fixture/**/*.js')
      .pipe(
        through(function (vinyl) {
          vinyl.contents = browserify(vinyl.path).bundle()

          this.queue(vinyl)
        })
      )
      .pipe(vinylServe(7001))

    vfs.src('fixture/**/*.html').pipe(vinylServe(7001))

    setTimeout(() => {
      done()
    }, 300)
  })

  it('serves the debug page at the given port', done => {
    request.get('localhost:7001/__vinyl__').end((err, res) => {
      expect(res.status).to.equal(200)
      done()
    })
  })

  it('serves the items in the vinyl stream', done => {
    request
      .get('localhost:7001/foo.js')
      .buffer()
      .end((err, res) => {
        expect(res.text).to.contain('This is foo.js')
        expect(res.text).to.contain('This is bar.js')

        done()
      })
  })

  it('serves the items in the vinyl stream (under subdirectory)', done => {
    request
      .get('localhost:7001/baz/spam.js')
      .buffer()
      .end((err, res) => {
        expect(res.text).to.contain('This is spam.js')

        done()
      })
  })

  it('serves the items in the vinyl stream (under subsubdirectory)', done => {
    request
      .get('localhost:7001/baz/egg/spam.js')
      .buffer()
      .end((err, res) => {
        expect(res.text).to.contain('This is egg/spam.js')

        done()
      })
  })

  it('serves the 404 status when no item at the address', done => {
    request.get('localhost:7001/nothing').end((err, res) => {
      expect(res.status).to.equal(404)

      done()
    })
  })

  it('serves index.html when the directory is requested', done => {
    request.get('localhost:7001/baz/').end((err, res) => {
      expect(res.status).to.equal(200)
      expect(res.text).to.contain('This is baz/index.html')

      done()
    })
  })

  it('starts the server with port 7000 when none given', done => {
    vinylServe()

    vinylServe.getInstance().startPromise.then(() => {
      request.get('localhost:7000/__vinyl__').end((err, res) => {
        expect(res.status).to.equal(200)

        vinylServe.stop()

        done()
      })
    })
  })

  it('throws when the given port number is not number, not undefined', () => {
    expect(() => {
      vinylServe('foo')
    }).to.throw()
  })

  describe('restart', () => {
    it('restarts the server', done => {
      vinylServe.restart(7001).then(() => {
        request.get('localhost:7001/__vinyl__').end((err, res) => {
          expect(res.status).to.equal(200)
          done()
        })
      })
    })

    it('throws when no server for the port number', () => {
      expect(() => {
        vinylServe.restart(7002)
      }).to.throw()
    })
  })

  describe('stop', () => {
    it('stops the server', done => {
      vinylServe.stop(7001).then(() => {
        request.get('localhost:7001/__vinyl__').end(err => {
          expect(err).to.not.equal(null)
          expect(err.code).to.equal('ECONNREFUSED')

          done()
        })
      })
    })

    it('throws when no server for the port number', () => {
      expect(() => {
        vinylServe.stop(7002)
      }).to.throw()
    })
  })

  describe('isServerReady', () => {
    it('returns a promise which resolves when the server is ready', done => {
      vinylServe(7011)

      vinylServe.isServerReady(7011).then(() => {
        request.get('localhost:7011/__vinyl__').end((err, res) => {
          expect(err).to.equal(null)
          expect(res.status).to.equal(200)

          vinylServe.stop(7011)

          done()
        })
      })
    })

    it('returns null when the server of the port does not exist', () => {
      expect(vinylServe.isServerReady(7012) == null).to.equal(true)
    })
  })

  describe('setDebugPageTitle', () => {
    it('sets the debug page title', done => {
      vinylServe.setDebugPageTitle('Pupupupu <i>pupu</i>')

      vinylServe(7003)

      vinylServe.isServerReady(7003).then(() => {
        request.get('localhost:7003/__vinyl__').end((err, res) => {
          expect(res.text).to.contain('<title>Pupupupu pupu</title>')
          expect(res.text).to.contain('<h1>Pupupupu <i>pupu</i></h1>')

          vinylServe.stop(7003)

          done()
        })
      })
    })
  })

  describe('setDebugPagePath', () => {
    it("sets the debug page's path", () => {
      vinylServe.setDebugPagePath('__foo__')

      expect(vinylServe.getInstance().constructor.debugPagePath).to.equal(
        '__foo__'
      )
    })
  })

  describe('setHandlerOfStarting', () => {
    it('sets the handler of the starting of the server', () => {
      const handler = () => {}

      vinylServe.setHandlerOfStarting(handler)

      expect(vinylServe.getInstance().constructor.handlerOfStarting).to.equal(
        handler
      )
    })
  })

  describe('setHandlerOfPortError', () => {
    it('sets the handler of the port error', () => {
      const handler = () => {}

      vinylServe.setHandlerOfPortError(handler)

      expect(vinylServe.getInstance().constructor.handlerOfPortError).to.equal(
        handler
      )
    })
  })
})
