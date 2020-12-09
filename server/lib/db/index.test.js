const {ipnsPaths, ipnsRecords, unsetInpsPaths} = require('lib/fixtures')
const Db = require('./index')
const path = require('path')
const testDbPath = path.join(__dirname, 'test-db.sqlite')
const fs = require('fs-extra')
let db

describe('db', () => {
  beforeEach(() => {
    // error if removed before finished init
    try {
      fs.removeSync(testDbPath)
      db = Db({path: testDbPath})
    }
    catch (e) {}
  })

  test('set and get many', async () => {
    await db.set(ipnsPaths[0], ipnsRecords[0])
    await db.set(ipnsPaths[1], ipnsRecords[1])
    await db.set(ipnsPaths[2], ipnsRecords[2])

    const ipnsRecordsRes = await db.get([
      ipnsPaths[0],
      ipnsPaths[1],
      unsetInpsPaths[0],
      ipnsPaths[2]
    ])
    expect(ipnsRecordsRes).toStrictEqual([ipnsRecords[0], ipnsRecords[1], undefined, ipnsRecords[2]])
  })

  test('set and get one', async () => {
    await db.set(ipnsPaths[0], ipnsRecords[0])

    const ipnsRecordsRes = await db.get([ipnsPaths[0]])
    expect(ipnsRecordsRes).toStrictEqual([ipnsRecords[0]])
  })

  afterEach(() => {
    fs.removeSync(testDbPath)
  })
})
