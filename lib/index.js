'use strict'

var VinylServer = require('./VinylServer')
var DEFAULT_PORT = 7000

/**
 * @variable {Object<VinylServer>} servers The server instances
 */
var servers = {}

var normalizePort = function (port) {

    if (typeof port === 'number') {

        return port

    }

    if (typeof port === 'undefined') {

        return DEFAULT_PORT

    }

    throw new Error('illegal port number: ' + port)

}

/**
 * @param {Number} port The port number
 */
var createServer = function (port) {

    var server = new VinylServer(port)
    server.start()

    return server

}

/**
 * Initializes the server and returns the stream processor.
 *
 * @param {Number} port The port number
 */
var exports = function (port) {

    port = normalizePort(port)

    servers[port] = servers[port] || createServer(port)

    return servers[port].getStreamProcessor()

}

/**
 * Restarts the server.
 *
 * @param {Number} port The port number
 * @return {Promise}
 */
exports.restart = function (port) {

    port = normalizePort(port)

    if (!servers[port]) {

        throw new Error('no server at port="' + port + '"')

    }

    return servers[port].restart()

}

/**
 * Stops the server.
 *
 * @param {Number} port The port number
 * @return {Promise}
 */
exports.stop = function (port) {

    port = normalizePort(port)

    if (!servers[port]) {

        throw new Error('no server at port="' + port + '"')

    }

    return servers[port].stop()

}

/**
 * Gets the server instance for the port number. (mainly for test purpose)
 *
 * @param {Number} port The port number
 * @return {VinylServer}
 */
exports.getInstance = function (port) {

    port = normalizePort(port)

    return servers[port]

}

exports.setDebugPageTitle = function (title) {

    VinylServer.setDebugPageTitle(title)

}

module.exports = exports
