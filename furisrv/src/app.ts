import path from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import koaLogger from 'koa-logger'
import api from './api'
import { logger } from './logger'

const react = path.join(__dirname, '../../furui/build')

export const app = new Koa()

const router = new Router()

app.use(koaLogger((str, args) => {
  logger.debug(str)
}))

app.use(serve(react))
app.use(router.routes())

router.get('/', serve(path.join(react, 'index.html')))
router.use('/api', api.routes())
