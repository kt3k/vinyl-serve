'use strict'

var expect = require('chai').expect

var VinylServer = require('../lib/VinylServer')

describe('VinylServer', function () {

    it('constructs with the given port number', function () {

        var server = new VinylServer(7003)

        expect(server.port).to.equal(7003)

    })


    describe('start', function () {

        it('fails to start if the port is already in use', function (done) {

            var server0 = new VinylServer(7005)
            var server1

            server0.start().then(function () {

                server1 = new VinylServer(7005)

                server1.start().then(function () {

                    done(new Error('Must not start 2 servers in the same port'))

                }).catch(function (e) {

                    expect(e.code).to.equal('EADDRINUSE')

                    done()

                })

            })

        })

    })

    describe('handleErrorOnListen', function () {

        it('logs error stack if the error code is not EADDRINUSE', function () {

            var server = new VinylServer(7009)

            server.handleErrorOnListen({stack: 'abc'})

            // TODO: assert

        })

    })

})
