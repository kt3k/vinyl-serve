// run node test.js and see http://localhost:7000/__vinyl__

require('vinyl-fs')
  .src('fixture/**/*.js')
  .pipe(
    require('through')(function (file) {
      file.contents = require('browserify')(file.path).bundle()
      this.queue(file)
    })
  )
  .pipe(require('./')())

require('vinyl-fs')
  .src('fixture/**/*.png')
  .pipe(require('./')())
require('vinyl-fs')
  .src('fixture/**/*.css')
  .pipe(require('./')())
require('vinyl-fs')
  .src('fixture/**/*.html')
  .pipe(require('./')())
