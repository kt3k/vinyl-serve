'use strict'

var url = require('url')
var http = require('http')
var path = require('path')
var through = require('through')
var subclass = require('subclassjs')
var Promise = require('es6-promise').Promise
var pkg = require('../package')
var Asset = require('./Asset')
var css = require('fs').readFileSync(__dirname + '/../assets/style.css')
var script = require('fs').readFileSync(__dirname + '/../assets/script.js')

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

                console.log('server started at http://0.0.0.0:' + self.server.address().port + '/')
                console.log('see debug info at http://0.0.0.0:' + self.server.address().port + '/__vinyl__')

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

        var pathname = this.getRelativePathFromRequest(req)

        if (pathname === '__vinyl__') {

            return action['debug-page'](this.assets, res)

        }

        var asset = this.assets[pathname]

        if (!asset) {

            return action['not-found']('/' + pathname, res)

        }

        return asset.response(res)

    }

    /**
     * @static
     * @param {http.IncomingMessage} req The reqeust
     */
    pt.getRelativePathFromRequest = function (req) {

        return path.relative('/', url.parse(req.url).pathname)

    }

    /**
     * Hanlders the error at starting the server.
     *
     * @param {Error} e The error
     */
    pt.handleErrorOnListen = function (e) {

        if (e.code === 'EADDRINUSE') {
            console.log('The port number is already in use: ' + this.port)

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

            self.assets[asset.getPath()] = asset

        })

    }

})

module.exports = VinylServer
