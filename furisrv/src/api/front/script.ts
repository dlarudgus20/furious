import Router from 'koa-router'
import { DeviceInfo } from 'furitype'
import { AuthInfo } from '../../types/auth'
import { getTransaction } from '../../db'
import { logger } from '../../logger'

export interface DeviceDescript {
  info: DeviceInfo
  sensors: any[]
  controls: any[]
}

export interface ScriptDescript {
  id: number
  ownerId: number
  name: string
  isEnabled: boolean
  script: string
  devices: DeviceDescript[]
}

export interface ScriptInfo {
  id: number
  ownerId: number
  name: string
  isEnabled: boolean
  script: string
  devices: number[]
}

const router = new Router()

router.get('/list', async ctx => {

})

router.get('/info/:id', async ctx => {

})

router.post('/modify/:id', async ctx => {

})

router.get('/check/:id', async ctx => {

})

router.post('/enable/:id', async ctx => {

})

router.post('/disable/:id', async ctx => {

})

export default router
