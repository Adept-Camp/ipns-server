const routes = require('express').Router()

routes.all('/publish', async (req, res) => {
  const db = req.app.get('db')
  const body = req.body
  try {
    await db.set(body.path, Buffer.from(body.record.data))
    return res.status(200).end()
  }
  catch (e) {
    e.message = `publish failed: ${e.message}`
    console.log(e)
  }
  res.status(404).end()
})

routes.all('/resolve', async (req, res) => {
  const db = req.app.get('db')
  const body = req.body
  try {
    const ipnsValues = await db.get(body.paths)
    return res.json(ipnsValues)
  }
  catch (e) {
    e.message = `resolve failed: ${e.message}`
    console.log(e)
  }
  res.status(404).end()
})

routes.all('*', (req, res) => res.status(404).end())

module.exports = routes
