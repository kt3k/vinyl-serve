var mime = require('mime')
var path = require('path')
var subclass = require('subclassjs')
var through = require('through')

/**
 * Asset is the model class of a file.
 *
 * @class
 */
var Asset = subclass(function (pt) {

    /**
     * @param {Vinyl} vinyl The file
     */
    pt.constructor = function (vinyl) {

        this.vinyl = vinyl
        this.bufferPromise = this.constructor.createBufferPromiseFromVinyl(vinyl)

    }

    /**
     * Creates a promise from the vinyl.
     *
     * @private
     * @static
     * @param {Vinyl} vinyl The file
     * @return {Promise<String>}
     */
    pt.constructor.createBufferPromiseFromVinyl = function (vinyl) {

        return new Promise(function (resolve) {

            var contents = new Buffer([])

            vinyl.pipe(through(function write (data) {

                contents = Buffer.concat([contents, new Buffer(data)])

            }, function end () {

                resolve(contents)

                this.emit('end')

            }))

        })

    }

    /**
     * Gets the path.
     *
     * @return {String}
     */
    pt.getPath = function () {

        return path.relative(this.vinyl.base, this.vinyl.path)

    }

    /**
     * Gets the url.
     *
     * @return {String}
     */
    pt.getUrl = function () {

        return '/' + this.getPath()

    }

    /**
     * Gets the mime type of the asset.
     *
     * @return {String}
     */
    pt.getMimeType = function () {

        return mime.lookup(this.getPath())

    }

    /**
     * Responses to the server response.
     *
     * @param {ServerResponse} res
     */
    pt.response = function (res) {

        res.setHeader('Content-Type', this.getMimeType())

        this.bufferPromise.then(buffer => {

            res.end(buffer)

        })

    }

})

module.exports = Asset
