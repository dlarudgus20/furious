import Router from 'koa-router'
import { logger } from './logger'

const router = new Router()

router.get('/', ctx => {
  ctx.body = 'hello furisrv'
})

export default router
