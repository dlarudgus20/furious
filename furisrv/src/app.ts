import path from 'path'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import session from 'koa-session'
import serve from 'koa-static'
import send from 'koa-send'
import koaLogger from 'koa-logger'
import { CONFIG } from './config'
import { MemoryStore } from './MemoryStore'
import apiFrontAuth from './api/front/auth'
import apiFrontDev from './api/front/dev'
import apiFrontScript from './api/front/script'
import apiDevice from './api/device'
import { logger } from './logger'

const react = path.resolve(__dirname, CONFIG.FURUI_PUBLIC)

export const app = new Koa()

const router = new Router()

app.keys = [CONFIG.SESSION_SECRET]

// uncaught exceptions
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof Error) {
      logger.error(err.stack)
    } else {
      logger.error(err)
    }
    throw err
  }
})

app.use(bodyParser())

app.use(koaLogger((str, args) => {
  logger.debug(str)
}))

app.use(session({
  store: new MemoryStore(),
}, app))

app.use(serve(react))
app.use(router.routes())

router.use('/api/front/auth', apiFrontAuth.routes())
router.use('/api/front/dev', apiFrontDev.routes())
router.use('/api/front/script', apiFrontScript.routes())
router.use('/api/device', apiDevice.routes())

// react-router-dom will process further routing
router.get(/^\/(?!api).*$/, async ctx => {
  await send(ctx, 'index.html', { root: react })
})
