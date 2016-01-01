# vinyl-serve v1.2.1 [![Build Status](https://travis-ci.org/kt3k/vinyl-serve.svg?branch=master)](https://travis-ci.org/kt3k/vinyl-serve) [![codecov.io](https://codecov.io/github/kt3k/vinyl-serve/coverage.svg?branch=master)](https://codecov.io/github/kt3k/vinyl-serve?branch=master) [![npm version](https://img.shields.io/npm/v/vinyl-serve.svg)](https://www.npmjs.com/package/vinyl-serve)

> Serves the vinyl stream directly

# Usage

```js
import gulp from 'gulp'
import vinylServe from 'vinyl-serve'
import someTransform from './somewhere'

gulp.src('src/**/*.js')
  .pipe(someTransform())
  .pipe(vinylServe(7000))
```

This starts the server at port 7000 and, for example, `localhost:7000/foo.js` responses the transformed contents of `src/foo.js`.

# Recipes

## Serve multiple source streams

```js
gulp.task('serve', function () {

  gulp.src('js/**/*.js')
    .pipe(someTransform())
    .pipe(vinylServe(7000))

  gulp.src('css/**/*.scss')
    .pipe(anotherTransform())
    .pipe(vinylServe(7000))

  gulp.src('html/**/*.html')
    .pipe(vinylServe(7000))

})
```

## Modify the base path

```js
gulp.src('./js/**/*.js', {base: './'})
  .pipe(someTransform())
  .pipe(vinylServe(7000))
```

With the above example, if you have `js/foo.js`, it's served at the path `/js/foo.js`, not `/foo.js`.

## Debug

At the address `__vinyl__`, you can see the debug page and find all the available paths in the server.

![screenshot](https://kt3k.github.io/vinyl-serve/assets/ss.png)


# API

```js
var vinylServe = require('vinyl-serve')
```

## vinylServe(port)

param|type  |description
-----|------|-----
port |number|The port number of the server (default: 7000)

This returns stream processor which serves the contents at the given port.

## vinylServe.stop(port)

param|type  |description
-----|------|-----
port |number|The port number of the server (default: 7000)

This restarts the server at the given port number. Throws error if there is no server at the port.

## vinylServe.restart(port)

param|type  |description
-----|------|-----
port |number|The port number of the server (default: 7000)

This stops the server at the given port number. Throws error if there is no server at the port.

# Install

```
npm install vinyl-serve
```

# License

MIT
