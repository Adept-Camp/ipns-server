const Ipfs = require('ipfs')
const crypto = require('libp2p-crypto')
const uint8ArrayToString = require('uint8arrays/to-string')

const fixturePrivateKey = 'CAASpwkwggSjAgEAAoIBAQDN/MgQkYFzc+Ac+QwMOGsb9FVE0HLi19T0pEfNenPj6e96RiGHq7b+bLoJWcttip+k46yNOduD5n3K+/uyO3hvPNOBa8tr0rg+7MnGV+ErzN3zB3kqaX15imW+vYfnjE1+baP/MRFiwLJ+JXdbmOQxy4HNWpQsFywTpWRXZFXjb4jiLF6VAG7oMj3QIwr4nNp4FukbRkuzHZ4qYuQ9W1HrmWr09mwo2OXe2iw93jZJ+/nMMI9c46FPl8d1e+pONGDDR9nTgKNJJDxCHxKNm/Ev6s+6zANqLhPnLs/+Z/231HskiTTzyKZcPTn8Q9j/SMikb9BKzHZE7JoVnQVImH0XAgMBAAECggEBAJSEMWtgvckUPv4kwn79HpzlKaWX9X2AyFYrLGoGZBBr1vJ+Jia/tAz1L50WVQoB7ODiFsMseA093mzACdWT812gqY6iveRb5ePYrhKHwh3mdBCJzt65eHJtSrafyKE2E5mYS6nvIu3kqc0yDkDIl58fb9Mz/6lae7kegp5QBW0Y7ePuKvg/I66kHcfjEWx/hqldFjoEqCv2/q0e+s0m4QokG+X6jyMSo+4aoXJBlvr9ouCWC/NIyzpZas1qE9NPP8BLTWDudiaWKq5LIGmFYbaHqfc7GVF4EfHtiRTkvCtetm0b/uwxmLcDFPJrW+qeG9cN9AIHLLfw4ZNJ5G9M5EECgYEA9X/qLg+SFFwR21+oYKnuGSTSjXOuEVRzLdyR8rhz7DLfvTNYHvI5p/1sTJlG5GnjAybb+fVC8og0YqaKmkUhm2XJG9VfwFaF1A1Hepim1ibsBAOU5EIGSTPGhOujdiZkVnFH5FiacUdU5+0VPHGssyfEt4f7ingJJ+I2rLoDN+8CgYEA1sw6yLQvjSlJNeI50YM60dVyQm82b7h0Esr1HOHXhbPX1XJEcosxyWULk4H814oJ2T9zKJZYrYxaVDyBszdeIFIwHE3FORWdpEaq6jd0xhtX3G4XafvfvR+42ZGkTIkfWA/BdJ9WqYneAV6xA+RC32PHwDwikAzJpjtmN6djpVkCgYBjns6GdmcOv/W3EXAgGZS2u0x9fe2qtpwuhgzrc5IGzPYhro4ZsK1Yz+t8gc5UresiwkgNfEr4Y/Dt/yrLQzZJ+tnK46EBSZrw25qf0wYQbKblUha/MVOfrNTn5z7jmNyqfzlvHc0+HnYDzx8I8g/ke0TGPPYD0IXWm2MYYDsiHQKBgG6dojA1yr8xYchkBk6E/EePWlYoG6qRHQWIi44iJ/Fs2lvLisBKOotyg/Gk4WbGaaf9avqd4nENdH8o4co/WzPd33TUABsTrKkq013mzTYwYqDb+SbVVTV6HqG8xRW9D+0zv/alD+YjX7bo4tQUOvP72KSA03PHghkfQdarVz+RAoGADi1ckotftbli4BI5ZgvJIGneNmdf/Dzh8QYd6Fs3wXjukXUgYIVFkZ8fVMPawC8pQn5nBQraWilcDvz5N2euUbMWiX/m1P9onoW5pHwW0HJ0kZ/Jwh5auieNR9mVhSc0KCM/Uf1QIkzfja/fTMJzsScoNeeDKgmDICkiLekRnJM'

