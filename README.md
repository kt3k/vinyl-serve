# vinyl-serve v1.3.3 [![Build Status](https://travis-ci.org/kt3k/vinyl-serve.svg?branch=master)](https://travis-ci.org/kt3k/vinyl-serve) [![codecov.io](https://codecov.io/github/kt3k/vinyl-serve/coverage.svg?branch=master)](https://codecov.io/github/kt3k/vinyl-serve?branch=master) [![npm version](https://img.shields.io/npm/v/vinyl-serve.svg)](https://www.npmjs.com/package/vinyl-serve)

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

# API for module developer

`vinyl-serve` has some more APIs which are maybe useful when someone wants to use this module as a part of another module.

## vinylServe.setDebugPageTitle(title)

- @param {String} title

This overrides the debug page title.

## vinylServe.setDebugPagePath(path)

- @param {String} path

This overrides the debug page path. The path have to start with '/'. (The default is `__vinyl__`.)

Example. `/__mytool__`

## vinylServer.setHandlerOfStarting(handler)

- @param {Function} handler

Sets the handler for the starting of the server. This handler is called when the server start listening. This handler is called with 2 parameters. The first one is the url of the root of the server and the second is the path of the debug page. ( e.g. `http://0.0.0.0:7000/` and `http://0.0.0.0:7000/__vinyl__` )

## vinylServer.setHandlerOfPortError(handler)

- @param {Function} handler

Sets the handler for the case of the port number error. This handler is called when the server's port is already in use. This handler is called with 1 parameter which is the port number of the server.

# Install

```
npm install vinyl-serve
```

# License

MIT

# History

- 2016-04-17   v1.3.3   Fix bug of binary data handling.
