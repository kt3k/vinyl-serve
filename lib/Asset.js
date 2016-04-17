'use strict'

var mime = require('mime')
var path = require('path')
var subclass = require('subclassjs')

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

        this.vinyl.pipe(res)

    }

})

module.exports = Asset