;(async () => {
  const repo = Math.random().toString(36).substring(7)
  const repo2 = Math.random().toString(36).substring(7)

  // dont provide a private key and use brand new repo
  let ipfs = await Ipfs.create({repo})
  const id = await ipfs.id()
  const encryptedPrivateKeyString = await ipfs.key.export('self', 'password')
  const privateKey = await crypto.keys.import(encryptedPrivateKeyString, 'password')
  const privateKeyBase64 = uint8ArrayToString(privateKey.bytes, 'base64')
  const keyListCid = (await ipfs.key.list())[0].id
  await ipfs.stop()

  // provide the exported private key with the same repo
  ipfs = await Ipfs.create({repo, config: {Identity: {PrivKey: privateKeyBase64}}})
  const id2 = await ipfs.id()
  const encryptedPrivateKeyString2 = await ipfs.key.export('self', 'password')
  const privateKey2 = await crypto.keys.import(encryptedPrivateKeyString2, 'password')
  const privateKeyBase642 = uint8ArrayToString(privateKey2.bytes, 'base64')
  const keyListCid2 = (await ipfs.key.list())[0].id
  await ipfs.stop()

  // provide a different fixture private key with the same repo
  ipfs = await Ipfs.create({repo, config: {Identity: {PrivKey: fixturePrivateKey}}})
  const id3 = await ipfs.id()
  const encryptedPrivateKeyString3 = await ipfs.key.export('self', 'password')
  const privateKey3 = await crypto.keys.import(encryptedPrivateKeyString3, 'password')
  const privateKeyBase643 = uint8ArrayToString(privateKey3.bytes, 'base64')
  const keyListCid3 = (await ipfs.key.list())[0].id
  await ipfs.stop()

  // provide a different fixture private key with a brand new repo
  ipfs = await Ipfs.create({repo: repo2, config: {Identity: {PrivKey: fixturePrivateKey}}})
  const id4 = await ipfs.id()
  const encryptedPrivateKeyString4 = await ipfs.key.export('self', 'password')
  const privateKey4 = await crypto.keys.import(encryptedPrivateKeyString4, 'password')
  const privateKeyBase644 = uint8ArrayToString(privateKey4.bytes, 'base64')
  const keyListCid4 = (await ipfs.key.list())[0].id
  await ipfs.stop()

  console.log('')
  console.log('cid1', id.id)
  console.log('cid2', id2.id)
  console.log('cid3', id3.id)
  console.log('cid4', id4.id)
  console.log('keyListCid1', keyListCid)
  console.log('keyListCid2', keyListCid2)
  console.log('keyListCid3', keyListCid3)
  console.log('keyListCid4', keyListCid4)
  console.log('publicKey1', id.publicKey.substring(0, 100))
  console.log('publicKey2', id2.publicKey.substring(0, 100))
  console.log('publicKey3', id3.publicKey.substring(0, 100))
  console.log('publicKey4', id4.publicKey.substring(0, 100))
  console.log('privateKey1', privateKey.bytes.toString().substring(0, 100))
  console.log('privateKey2', privateKey2.bytes.toString().substring(0, 100))
  console.log('privateKey3', privateKey3.bytes.toString().substring(0, 100))
  console.log('privateKey4', privateKey4.bytes.toString().substring(0, 100))
  console.log('privateKeyBase641', privateKeyBase64.substring(0, 100))
  console.log('privateKeyBase642', privateKeyBase642.substring(0, 100))
  console.log('privateKeyBase643', privateKeyBase643.substring(0, 100))
  console.log('privateKeyBase644', privateKeyBase644.substring(0, 100))

  /* output from running 2 different times
    1.
    cid1 QmWWuUTMUnsYtP3vgADQT7wejHjp95MXUBWHCfNZ9D5Zxc
    cid2 QmWWuUTMUnsYtP3vgADQT7wejHjp95MXUBWHCfNZ9D5Zxc
    cid3 QmWG9CeMfdLCTbNG5ZwQzb8gDSqexeirwdA2pXrebA7zqL
    cid4 QmRUQn8Gf4cvUczBR5LFfJUCo6RAwEaAPWM5jw4biEP8jq
    keyListCid1 QmWWuUTMUnsYtP3vgADQT7wejHjp95MXUBWHCfNZ9D5Zxc
    keyListCid2 QmWWuUTMUnsYtP3vgADQT7wejHjp95MXUBWHCfNZ9D5Zxc
    keyListCid3 QmWWuUTMUnsYtP3vgADQT7wejHjp95MXUBWHCfNZ9D5Zxc <-- strange behavior, not the same cid3
    keyListCid4 QmRUQn8Gf4cvUczBR5LFfJUCo6RAwEaAPWM5jw4biEP8jq
    publicKey1 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC5WxcStYwu1PwLsUH18cE7JhAPcEO5hKjS9MBx6Nnv+BugVKRB
    publicKey2 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC5WxcStYwu1PwLsUH18cE7JhAPcEO5hKjS9MBx6Nnv+BugVKRB
    publicKey3 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDN/MgQkYFzc+Ac+QwMOGsb9FVE0HLi19T0pEfNenPj6e96RiGH <-- strange behavior, not the same public key as neither publicKey2 or publicKey4
    publicKey4 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDAOsnyRFPmKpCWxdIkQF1wJdH+Kg6MCowgRyvMiNg2jjtwn/5Y
    privateKey1 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,185,91,23,18,181,140,46,212,252,11,177,65,245,241,193,59
    privateKey2 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,185,91,23,18,181,140,46,212,252,11,177,65,245,241,193,59
    privateKey3 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,185,91,23,18,181,140,46,212,252,11,177,65,245,241,193,59 <-- strange behavior, same private key as privateKey2 but different public key than publicKey2
    privateKey4 8,0,18,169,9,48,130,4,165,2,1,0,2,130,1,1,0,192,58,201,242,68,83,230,42,144,150,197,210,36,64,93,112
    privateKeyBase641 CAASpgkwggSiAgEAAoIBAQC5WxcStYwu1PwLsUH18cE7JhAPcEO5hKjS9MBx6Nnv+BugVKRBu0Edri/k+AqosPPPlL6I7hYZjrDd
    privateKeyBase642 CAASpgkwggSiAgEAAoIBAQC5WxcStYwu1PwLsUH18cE7JhAPcEO5hKjS9MBx6Nnv+BugVKRBu0Edri/k+AqosPPPlL6I7hYZjrDd
    privateKeyBase643 CAASpgkwggSiAgEAAoIBAQC5WxcStYwu1PwLsUH18cE7JhAPcEO5hKjS9MBx6Nnv+BugVKRBu0Edri/k+AqosPPPlL6I7hYZjrDd
    privateKeyBase644 CAASqQkwggSlAgEAAoIBAQDAOsnyRFPmKpCWxdIkQF1wJdH+Kg6MCowgRyvMiNg2jjtwn/5Yxj2Cm/EkUaXrZmtTMOmprzS8D2/T

    2.
    cid1 Qmam9Mp8eE8er5hnjpB2SWY8u9yUzsBb5h6mRjcghw3XTh
    cid2 Qmam9Mp8eE8er5hnjpB2SWY8u9yUzsBb5h6mRjcghw3XTh
    cid3 QmWG9CeMfdLCTbNG5ZwQzb8gDSqexeirwdA2pXrebA7zqL
    cid4 QmPJ62ou8wjAuQTBKBfARk4P6fVsEvUahChNWfkWFP12Eo
    keyListCid1 Qmam9Mp8eE8er5hnjpB2SWY8u9yUzsBb5h6mRjcghw3XTh
    keyListCid2 Qmam9Mp8eE8er5hnjpB2SWY8u9yUzsBb5h6mRjcghw3XTh
    keyListCid3 Qmam9Mp8eE8er5hnjpB2SWY8u9yUzsBb5h6mRjcghw3XTh
    keyListCid4 QmPJ62ou8wjAuQTBKBfARk4P6fVsEvUahChNWfkWFP12Eo
    publicKey1 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCmkIT69OPl/AYy8hqkDRg8Wcon5E/oQAyGGorKI0xWJxOgy53e
    publicKey2 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCmkIT69OPl/AYy8hqkDRg8Wcon5E/oQAyGGorKI0xWJxOgy53e
    publicKey3 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDN/MgQkYFzc+Ac+QwMOGsb9FVE0HLi19T0pEfNenPj6e96RiGH <-- strange behavior, same public key as previous output, but different private key
    publicKey4 CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDxyFzCXr1SRVrDna8DFRaxle4thnMAaMx8aY6NKOlJYE1yHEto
    privateKey1 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,166,144,132,250,244,227,229,252,6,50,242,26,164,13,24,60
    privateKey2 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,166,144,132,250,244,227,229,252,6,50,242,26,164,13,24,60
    privateKey3 8,0,18,166,9,48,130,4,162,2,1,0,2,130,1,1,0,166,144,132,250,244,227,229,252,6,50,242,26,164,13,24,60
    privateKey4 8,0,18,168,9,48,130,4,164,2,1,0,2,130,1,1,0,241,200,92,194,94,189,82,69,90,195,157,175,3,21,22,177,1
    privateKeyBase641 CAASpgkwggSiAgEAAoIBAQCmkIT69OPl/AYy8hqkDRg8Wcon5E/oQAyGGorKI0xWJxOgy53ex8Gtkful6y7GrOVl43gk1WLcAS+I
    privateKeyBase642 CAASpgkwggSiAgEAAoIBAQCmkIT69OPl/AYy8hqkDRg8Wcon5E/oQAyGGorKI0xWJxOgy53ex8Gtkful6y7GrOVl43gk1WLcAS+I
    privateKeyBase643 CAASpgkwggSiAgEAAoIBAQCmkIT69OPl/AYy8hqkDRg8Wcon5E/oQAyGGorKI0xWJxOgy53ex8Gtkful6y7GrOVl43gk1WLcAS+I
    privateKeyBase644 CAASqAkwggSkAgEAAoIBAQDxyFzCXr1SRVrDna8DFRaxle4thnMAaMx8aY6NKOlJYE1yHEtoCCN+oFrQ665oDkyjKwfz+Bc/RBK2
  */
})()
