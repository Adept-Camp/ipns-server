const Keyv = require('keyv')
const assert = require('assert')
const isIPFS = require('is-ipfs')
const ipns = require('ipns')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')

class Db {
  constructor ({path} = {}) {
    assert(typeof path === 'string')
    if (path) {
      this.cache = new Keyv(`sqlite://${path}`)
    }
  }

  async set (ipnsPath, marshalledIpnsRecord) {
    assert(typeof ipnsPath === 'string')
    assert(Buffer.isBuffer(marshalledIpnsRecord))
    validateIpnsPaths([ipnsPath])

    // validate ipns record is signed by embedded public key
    const ipnsRecord = ipns.unmarshal(marshalledIpnsRecord)
    const publicKey = ipns.extractPublicKey({}, ipnsRecord)
    await ipns.validate(publicKey, ipnsRecord)

    // validate ipns path is the embedded public key
    // in case malicious user tries to submit old ipns record
    const peerCid = await PeerId.createFromPubKey(publicKey.bytes)
    assert(peerCid.equals(PeerId.createFromB58String(ipnsPath)))

    // validate record sequence to prevent publishing old records
    assert(typeof ipnsRecord.sequence === 'number')
    const previousRecord = await this.cache.get(ipnsPath)
    if (previousRecord) {
      const unmarshalled = ipns.unmarshal(previousRecord)
      assert(ipnsRecord.sequence > unmarshalled.sequence, `record sequence ${ipnsRecord.sequence} is not bigger than previous record sequence ${unmarshalled.sequence}`)
    }

    const ipnsValue = uint8ArrayToString(ipnsRecord.value)
    // validate value is a valid cid and nothing weird
    assert(isIPFS.cid(ipnsValue))
    await this.cache.set(ipnsPath, marshalledIpnsRecord)
  }

  async get (ipnsPaths) {
    assert(Array.isArray(ipnsPaths))
    validateIpnsPaths(ipnsPaths)

    if (ipnsPaths.length === 0) {
      return []
    }
    if (ipnsPaths.length === 1) {
      const ipnsRecord = await this.cache.get(ipnsPaths[0])
      return [ipnsRecord]
    }

    // build query
    const keys = [...ipnsPaths]
    const firstKey = keys.shift()
    let query = `SELECT * FROM keyv WHERE key LIKE 'keyv:${firstKey}'`
    for (const key of keys) {
      query = `${query} OR key LIKE 'keyv:${key}'`
    }
    query = `${query};`

    // assign values from keyv to object
    const res = await this.cache.opts.store.query(query)
    const resValues = {}
    for (const _res of res) {
      const base64Value = JSON.parse(_res.value).value.replace(/^:base64:/, '')
      resValues[_res.key.replace(/^keyv:/, '')] = Buffer.from(base64Value, 'base64')
    }

    const ipnsRecords = []
    for (const ipnsPath of ipnsPaths) {
      ipnsRecords.push(resValues[ipnsPath])
    }
    return ipnsRecords
  }
}

const validateIpnsPaths = (paths) => {
  for (const path of paths) {
    assert(isIPFS.cid(path))
  }
}

module.exports = (...args) => new Db(...args)
