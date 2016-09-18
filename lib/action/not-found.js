'use strict'

const template = require('../template')
const fs = require('fs')
const path = require('path')
const view = template(fs.readFileSync(path.dirname(__dirname) + '/view/not-found.html').toString())

/**
 * @param {String} url The url string
 * @param {Object} pkg The package info
 * @param {http.ServerResponse} res The server response
 */
module.exports = (url, pkg, res) => {
  const rootDir = path.dirname(path.dirname(__dirname))
  const css = fs.readFileSync(rootDir + '/assets/style.css').toString()
  res.statusCode = 404
  res.end(view({css, pkg, url}))
}
