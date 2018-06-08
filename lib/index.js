const VinylServer = require('./vinyl-server')
const DEFAULT_PORT = 7000

/**
 * @property {Object<VinylServer>} servers The server instances
 */
const servers = {}
const middleware = []

const normalizePort = port => {
  if (typeof port === 'number') {
    return port
  }

  if (typeof port === 'undefined') {
    return DEFAULT_PORT
  }

  throw new Error(`illegal port number: ${port}`)
}

/**
 * @param {Number} port The port number
 */
const createServer = port => {
  const server = new VinylServer(port, middleware)
  server.start()

  return server
}

/**
 * Initializes the server and returns the stream processor.
 * @param {Number} port The port number
 */
module.exports = port => {
  port = normalizePort(port)

  servers[port] = servers[port] || createServer(port)

  return servers[port].getStreamProcessor()
}

/**
 * Restarts the server.
 *
 * @param {Number} port The port number
 * @return {Promise}
 */
module.exports.restart = port => {
  port = normalizePort(port)

  if (!servers[port]) {
    throw new Error(`no server at port="${port}"`)
  }

  return servers[port].restart()
}

/**
 * Stops the server.
 * @param {Number} port The port number
 * @return {Promise}
 */
module.exports.stop = port => {
  port = normalizePort(port)

  if (!servers[port]) {
    throw new Error(`no server at port="${port}"`)
  }

  return servers[port].stop()
}

/**
 * Gets the server instance for the port number. (mainly for test purpose)
 *
 * @param {Number} port The port number
 * @return {VinylServer}
 */
module.exports.getInstance = port => servers[normalizePort(port)]

/**
 * Returns a promise which resolves when the server on the given port is ready.
 * @return {Promise}
 */
module.exports.isServerReady = port => {
  const instance = module.exports.getInstance(port)

  if (instance) {
    return instance.startPromise
  }
}

/**
 * Sets the debug page's title.
 * @param {string} title The title of the debug page
 */
module.exports.setDebugPageTitle = title => VinylServer.setDebugPageTitle(title)

/**
 * Sets the debug page's path.
 * @param {string} path The path of the debug page
 */
module.exports.setDebugPagePath = path => VinylServer.setDebugPagePath(path)

module.exports.setHandlerOfPortError = handler =>
  VinylServer.setHandlerOfPortError(handler)

module.exports.setHandlerOfStarting = handler =>
  VinylServer.setHandlerOfStarting(handler)

module.exports.addMiddleware = mw => {
  middleware.push(mw)
}
