/* eslint-disable */

const Db = require('lib/db')
const settings = require('lib/settings')
const WebSocketServer = require('lib/websocket-server')
const HttpServer = require('lib/http-server')

const db = Db({path: settings.paths.ipnsCache})

const webSocketServer = WebSocketServer({port: 9543, db})
webSocketServer.start()

const httpServer = HttpServer({port: 9544, db})
httpServer.start()

const proxyServerPort = 9545
const http = require('http')
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer({})
const server = http.createServer()

proxy.on('error', (error) => {
  console.log(`reverse proxy error: ${error.message}`)
  // console.log(error)
})

server.on('request', (req, res) => {
  const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress
  const ipCountry = req.headers['cf-ipcountry']
  const host = req.headers.host
  // console.log(ip.replace(/^::ffff:/, '').substring(0, 6), ipCountry, req.method, host, req.url)

  // is http server request
  let target = 'http://localhost:9544'
  // is web socket request
  if (req.url.startsWith('/socket.io')) {
    target = 'http://localhost:9543'
  }

  req.headers['x-forwarded-for'] = ip
  anonymizeHeaders(req.headers)
  proxy.web(req, res, {target})
})

// needed to support web sockets
server.on('upgrade', (req, socket, head) => {
  const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress
  const ipCountry = req.headers['cf-ipcountry']
  const host = req.headers.host

  // console.log('upgrade', ip.replace(/^::ffff:/, '').substring(0, 6), ipCountry, req.method, host, req.url)

  const target = 'http://localhost:9543'

  req.headers['x-forwarded-for'] = ip
  anonymizeHeaders(req.headers)
  proxy.ws(req, socket, head, {target})
})

const anonymizeHeaders = (headers) => {
  if (headers['x-forwarded-for']) {
    headers['x-forwarded-for'] = headers['x-forwarded-for'].replace(/^::ffff:/, '').substring(0, 6)
  }
  if (headers['x-forwarded-for']) {
    headers['cf-connecting-ip'] = headers['x-forwarded-for'].replace(/^::ffff:/, '').substring(0, 6)
  }
  return headers
}

server.listen(proxyServerPort)
console.log(`reverse proxy listening on port ${proxyServerPort}`)
