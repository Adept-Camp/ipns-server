ipns server is needed until `ipfs.name.resolve` and `ipns.name.publish` become available in the browser. The socket.io and http apis are described in `server/lib/websocker-server/index.js` and `server/lib/http-server/index.js`

## run in docker

### install node_modules
`bin/install`

### start
`bin/start`

### test
`bin/test`

## run outside docker

### install node_modules
`cd server && npm install`

### start
`cd server && npm start`

### test
`cd server && npm test`
