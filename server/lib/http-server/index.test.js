const {ipnsPaths, ipnsValues, ipnsRecords} = require('lib/fixtures')
const Db = require('lib/db')
const HttpServer = require('./index')
const path = require('path')
const fetch = require('node-fetch')
const testDbPath = path.join(__dirname, 'test-db.sqlite')
const fs = require('fs-extra')
let httpServer
let url

describe('http server', () => {
  beforeAll(async () => {
    // error if db removed before finished init
    let db
    try {
      fs.removeSync(testDbPath)
      db = Db({path: testDbPath})
    }
    catch (e) {}

    httpServer = HttpServer({db})
    await httpServer.start()
    url = `http://localhost:${httpServer.port}`
  })

  test('publish', async () => {
    let body = JSON.stringify({path: ipnsPaths[0], record: ipnsRecords[0]})
    let options = {body, method: 'POST', headers: {'Content-Type': 'application/json'}}
    let res = await fetch(`${url}/publish`, options)
    expect(res.status).toBe(200)

    body = JSON.stringify({path: ipnsPaths[1], record: ipnsRecords[1]})
    options = {body, method: 'POST', headers: {'Content-Type': 'application/json'}}
    res = await fetch(`${url}/publish`, options)
    expect(res.status).toBe(200)
  })

  test('resolve', async () => {
    // those paths should have been added from previous publish test
    const body = JSON.stringify({paths: [ipnsPaths[0], ipnsPaths[1], ipnsPaths[2]]})
    const options = {body, method: 'POST', headers: {'Content-Type': 'application/json'}}
    const res = await fetch(`${url}/resolve`, options).then(res => res.json())
    expect(res).toStrictEqual([ipnsValues[0], ipnsValues[1], null])
  })

  afterAll(async () => {
    fs.removeSync(testDbPath)
    await httpServer.stop()
  })
})
