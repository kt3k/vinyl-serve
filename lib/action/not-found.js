'use strict'

var template = require('../template')
var fs = require('fs')
var view = template(fs.readFileSync(__dirname + '/../view/not-found.html').toString())

/**
 * @param {String} url The url string
 * @param {http.ServerResponse} res The server response
 */
module.exports = function (url, res) {
    res.statusCode = 404
    res.end(view({
        css: fs.readFileSync(__dirname + '/../../assets/style.css'),
        pkg: require('../../package'),
        url: url
    }))
}
