'use strict'

var path = require('path')
var through = require('through')
var subclass = require('subclassjs')
var Promise = require('es6-promise').Promise

/**
 * Asset is the model for a file
 */
var Asset = subclass(function (pt) {

    /**
     * @param {Vinyl} vinyl The file
     */
    pt.constructor = function (vinyl) {

        this.vinyl = vinyl

        this.promise = this.constructor.createPromiseFromVinyl(vinyl)

    }

    /**
     * Creates a promise from the vinyl.
     *
     * @private
     * @static
     * @param {Vinyl} vinyl The file
     * @return {Promise<String>}
     */
    pt.constructor.createPromiseFromVinyl = function (vinyl) {

        return new Promise(function (resolve) {

            var contents = ''

            vinyl.pipe(through(function write (data) {

                contents += data

            }, function end () {

                resolve({data: contents, mime: 'text/plain'})

                this.emit('end')

            }))

        })

    }

    /**
     * Returns the contents as a promise.
     *
     * @return {Promise}
     */
    pt.getContents = function () {

        return this.promise

    }

    /**
     * Gets the path.
     *
     * @return {String}
     */
    pt.getPath = function () {

        return path.relative(this.vinyl.base, this.vinyl.path)

    }

})

module.exports = Asset
