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

            return this.responseDebugPage(res)

        }

        var asset = this.assets[pathname]

        if (!asset) {

            return this.responseOnUnavailablePath('/' + pathname, res)

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
     * Responses the debug page.
     *
     * @param {http.ServerResponse} res The server response
     */
    pt.responseDebugPage = function (res) {

        res.setHeader('content-type', 'text/html')
        res.end(this.createDebugPageHtml())

    }

    /**
     * Creates the debug page's html.
     *
     * @return {String}
     */
    pt.createDebugPageHtml = function () {

        var self = this
        var buf = this.getStyleTag()
        var assetKeys = Object.keys(this.assets)

        buf += '<header><h1>Welcome to ' + pkg.name + ' debug page!</h1></header>'

        buf += '<header class="sub"><h2>Available paths (' + assetKeys.length + ')</h2></header>'

        buf += '<div class="container">'

        buf += '<table class="paths" border="1" cellspacing="0"><tr>'
        buf += '<th>path</th>'
        buf += '<th>mime type</th>'
        buf += '<th id="vinyl-toggle" data-toggle="1">vinyl</th>'
        buf += '</tr>'

        assetKeys.forEach(function (key) {

            var asset = self.assets[key]

            buf += '<tr>'
            buf += '<td><a href="' + asset.getUrl() + '">' + asset.getUrl() + '</a></td>'
            buf += '<td>' + asset.getMimeType() + '</td>'
            buf += '<td><pre class="vinyl" data-toggle="1">' + JSON.stringify(asset.vinyl, null, 2) + '</pre></td>'
            buf += '</tr>'

        })

        buf += '</table>'

        return buf + '</div>' + this.getSignatureHtml() + this.getScriptTag()

    }

    /**
     * Gets the signature as html.
     * @return {String}
     */
    pt.getSignatureHtml = function () {

        return '<footer><a href="' + pkg.homepage + '">' + pkg.name + '</a>@' + pkg.version + '</footer>'

    }

    /**
     * Gets the common style.
     */
    pt.getStyleTag = function () {

        return '<style>' + css + '</style>'

    }

    /**
     * Gets the script tag.
     *
     * @return {String}
     */
    pt.getScriptTag = function () {

        return '<script>' + script + '</script>'
    }

    /**
     * @param {String} pathname The pathname
     * @param {http.ServerResponse} res The server response
     */
    pt.responseOnUnavailablePath = function (pathname, res) {

        res.setHeader('content-type', 'text/html')
        res.statusCode = 404
        res.end(this.createNotFoundHtml(pathname))

    }

    /**
     * Returns the message for unavailable.
     *
     * @private
     * @param {String} pathname The path name
     * @return {String}
     */
    pt.createNotFoundHtml = function (pathname) {

        var buf = this.getStyleTag()

        buf += '<div class="container">'
        buf += 'Not Found - <span class="not-found-path">' + pathname + '</span>'
        buf += '<hr />see <a href="/__vinyl__">debug page</a> for more info'

        return buf + this.getSignatureHtml() + '</div>'

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
