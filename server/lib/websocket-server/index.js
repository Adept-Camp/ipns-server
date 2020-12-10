require('events').EventEmitter.prototype._maxListeners = 1000 // fix max emitter warnings
const {inspect} = require('util')
const http = require('http')
const WebSocket = require('socket.io')
const assert = require('assert')
const EventEmitter = require('events')

class WebSocketServer extends EventEmitter {
  constructor ({port, db} = {}) {
    super()
    assert(db && typeof db === 'object')
    this.db = db
    this.webSocket = null
    this._server = null
    this.port = null
    if (port) {
      this.port = port
    }
  }

  async start () {
    this._server = http.createServer()
    this.webSocket = WebSocket(this._server)

    await new Promise(resolve => this._server.listen(this.port, resolve))
    // replace port if was undefined and got a random open port
    this.port = this._server.address().port
    console.log(`${this.constructor.name} started on port ${this.port}`)

    this.webSocket.on('connection', (webSocketClient) => {
      // eslint-disable-next-line no-new
      new WebSocketClient({webSocketClient, webSocketServer: this})
    })
  }

  async stop () {
    await this._server.close()
    this._server = null
    console.log(`${this.constructor.name} stopped`)
  }
}

class WebSocketClient {
  constructor ({webSocketServer, webSocketClient} = {}) {
    assert(webSocketServer && typeof webSocketServer === 'object')
    assert(webSocketClient && typeof webSocketClient === 'object')
    this.webSocketServer = webSocketServer
    this.webSocketClient = webSocketClient
    this._initClientConnection()
    this.subscriptions = new Set()
  }

  _initClientConnection () {
    this.log('connection')
    this.webSocketClient.on('resolve', (ipnsPaths, ack) => this._onResolve(ipnsPaths, ack))
    this.webSocketClient.on('subscribe', (ipnsPaths, ack) => this._onSubscribe(ipnsPaths, ack))
    this.webSocketClient.on('unsubscribe', (ipnsPaths) => this._onUnsubscribe(ipnsPaths))
    this.webSocketClient.on('publish', (ipnsPath, ipnsRecord) => this._onPublish(ipnsPath, ipnsRecord))

    // notify client of new publishes he subscribes to
    this.webSocketServer.on('publish', (ipnsPath, ipnsRecord) => {
      if (this.subscriptions.has(ipnsPath)) {
        this.webSocketClient.emit('publish', ipnsPath, ipnsRecord)
      }
    })
  }

  async _onResolve (ipnsPaths, ack) {
    this.log('resolve', ipnsPaths)
    if (!ipnsPaths || !ipnsPaths.length) {
      return
    }

    // send back ipns paths if any
    try {
      const ipnsRecords = await this.webSocketServer.db.get(ipnsPaths)
      ack(ipnsRecords)
    }
    catch (e) {
      e.message = `on resolve failed: ${e.message}`
      console.log(e)
    }
  }

  async _onSubscribe (ipnsPaths, ack) {
    this.log('subscribe', ipnsPaths)
    if (!ipnsPaths || !ipnsPaths.length) {
      return
    }

    // send back ipns paths if any
    try {
      const ipnsRecords = await this.webSocketServer.db.get(ipnsPaths)
      ack(ipnsRecords)
    }
    catch (e) {
      e.message = `on subscribe failed: ${e.message}`
      console.log(e)
      return
    }

    // notify client of new publishes he subscribes to
    for (const ipnsPath of ipnsPaths) {
      this.subscriptions.add(ipnsPath)
    }
  }

  _onUnsubscribe (ipnsPaths) {
    this.log('unsubscribe', ipnsPaths)
    if (!ipnsPaths || !ipnsPaths.length) {
      return
    }

    // do not notify client of new publishes he does not subscribe to
    for (const ipnsPath of ipnsPaths) {
      this.subscriptions.delete(ipnsPath)
    }
  }

  async _onPublish (ipnsPath, ipnsRecord) {
    this.log('publish', [ipnsPath, ipnsRecord])
    if (!ipnsPath || !ipnsRecord) {
      return
    }

    try {
      await this.webSocketServer.db.set(ipnsPath, ipnsRecord)
    }
    catch (e) {
      e.message = `on publish failed: ${e.message}`
      console.log(e)
      return
    }

    // notify subscribed clients
    const ipnsRecords = await this.webSocketServer.db.get([ipnsPath])
    this.webSocketServer.emit('publish', ipnsPath, ipnsRecords[0])
  }

  log (eventName, eventArguments) {
    const ip = this.webSocketClient.request.headers['x-forwarded-for'] || this.webSocketClient.request.connection.remoteAddress
    let log = `${new Date().toISOString()} ${ip.replace(/^::ffff:/, '').substring(0, 6)} ${eventName}`
    if (eventArguments) {
      log += ` ${inspect(eventArguments)}`
    }
    log += ` ${inspect(this.webSocketClient.request.headers)}`
    console.log(log)
  }
}

module.exports = (...args) => new WebSocketServer(...args)
