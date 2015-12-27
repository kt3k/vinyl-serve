'use strict'

var VinylServer = require('./VinylServer')

/**
 * @variable {VinylServer} serverInstance The server instance
 */
var serverInstance

/**
 * Initializes the server and returns the stream processor.
 *
 * @param {Object} opts The options
 */
var exports = function (opts) {

    serverInstance = serverInstance || new VinylServer(opts)

    return serverInstance.getStreamProcessor()

}

/**
 * Restarts the server.
 *
 * @return {Promise}
 */
exports.restart = function () {

    if (!serverInstance) { throw new Error('Server instance has not yet been initialized') }

    return serverInstance.restart()

}

/**
 * Stops the server.
 *
 * @return {Promise}
 */
exports.stop = function () {

    if (!serverInstance) { throw new Error('Server instance has not yet been initialized') }

    return serverInstance.stop()

}

module.exports = exports
