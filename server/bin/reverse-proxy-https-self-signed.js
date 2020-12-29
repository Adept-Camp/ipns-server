const Db = require('lib/db')
const settings = require('lib/settings')
const WebSocketServer = require('lib/websocket-server')
const HttpServer = require('lib/http-server')
const db = Db({path: settings.paths.ipnsCache})
const webSocketServer = WebSocketServer({port: 9543, db})
webSocketServer.start()

const selfsigned = require('selfsigned')
const pems = selfsigned.generate([{name: 'commonName', value: 'selfsigned'}], {days: 365})
const ssl = {key: pems.private, cert: pems.cert}

const proxyServerPort = 9545
const httpProxy = require('http-proxy')
const proxy = httpProxy.createServer({
  target: 'ws://localhost:9543',
  ws: true,
  ssl
})

proxy.on('error', (error) => {
  console.log(`reverse proxy error: ${error.message}`)
  // console.log(error)
})

proxy.listen(proxyServerPort)
console.log(`https self signed reverse proxy listening on port ${proxyServerPort}`)
