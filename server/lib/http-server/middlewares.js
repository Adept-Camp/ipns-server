const {inspect} = require('util')

const logger = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const log = `${new Date().toISOString()} ${ip.replace(/^::ffff:/, '').substring(0, 7)} ${req.originalUrl} ${inspect(req.headers)} ${inspect(req.body)}`
  console.log(log)
  next()
}

module.exports = {logger}
