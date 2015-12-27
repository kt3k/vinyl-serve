/* eslint handle-callback-err: 0 */
'use strict'

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

        })).pipe(vinylServe({port: 7001}))

        setTimeout(function () { done() }, 300)

    })

    it('serves at the given port', function (done) {

        request.get('localhost:7001').end(function (err, res) {

            expect(res.status).to.equal(200)
            done()

        })

    })

    it('serves the items in the vinyl stream', function (done) {

        request.get('localhost:7001/foo.js').end(function (err, res) {

            expect(res.text).to.contain('This is foo.js')
            expect(res.text).to.contain('This is bar.js')

            done()

        })
    })

    describe('restart', function () {

        it('restart the server', function (done) {

            vinylServe.restart().then(function () {

                request.get('localhost:7001').end(function (err, res) {

                    expect(res.status).to.equal(200)
                    done()

                })

            })

        })

    })

    describe('stop', function () {

        it('restart the server', function (done) {

            vinylServe.stop().then(function () {

                request.get('localhost:7001').end(function (err) {

                    expect(err).to.not.equal(null)
                    expect(err.code).to.equal('ECONNREFUSED')

                    done()

                })

            })

        })

    })

})
