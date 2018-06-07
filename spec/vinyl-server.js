const expect = require('chai').expect

const VinylServer = require('../lib/vinyl-server')

describe('VinylServer', () => {
  it('constructs with the given port number', () => {
    const server = new VinylServer(7003)

    expect(server.port).to.equal(7003)
  })

  describe('start', () => {
    it('fails to start if the port is already in use', done => {
      const server0 = new VinylServer(7005)
      let server1

      server0.start().then(() => {
        server1 = new VinylServer(7005)

        server1
          .start()
          .then(() => {
            done(new Error('Must not start 2 servers in the same port'))
          })
          .catch(e => {
            expect(e.code).to.equal('EADDRINUSE')

            server0.stop()

            done()
          })
      })
    })
  })

  describe('handleErrorOnListen', () => {
    it('logs error stack if the error code is not EADDRINUSE', () => {
      const server = new VinylServer(7009)

      server.handleErrorOnListen({ stack: 'abc' })

      // TODO: assert
    })
  })
})
