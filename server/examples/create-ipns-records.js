// this script is only used to generate fixtures

const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')

const createIpnsRecord = async (fileCid) => {
  const rsa = await crypto.keys.generateKeyPair('RSA', 2048)
  const sequence = 0
  const validity = 1000 * 60 * 60 * 24 * 365 * 10 // 10 years

  // create record and embed public key to it
  const record = await ipns.create(rsa, fileCid, sequence, validity)
  await ipns.embedPublicKey(rsa.public, record) // required to verify marshalled record
  const marshalled = ipns.marshal(record)

  // verify unmarshalled record
  await ipns.validate(rsa.public, record)

  // verify marshalled record
  // key is not actually used by validator.validate but must be /ipns/somecidpath to validate
  const key = uint8ArrayFromString(`/ipns/somecidpath`)
  const marshalledValid = await ipns.validator.validate(marshalled, key)

  const peerId = await PeerId.createFromPubKey(rsa.public.bytes)
  const peerCid = peerId.toB58String()
  console.log({fileCid, peerCid, record, recordValue: uint8ArrayToString(record.value), marshalled, marshalledString: marshalled.toString(), marshalledValid})
}
createIpnsRecord('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE71')
createIpnsRecord('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE72')
createIpnsRecord('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE73')
