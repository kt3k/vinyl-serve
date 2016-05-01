'use strict'

var mime = require('mime')
var path = require('path')
var through2 = require('through2')

/**
 * Asset is the model class of a file.
 *
 * @class
 */
class Asset {

    /**
     * @param {Vinyl} vinyl The file
     */
    constructor(vinyl) {

        this.vinyl = vinyl
        this.bufferPromise = Asset.createBufferPromiseFromVinyl(vinyl)

    }

    /**
     * Creates a promise from the vinyl.
     *
     * @private
     * @static
     * @param {Vinyl} vinyl The file
     * @return {Promise<String>}
     */
    static createBufferPromiseFromVinyl(vinyl) {

        return new Promise((resolve, reject) => {

            var contents = new Buffer([])

            vinyl.pipe(through2((data, enc, callback) => {

                contents = Buffer.concat([contents, new Buffer(data)])
                callback(null)

            }, () => {

                resolve(contents)

            })).on('error', err => {reject(err)})

        })

    }

    /**
     * Gets the path.
     *
     * @return {String}
     */
    getPath() {

        return path.relative(this.vinyl.base, this.vinyl.path)

    }

    /**
     * Gets the url.
     *
     * @return {String}
     */
    getUrl() {

        return '/' + this.getPath()

    }

    /**
     * Gets the mime type of the asset.
     *
     * @return {String}
     */
    getMimeType() {

        return mime.lookup(this.getPath())

    }

    /**
     * Responses to the server response.
     *
     * @param {ServerResponse} res
     */
    response(res) {

        res.setHeader('Content-Type', this.getMimeType())

        this.bufferPromise.then(buffer => {

            res.end(buffer)

        })

    }

}

module.exports = Asset
