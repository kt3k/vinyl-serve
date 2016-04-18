'use strict'

const template = require('../template')
const fs = require('fs')
const path = require('path')
const view = template(fs.readFileSync(path.dirname(__dirname) + '/view/debug-page.html').toString())

/**
 * @param {Asset[]} assets The assets
 * @param {String} title The debug page title
 * @param {Object} pkg The package info (used for showing in footer and title)
 * @param {ServerResponse} res The server response
 */
module.exports = (assets, title, pkg, res) => {

    assets = Object.keys(assets).sort().map(key => assets[key])

    const rootDir = path.dirname(path.dirname(__dirname))

    const css = fs.readFileSync(rootDir + '/assets/style.css')
    const script = fs.readFileSync(rootDir + '/assets/script.js')

    res.setHeader('content-type', 'text/html')
    res.statusCode = 200
    res.end(view({title, pkg, assets, css, script}))

}
