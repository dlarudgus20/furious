import { PassThrough } from 'stream'
import Router from 'koa-router'
import PQueue from 'p-queue'
import dayjs from 'dayjs'
import { DeviceInfo, DeviceDescript, SensorInfo, ControlInfo, BootEvent } from 'furitype'
import { getTransaction } from '../db'
import { logger } from '../logger'
import { addListener, fireEvent } from '../event'

const deviceMap = new Map<number, PassThrough[]>()
const queue = new PQueue({ concurrency: 1 })

const router = new Router()

function setOffline(id: number) {
  queue.add(async () => {
    const streamList = deviceMap.get(id) || []
    if (streamList.length > 0) {
      return
    }

    deviceMap.delete(id)

    try {
      await getTransaction(async conn => {
        await conn.run('UPDATE Devices SET IsOnline = 0 WHERE Id = ?;', id)
        fireEvent(id, { type: 'offline' })
      })
    } catch (err) {
      logger.error(err)
    }
  })
}

router.post('/auth', async ctx => {
  const { id, pw } = ctx.request.body as { id: number, pw: string }

  await getTransaction(async conn => {
    let rows = await conn.all('SELECT Password, OwnerId, Name, IsOnline FROM Devices WHERE Id = ?;', id)

    if (rows.length === 0) {
      ctx.throw(401)
    }

    if (rows[0].Password !== pw) {
      ctx.throw(401)
    }

    const info: DeviceInfo = {
      id,
      ownerId: rows[0].OwnerId,
      name: rows[0].Name,
      isOnline: !!rows[0].IsOnline,
    }

    ctx.session!.deviceInfo = info

    ctx.body = info
  })
})

router.get('/start', async ctx => {
  const deviceInfo: DeviceInfo | undefined = ctx.session?.deviceInfo

  if (!deviceInfo) {
    ctx.throw(401)
    return
  }

  const id = deviceInfo.id

  if (ctx.accepts('text/event-stream')) {
    await queue.add(() => getTransaction(async conn => {
      await conn.run('UPDATE Devices SET IsOnline = 1 WHERE Id = ?;', id)
      deviceInfo.isOnline = true

      let rows = await conn.all('SELECT Id, Name, Value, LastUpdated FROM Sensors WHERE DeviceId = ?', id)

      const sensors: SensorInfo[] = rows.map(row => ({
        id: row.Id,
        deviceId: id,
        name: row.Name,
        value: row.Value,
        lastUpdated: row.LastUpdated,
      }))

      rows = await conn.all('SELECT Id, Name, Pressed FROM Controls WHERE DeviceId = ?', id)

      const controls: ControlInfo[] = rows.map(row => ({
        id: row.Id,
        deviceId: id,
        name: row.Name,
        pressed: !!row.Pressed,
      }))

      const descript: DeviceDescript = {
        ...deviceInfo,
        sensors,
        controls
      }

      const stream = new PassThrough()
      ctx.type = 'text/event-stream'
      ctx.set('Cache-Control', 'no-cache')
      ctx.set('Connection', 'Keep-Alive')
      ctx.body = stream

      const boot: BootEvent = {
        type: 'boot',
        descript,
      }
      stream.write(`data: ${JSON.stringify(boot)}\n\n`)

      const streamList = deviceMap.get(id) || []
      streamList.push(stream)
      deviceMap.set(id, streamList)

      fireEvent(id, { type: 'start', info: deviceInfo })

      addListener(id, stream, () => {
        const index = streamList.findIndex(x => x === stream)
        streamList.splice(index, 1)
        if (streamList.length === 0) {
          setOffline(id)
        }
      })
    }))
  } else {
    ctx.status = 415 // Unsupported Media
  }
})

router.post('/sensor/:id', async ctx => {
  const deviceInfo: DeviceInfo | undefined = ctx.session?.deviceInfo
  const id = parseInt(ctx.params.id)
  const body = ctx.request.body

  if (!deviceInfo) {
    ctx.throw(401)
    return
  }
  if (!id) {
    ctx.throw(400)
    return
  }
  if (typeof body !== 'object' || typeof body.value !== 'string') {
    ctx.throw(400)
    return
  }

  const { value } = body

  await getTransaction(async conn => {
    const current = dayjs().unix()
    const result = await conn.run(
      'UPDATE Sensors SET Value = ?, LastUpdated = ? WHERE Id = ? AND DeviceId = ?',
      value, current, id, deviceInfo.id)

    if (result.changes === 0) {
      ctx.throw(404)
    }

    fireEvent(id, { type: 'sensor', subtype: 'value', sid: id, value: value })

    ctx.body = ''
  })
})

router.post('/control/:id/unpress', async ctx => {
  const deviceInfo: DeviceInfo | undefined = ctx.session?.deviceInfo
  const id = parseInt(ctx.params.id)

  if (!deviceInfo) {
    ctx.throw(401)
    return
  }
  if (!id) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'UPDATE Controls SET Pressed = 0 WHERE Id = ? AND DeviceId = ?',
      id, deviceInfo.id)

    if (result.changes === 0) {
      ctx.throw(404)
    }

    fireEvent(id, { type: 'control', subtype: 'press', cid: id, press: false })

    ctx.body = ''
  })
})

export default router
