import path from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'

const port = 8080
const react = path.join(__dirname, '../../furui/build')

const app = new Koa()
const router = new Router()

app.use(serve(react))
app.use(router.routes())

router.get('/', serve(path.join(react, 'index.html')))

router.get('/api', ctx => {
  ctx.body = 'hello typescript'
})

app.listen(port, () => {
  console.log(`listening on :${port}`)
})
