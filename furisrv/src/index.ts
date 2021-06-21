import path from 'path'
import express from 'express'

const app = express()
const port = 8080

const react = path.join(__dirname, '../../furui/build')

app.use('/', express.static(react))

app.get('/', (req, res) => {
  res.sendFile(path.join(react, 'index.html'))
})

app.get('/api', (req, res) => {
   res.send('hello typescript')
})

app.listen(port, () => {
  console.log(`listening on :${port}`)
})
