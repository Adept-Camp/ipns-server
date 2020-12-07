const express = require('express')
const routes = require('./routes')
const {logger} = require('./middlewares')
const assert = require('assert')
const bodyParser = require('body-parser')

class HttpServer {
  constructor ({port, db} = {}) {
    assert(db && typeof db === 'object')
    this.db = db
    this.app = express()
    this.app.disable('x-powered-by')
    this._server = null
    this.port = null
    if (port) {
      this.port = port
    }
    this.middlewares = [bodyParser.json(), logger]
  }

  async start () {
    this._create()
    await this._listen()
  }

  async stop () {
    await this._server.close()
    this._server = null
    console.log(`${this.constructor.name} stopped`)
  }

  _create () {
    this.useMiddlewares()
    this.app.use(routes)
    this.app.set('db', this.db)
  }

  useMiddlewares () {
    for (const middleware of this.middlewares) {
      this.app.use(middleware)
    }
  }

  async _listen () {
    await new Promise(resolve => {
      this._server = this.app.listen(this.port, resolve)
    })
    // replace port if was undefined and got a random open port
    this.port = this._server.address().port
    console.log(`${this.constructor.name} started on port ${this.port}`)
  }
}

module.exports = (...args) => new HttpServer(...args)
