# vinyl-serve v1.0.3 [![Build Status](https://travis-ci.org/kt3k/vinyl-serve.svg?branch=master)](https://travis-ci.org/kt3k/vinyl-serve) [![codecov.io](https://codecov.io/github/kt3k/vinyl-serve/coverage.svg?branch=master)](https://codecov.io/github/kt3k/vinyl-serve?branch=master)

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

# API

The vinyl-server module takes the following options.

## vinylServe

This returns stream processor which serves the contents at the given port.

### port

- type: `number`
- The port number of the server

## vinylServe.stop

This restarts the server at the given port number. Throws error if there is no server at the port.

### port

- type: `number`
- The port number of the server

## vinylServe.restart

This stops the server at the given port number. Throws error if there is no server at the port.

### port

- type: `number`
- The port number of the server

# Install

```
npm install vinyl-serve
```

# License

MIT
