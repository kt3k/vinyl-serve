'use strict'

var url = require('url')
var http = require('http')
var through = require('through')
var subclass = require('subclassjs')
var Promise = require('es6-promise').Promise
var pkg = require('../package')
var Asset = require('./Asset')

var DEFAULT_DEBUG_PAGE_PATH = '/__vinyl__'

var action = {
    'debug-page': require('./action/debug-page'),
    'not-found': require('./action/not-found')
}

/**
 * VinylServer serves vinyl stream entries as assets in it.
 *
 * @class
 */
var VinylServer = subclass(function (pt) {

    /**
     * @param {Number} port The port number
     */
    pt.constructor = function (port) {

        this.port = port

        /**
         * @property {Object} assets The assets to serve. this dynamically changes as streams flows.
         */
        this.assets = {}

    }

    /**
     * @static
     * @property {String} debugPageTitle The debug page's title
     */
    pt.constructor.debugPageTitle = 'Welcome to <i>' + pkg.name + '</i> debug page!'

    /**
     * @static
     * @property {String} debugPagePath The debug page's path
     */
    pt.constructor.debugPagePath = DEFAULT_DEBUG_PAGE_PATH

    /**
     * Handler of the starting of the server
     *
     * @param {String} url The url
     * @param {String} debugUrl The debug page url
     */
    pt.constructor.handlerOfStarting = function (url, debugUrl) {

        console.log('server started at', url)
        console.log('see debug info at', debugUrl)

    }

    /**
     * Handler for the port error.
     *
     * @param {Number} port The port number
     */
    pt.constructor.handlerOfPortError = function (port) {

        console.log('The port number is already in use:', port)

    }

    /**
     * @static
     * @param {String} debugPageTitle The debug page title
     */
    pt.constructor.setDebugPageTitle = function (debugPageTitle) {

        this.debugPageTitle = debugPageTitle

    }

    /**
     * Sets (overrides) the debug page's path.
     *
     * @param {String} path The path
     */
    pt.constructor.setDebugPagePath = function (path) {

        this.debugPagePath = path

    }

    /**
     * Sets the handler of the starting of the server.
     *
     * @param {Function} handler The handler
     */
    pt.constructor.setHandlerOfStarting = function (handler) {

        this.handlerOfStarting = handler

    }

    /**
     * Sets the handler of the port error.
     *
     * @param {Function} handler The handler
     */
    pt.constructor.setHandlerOfPortError = function (handler) {

        this.handlerOfPortError = handler

    }

    /**
     * Starts the server.
     *
     * @return {Promise}
     */
    pt.start = function () {

        var self = this

        this.server = http.createServer(function (req, res) {

            self.handleRequest(req, res)

        })

        this.startPromise = new Promise(function (resolve, reject) {

            self.server.on('error', function (e) {

                self.handleErrorOnListen(e)

                reject(e)

            })

            self.server.listen(self.port, function () {

                self.constructor.handlerOfStarting(
                    'http://0.0.0.0:' + self.server.address().port + '/',
                    'http://0.0.0.0:' + self.server.address().port + self.constructor.debugPagePath
                )

                resolve()

            })

        })

        return this.startPromise

    }

    /**
     * Handles the request.
     *
     * @param {http.IncomingMessage} req The request
     * @param {http.ServerResponse} res The server response
     */
    pt.handleRequest = function (req, res) {

        var url = this.getUrlFromRequest(req)

        if (url === this.constructor.debugPagePath) {

            return action['debug-page'](this.assets, this.constructor.debugPageTitle, pkg, res)

        }

        var asset = this.assets[url]

        if (!asset) {

            return action['not-found'](url, pkg, res)

        }

        return asset.response(res)

    }

    /**
     * @param {http.IncomingMessage} req The reqeust
     * @return {String}
     */
    pt.getUrlFromRequest = function (req) {

        return url.parse(req.url).pathname

    }

    /**
     * Hanlders the error at starting the server.
     *
     * @param {Error} e The error
     */
    pt.handleErrorOnListen = function (e) {

        if (e.code === 'EADDRINUSE') {

            this.constructor.handlerOfPortError(this.port)

            return

        }

        console.log(e.stack)

    }

    /**
     * Restarts the server.
     *
     * @return {Promise}
     */
    pt.restart = function () {

        var self = this

        return this.stop().then(function () {

            return self.start()

        })

    }

    /**
     * Stops the server
     *
     * @return {Promise}
     */
    pt.stop = function () {

        var self = this

        return this.startPromise.then(function () {

            return new Promise(function (resolve) {

                return self.server.close(function () { resolve() })

            })

        })

    }

    /**
     * Gets the writable stream. When you write the vinyl object to this stream then it's going to be served as the contents of the corresponding path.
     *
     * @return {stream.Writable}
     */
    pt.getStreamProcessor = function () {

        var self = this

        return through(function (vinyl) {

            var asset = new Asset(vinyl)

            self.assets[asset.getUrl()] = asset

        })

    }

})

module.exports = VinylServer
