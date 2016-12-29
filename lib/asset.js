'use strict'

var mime = require('mime')
var path = require('path')
var through2 = require('through2')
var moment = require('moment')
var EventEmitter = require('events').EventEmitter

/**
 * Asset is the model class of a file.
 *
 * @class
 */
class Asset extends EventEmitter {

  /**
   * @param {Vinyl} vinyl The file
   */
  constructor (vinyl) {
    super()

    this.vinyl = vinyl
    this.bufferPromise = Asset.createBufferPromiseFromVinyl(vinyl)

    this.bufferPromise.then(buffer => {
      this.emit('ready', buffer)
    }).catch(e => {
      this.emit('error', e)
    })
  }

  /**
   * Creates a promise from the vinyl.
   *
   * @private
   * @static
   * @param {Vinyl} vinyl The file
   * @return {Promise<String>}
   */
  static createBufferPromiseFromVinyl (vinyl) {
    return new Promise((resolve, reject) => {
      var contents = new Buffer([])

      if (vinyl.isStream()) {
        vinyl.pipe(through2((data, enc, callback) => {
          contents = Buffer.concat([contents, new Buffer(data)])
          callback(null)
        }, () => {
          resolve(contents)
        })).on('error', err => { reject(err) })
      } else if (vinyl.isBuffer()) {
        resolve(vinyl.contents)
      } else {
        reject(new Error('unsupported vinyl type:' + vinyl.path))
      }
    })
  }

  /**
   * Gets the (Unix style) path.
   *
   * @return {String}
   */
  getPath () {
    return path.relative(this.vinyl.base, this.vinyl.path).replace(/\\/g, '/')
  }

  /**
   * Gets the url.
   *
   * @return {String}
   */
  getUrl () {
    return '/' + this.getPath()
  }

  /**
   * Gets the mime type of the asset.
   *
   * @return {String}
   */
  getMimeType () {
    return mime.lookup(this.getPath())
  }

  /**
   * Gets the mtime.
   * @return {string}
   */
  getMtime () {
    if (!this.vinyl || !this.vinyl.stat || !this.vinyl.stat.mtime) {
      return 'N/A'
    }

    return moment(this.vinyl.stat.mtime.toJSON()).format('YYYY-MM-DD HH:mm:ss')
  }

  /**
   * Responses to the server response.
   *
   * @param {ServerResponse} res
   */
  response (res) {
    res.setHeader('Content-Type', this.getMimeType())

    this.bufferPromise.then(buffer => {
      res.end(buffer)
    })
  }
}

module.exports = Asset
