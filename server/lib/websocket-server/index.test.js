const {ipnsPaths, ipnsRecords} = require('lib/fixtures')
const WebSocketClient = require('socket.io-client')
const Db = require('lib/db')
const WebSocketServer = require('./index')
const path = require('path')
const testDbPath = path.join(__dirname, 'test-db.sqlite')
const fs = require('fs-extra')
let webSocketServer
let webSocketClient

describe('websocket server', () => {
  beforeAll(async () => {
    // error if db removed before finished init
    let db
    try {
      fs.removeSync(testDbPath)
      db = Db({path: testDbPath})
    }
    catch (e) {}

    webSocketServer = WebSocketServer({db})
    await webSocketServer.start()
    const url = `http://localhost:${webSocketServer.port}`
    webSocketClient = WebSocketClient(url)
  })

  test('publish and subscribe', async () => {
    // not published yet
    await new Promise((resolve) => {
      webSocketClient.emit('subscribe', [ipnsPaths[0], ipnsPaths[1], ipnsPaths[2]], (ipnsRecords) => {
        expect(ipnsRecords).toStrictEqual([null, null, null])
        resolve()
      })
    })

    // publish
    await new Promise((resolve) => {
      // once subscribed should get real time publish updates
      webSocketClient.on('publish', (ipnsPath, ipnsRecord) => {
        expect(ipnsPath).toBe(ipnsPaths[0])
        expect(ipnsRecord).toStrictEqual(ipnsRecords[0])
        resolve()
      })

      webSocketClient.emit('publish', ipnsPaths[0], ipnsRecords[0])
    })

    // now is published
    await new Promise((resolve) => {
      webSocketClient.emit('subscribe', [ipnsPaths[0], ipnsPaths[1], ipnsPaths[2]], (ipnsRecords) => {
        expect(ipnsRecords).toStrictEqual([ipnsRecords[0], null, null])
        resolve()
      })
    })
  })

  afterAll(async () => {
    fs.removeSync(testDbPath)
    webSocketClient.close()
    await webSocketServer.stop()
  })
})
