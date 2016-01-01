'use strict'

var template = require('../template')
var fs = require('fs')
var view = template(fs.readFileSync(__dirname + '/../view/debug-page.html').toString())

/**
 * @param {Asset[]} assets The assets
 * @param {String} title The debug page title
 * @param {Object} pkg The package info (used for showing in footer and title)
 * @param {ServerResponse} res The server response
 */
module.exports = function (assets, title, pkg, res) {

    assets = Object.keys(assets).sort().map(function (key) { return assets[key] })

    res.setHeader('content-type', 'text/html')
    res.statusCode = 200
    res.end(view({
        title: title,
        css: fs.readFileSync(__dirname + '/../../assets/style.css'),
        script: fs.readFileSync(__dirname + '/../../assets/script.js'),
        pkg: pkg,
        assets: assets
    }))

}
