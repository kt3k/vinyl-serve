const template = require('../template')
const fs = require('fs')
const path = require('path')
const view = template(
  fs
    .readFileSync(path.join(path.dirname(__dirname), 'view', 'not-found.html'))
    .toString()
)

/**
 * @param {String} url The url string
 * @param {Object} pkg The package info
 * @param {http.ServerResponse} res The server response
 * @param {string} debugPagePath The debug page's path
 */
module.exports = (url, pkg, res, debugPagePath) => {
  const rootDir = path.dirname(path.dirname(__dirname))
  const css = fs
    .readFileSync(path.join(rootDir, 'assets', 'style.css'))
    .toString()
  res.statusCode = 404
  res.end(view({ css, pkg, url, debugPagePath }))
}
