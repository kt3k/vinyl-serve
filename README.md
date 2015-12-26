# vinyl-serve v0.1.0

> Serves the vinyl stream directly

# Usage

```js
import gulp from 'gulp'
import vinylServe from 'vinyl-serve'
import someTransform from './somewhere'

gulp.src('/src/**/*.js')
  .pipe(someTransform())
  .pipe(vinylServe({port: 7000}))
```

This starts the server at port 7000 and, for example, `localhost:7000/foo.js` responses the transformed contents of `src/foo.js`.

# API

The vinyl-server module takes the following options.

## Options

### port

- type: `number`
- The port number of the server

# Install

```
npm install vinyl-serve
```

# License

MIT
