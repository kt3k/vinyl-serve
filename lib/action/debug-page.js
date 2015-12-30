'use strict'

var template = require('../template')
var fs = require('fs')
var view = template(fs.readFileSync(__dirname + '/../view/debug-page.html').toString())

/**
 * @param {Asset[]} assets The assets
 * @param {ServerResponse} res The server response
 */
module.exports = function (assets, res) {

    assets = Object.keys(assets).map(function (key) { return assets[key] })

    res.setHeader('content-type', 'text/html')
    res.statusCode = 200
    res.end(view({
        css: fs.readFileSync(__dirname + '/../../assets/style.css'),
        script: fs.readFileSync(__dirname + '/../../assets/script.js'),
        pkg: require('../../package'),
        assets: assets
    }))

}
