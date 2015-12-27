'use strict'

var expect = require('chai').expect

var VinylServer = require('../lib/VinylServer')

describe('VinylServer', function () {

    it('constructs with default port 7000', function (done) {

        var server = new VinylServer()

        expect(server.port).to.equal(7000)

        server.stop().then(done)

    })

    it('fails to start if the port is already in use', function (done) {

        var server0 = new VinylServer()
        var server1

        server0.startPromise.then(function () {

            server1 = new VinylServer()

            server1.startPromise.then(function () {

                done(new Error('Must not start 2 servers in the same port'))

            }).catch(function (e) {

                expect(e.code).to.equal('EADDRINUSE')

                done()

            })

        })

    })

})
