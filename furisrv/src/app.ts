import path from 'path'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import session from 'koa-session'
import serve from 'koa-static'
import send from 'koa-send'
import koaLogger from 'koa-logger'
import apiFrontAuth from './api/front/auth'
import apiFrontDev from './api/front/dev'
import { logger } from './logger'

const react = path.join(__dirname, '../../furui/build')

export const app = new Koa()

const router = new Router()

app.keys = ['wlBPZDPP8s']

app.use(bodyParser())

app.use(koaLogger((str, args) => {
  logger.debug(str)
}))

app.use(session({ }, app))

app.use(serve(react))
app.use(router.routes())

router.use('/api/front/auth', apiFrontAuth.routes())
router.use('/api/front/dev', apiFrontDev.routes())

// react-router-dom will process further routing
router.get(/^\/(?!api).*$/, async ctx => {
  await send(ctx, 'index.html', { root: react })
})
