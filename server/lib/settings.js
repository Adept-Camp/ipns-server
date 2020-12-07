const fs = require('fs-extra')
const path = require('path')
const settings = {}

const root = path.join(__dirname, '..')
settings.paths = {
  root,
  lib: __dirname,
  log: path.join(root, 'log'),
  data: path.join(root, 'data')
}
settings.paths.ipnsCache = path.join(settings.paths.data, 'ipns-cache.sqlite')

fs.ensureDirSync(settings.paths.data)
fs.ensureDirSync(settings.paths.log)

module.exports = settings
