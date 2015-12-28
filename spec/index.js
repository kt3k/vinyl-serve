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

        })).pipe(vinylServe(7001))

        setTimeout(function () { done() }, 300)

    })

    it('serves the debug page at the given port', function (done) {

        request.get('localhost:7001/__vinyl__').end(function (err, res) {

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

    it('serves the 404 status when no item at the address', function (done) {

        request.get('localhost:7001/nothing').end(function (err, res) {

            expect(res.status).to.equal(404)

            done()

        })

    })

    it('starts the server with port 7000 when none given', function (done) {

        vinylServe()

        setTimeout(function () {

            request.get('localhost:7000/__vinyl__').end(function (err, res) {

                expect(res.status).to.equal(200)

                done()

            })

        }, 300)

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

})
