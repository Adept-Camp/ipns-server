const Ipfs = require('ipfs')
const ipns = require('ipns')
const crypto = require('libp2p-crypto')
const uint8ArrayFromString = require('uint8arrays/from-string')
const uint8ArrayToString = require('uint8arrays/to-string')
const PeerId = require('peer-id')

const createIpnsRecord = async (fileCid) => {
  const ipfs = await Ipfs.create()
  const encryptedPrivateKeyString = await ipfs.key.export('self', 'password')
  const privateKey = await crypto.keys.import(encryptedPrivateKeyString, 'password')
  const sequence = 0
  const validity = 1000 * 60 * 60 * 24 * 365 * 10 // 10 years

  // create record and embed public key to it
  const record = await ipns.create(privateKey, fileCid, sequence, validity)
  await ipns.embedPublicKey(privateKey.public, record) // required to verify marshalled record
  const marshalled = ipns.marshal(record)

  // verify unmarshalled record
  await ipns.validate(privateKey.public, record)

  // verify marshalled record
  // key is not actually used by validator.validate but must be /ipns/somecidpath to validate
  const key = uint8ArrayFromString(`/ipns/somecidpath`)
  const marshalledValid = await ipns.validator.validate(marshalled, key)

  const peerId = await PeerId.createFromPubKey(privateKey.public.bytes)
  const peerCid = peerId.toB58String()
  console.log({fileCid, peerCid, record, recordValue: uint8ArrayToString(record.value), marshalled, marshalledString: marshalled.toString(), marshalledValid})

  process.exit()
}
createIpnsRecord('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE71')
