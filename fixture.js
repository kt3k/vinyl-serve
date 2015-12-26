var vinylServe = require('./')
var through = require('through')
var browserify = require('browserify')

var vfs = require('vinyl-fs')

vfs.src('fixture/**/*.js')
    .pipe(through(function (vinyl) {

        vinyl.contents = browserify(vinyl.path).bundle()

        this.queue(vinyl)

    }))
    .pipe(vinylServe())
