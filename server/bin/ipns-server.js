const Db = require('lib/db')
const settings = require('lib/settings')
const WebSocketServer = require('lib/websocket-server')
const HttpServer = require('lib/http-server')

const db = Db({path: settings.paths.ipnsCache})

const webSocketServer = WebSocketServer({port: 9543, db})
webSocketServer.start()

const httpServer = HttpServer({port: 9544, db})
httpServer.start()
