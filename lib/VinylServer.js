'use strict'

var url = require('url')
var http = require('http')
var path = require('path')
var through = require('through')
var subclass = require('subclassjs')
var Promise = require('es6-promise').Promise
var pkg = require('../package')
var Asset = require('./Asset')

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

                console.log('server started at port: ' + self.server.address().port)

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

        var asset = this.assets[pathname]

        if (!asset) {

            this.responseOnUnavailablePath('/' + pathname, res)

        } else {

            asset.response(res)
        }

    }

    /**
     * @static
     * @param {http.IncomingMessage} req The reqeust
     */
    pt.getRelativePathFromRequest = function (req) {

        return path.relative('/', url.parse(req.url).pathname)

    }

    /**
     * @param {String} pathname The pathname
     * @param {http.ServerResponse} res The server response
     */
    pt.responseOnUnavailablePath = function (pathname, res) {

        res.setHeader('content-type', 'text/html')
        res.end(this.createUnavailableMessage(pathname))

    }

    /**
     * Returns the message for unavailable.
     *
     * @private
     * @param {String} pathname The path name
     * @return {String}
     */
    pt.createUnavailableMessage = function (pathname) {

        var buf = ''

        buf += 'Nothing\'s created at <span style="font-weight: bold; color: #115588; font-family: courier">' + pathname + '</span>'

        var assetKeys = Object.keys(this.assets)

        buf += '<hr><b>Available paths (' + assetKeys.length + ')</b>'

        assetKeys.forEach(function (key) {

            var path = '/' + key

            buf += '<br><a href="' + path + '">' + path + '</a>'

        })

        buf += '<hr><a href="' + pkg.homepage + '">' + pkg.name + '</a>@' + pkg.version

        return buf

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
