const template = require('../template')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const view = template(
  fs.readFileSync(path.dirname(__dirname) + '/view/debug-page.html').toString()
)

/**
 * @param {Asset[]} assets The assets
 * @param {String} title The debug page title
 * @param {Object} pkg The package info (used for showing in footer and title)
 * @param {ServerResponse} res The server response
 */
module.exports = (assets, title, pkg, res) => {
  const mimeMap = {}
  const typeHtml = 'text/html'

  Object.keys(assets)
    .sort(
      (a, b) => +moment(assets[b].getMtime()) - moment(assets[a].getMtime())
    )
    .map(key => assets[key])
    .forEach(asset => {
      const type = asset.getMimeType()
      const assets = (mimeMap[type] = mimeMap[type] || [])
      assets.push(asset)
    })

  const mimes = Object.keys(mimeMap)
    .sort((m, n) => (n === typeHtml ? 1 : m === typeHtml ? -1 : 0))
    .map(key => mimeMap[key])

  res.setHeader('content-type', typeHtml)
  res.statusCode = 200
  res.end(view({ title, pkg, assets, mimes, css: getCss(), moment }))
}

/**
 * Gets the style sheet string.
 * @return {Buffer}
 */
const getCss = () => {
  const rootDir = path.dirname(path.dirname(__dirname))

  return fs.readFileSync(rootDir + '/assets/style.css')
}
