import crypto from 'crypto'
import { promisify } from 'util'
import { PassThrough } from 'stream'
import Router from 'koa-router'
import {
  DeviceInfo, SensorInfo, NewSensorInfo, ControlInfo, NewControlInfo,
  isNewSensorInfo, isNewControlInfo
} from 'furitype'
import { getTransaction } from '../../db'
import { AuthInfo } from '../../types/auth'
import { addListener, fireEvent } from '../../event'

const randomBytes = promisify(crypto.randomBytes)

const router = new Router()

router.get('/event/:id', async ctx => {
  if (ctx.accepts('text/event-stream')) {
    const auth: AuthInfo | undefined = ctx.session?.auth
    const id = parseInt(ctx.params.id)

    if (!auth) {
      ctx.throw(401)
      return
    }
    if (!id) {
      ctx.throw(400)
      return
    }

    await getTransaction(async conn => {
      const rows = await conn.all('SELECT Id FROM Devices WHERE Id = ? AND OwnerId = ?;', id, auth.id)

      if (rows.length === 0) {
        ctx.throw(401)
      }
    })

    const stream = new PassThrough()

    ctx.type = 'text/event-stream'
    ctx.set('Cache-Control', 'no-cache')
    ctx.set('Connection', 'Keep-Alive')
    ctx.body = stream

    addListener(id, stream)

  } else {
    ctx.status = 415 // Unsupported Media
  }
})

router.get('/info/:id', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const id = parseInt(ctx.params.id)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!id) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all('SELECT Id, OwnerId, Name, IsOnline FROM Devices WHERE Id = ? AND OwnerId = ?;', id, auth.id)

    if (rows.length === 0) {
      ctx.throw(401)
    }

    const info: DeviceInfo = {
      id: rows[0].Id,
      ownerId: rows[0].OwnerId,
      name: rows[0].Name,
      isOnline: !!rows[0].IsOnline,
    }
    ctx.body = info
  })
})

router.get('/list', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  if (!auth) {
    ctx.throw(401)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all('SELECT Id, OwnerId, Name, IsOnline FROM Devices WHERE OwnerId = ?;', auth.id)

    const list: DeviceInfo[] = rows.map(row => ({
      id: row.Id,
      ownerId: row.OwnerId,
      name: row.Name,
      isOnline: !!row.isOnline,
    }))
    ctx.body = list
  })
})

router.get('/secret/:id', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const id = parseInt(ctx.params.id)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!id) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all('SELECT Password FROM Devices WHERE Id = ? AND OwnerId = ?;', id, auth.id)

    if (rows.length === 0) {
      ctx.throw(401)
    }

    const info = {
      secret: rows[0].Password,
    }
    ctx.body = info
  })
})

router.post('/new', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const { name } = ctx.request.body as { name: string }

  if (!auth) {
    ctx.throw(401)
    return
  }

  const password = (await randomBytes(128)).toString('base64')

  await getTransaction(async conn => {
    const result = await conn.run('INSERT INTO Devices ( Password, OwnerId, Name ) VALUES ( ?, ?, ? );', password, auth.id, name)
    const id = result.lastID

    if (!id) {
      ctx.throw(409)
      return
    }

    const info: DeviceInfo = {
      id,
      ownerId: auth.id,
      name,
      isOnline: false,
    }

    ctx.body = info
  })
})

router.post('/changeName/:id', async ctx => {
  const { name } = ctx.request.body as { name: string }
  const auth: AuthInfo | undefined = ctx.session?.auth

  const id = parseInt(ctx.params.id)

  if (!name || !id) {
    ctx.throw(400)
    return
  }
  if (!auth) {
    ctx.throw(401)
    return
  }

  await getTransaction(async conn => {
    try {
      const result = await conn.run('UPDATE Devices SET Name = ? WHERE Id = ? AND OwnerId = ?;', name, id, auth.id)

      if (result.changes === 0) {
        ctx.throw(404)
      }

      auth.name = name
      ctx.body = ''
    } catch (err) {
      ctx.throw(400, err)
    }
  })
})

router.get('/sensors/:dvid/list', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all(
      'SELECT Sensors.Id as Id, DeviceId, Sensors.Name as Name, Value, LastUpdated'
        + ' FROM Sensors JOIN Devices ON Sensors.DeviceId = Devices.Id'
        + ' WHERE Devices.OwnerId = ? AND Devices.Id = ?;',
      auth.id, dvid)

    const list: SensorInfo[] = rows.map(row => ({
      id: row.Id,
      deviceId: row.DeviceId,
      name: row.Name,
      value: row.Value,
      lastUpdated: row.LastUpdated,
    }))

    ctx.body = list
  })
})

router.get('/sensors/:dvid/info/:sid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const sid = parseInt(ctx.params.sid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !sid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all(
      'SELECT Sensors.Id as Id, DeviceId, Sensors.Name as Name, Value, LastUpdated'
        + ' FROM Sensors JOIN Devices ON Sensors.DeviceId = Devices.Id'
        + ' WHERE Devices.OwnerId = ? AND Devices.Id = ? AND Sensors.Id = ?;',
      auth.id, dvid, sid)

    if (rows.length === 0) {
      ctx.throw(404)
    }

    const info: SensorInfo ={
      id: rows[0].Id,
      deviceId: rows[0].DeviceId,
      name: rows[0].Name,
      value: rows[0].Value,
      lastUpdated: rows[0].LastUpdated,
    }

    ctx.body = info
  })
})

router.post('/sensors/:dvid/create', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !isNewSensorInfo(ctx.request.body)) {
    ctx.throw(400)
    return
  }

  const info: NewSensorInfo = ctx.request.body

  await getTransaction(async conn => {
    const result = await conn.run(
      'INSERT INTO Sensors ( DeviceId, Name, Value ) VALUES ( ?, ?, ? );',
      info.deviceId, info.name, info.value)

    if (!result.lastID) {
      ctx.throw(409)
      return
    }

    const created: SensorInfo = {
      ...info,
      id: result.lastID,
      lastUpdated: null,
    }

    fireEvent(dvid, { type: 'sensor', subtype: 'create', info: created })

    ctx.body = created
  })
})

router.post('/sensors/:dvid/delete/:sid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const sid = parseInt(ctx.params.sid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !sid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'DELETE FROM Sensors WHERE Id = ? AND Id IN ('
        + ' SELECT Sensors.Id FROM Devices JOIN Sensors ON Devices.Id = Sensors.DeviceId'
        + ' WHERE Devices.Id = ? AND Devices.OwnerId = ?);',
      sid, dvid, auth.id)

    if (result.changes === 0) {
      ctx.throw(404)
    }

    fireEvent(dvid, { type: 'sensor', subtype: 'delete', sid })

    ctx.body = ''
  })
})

router.post('/sensors/:dvid/changeName/:sid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const sid = parseInt(ctx.params.sid)

  const { name } = ctx.request.body as { name?: string }

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !sid || !name || typeof name !== 'string') {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'UPDATE Sensors SET Name = ? WHERE Id = ? AND Id IN ('
        + 'SELECT Sensors.Id FROM Sensors JOIN Devices ON Sensors.DeviceId = Devices.Id '
        + ' WHERE Devices.Id = ? AND Devices.OwnerId = ?);',
      name, sid, dvid, auth.id)

    if (result.changes === 0) {
      ctx.throw(400)
    }

    fireEvent(dvid, { type: 'sensor', subtype: 'rename', sid, name })

    ctx.body = ''
  })
})

router.get('/controls/:dvid/list', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all(
      'SELECT Controls.Id as Id, DeviceId, Controls.Name as Name, Pressed, LastUnpress'
        + ' FROM Controls JOIN Devices ON Controls.DeviceId = Devices.Id'
        + ' WHERE Devices.OwnerId = ? AND Devices.Id = ?;',
      auth.id, dvid)

    const list: ControlInfo[] = rows.map(row => ({
      id: row.Id,
      deviceId: row.DeviceId,
      name: row.Name,
      pressed: !!row.Pressed,
      lastUnpress: row.LastUnpress
    }))

    ctx.body = list
  })
})

router.get('/controls/:dvid/info/:cid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const cid = parseInt(ctx.params.cid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !cid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all(
      'SELECT Controls.Id as Id, DeviceId, Controls.Name as Name, Pressed, LastUnpress'
        + ' FROM Controls JOIN Devices ON Controls.DeviceId = Devices.Id'
        + ' WHERE Devices.OwnerId = ? AND Devices.Id = ? AND Controls.Id = ?;',
      auth.id, dvid, cid)

    if (rows.length === 0) {
      ctx.throw(404)
    }

    const info: ControlInfo ={
      id: rows[0].Id,
      deviceId: rows[0].DeviceId,
      name: rows[0].Name,
      pressed: !!rows[0].Pressed,
      lastUnpress: rows[0].LastUnpress,
    }

    ctx.body = info
  })
})

router.post('/controls/:dvid/create', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !isNewControlInfo(ctx.request.body)) {
    ctx.throw(400)
    return
  }

  const info: NewControlInfo = ctx.request.body

  await getTransaction(async conn => {
    const result = await conn.run(
      'INSERT INTO Controls ( DeviceId, Name ) VALUES ( ?, ? );',
      info.deviceId, info.name)

    if (!result.lastID) {
      ctx.throw(409)
      return
    }

    const created: ControlInfo = {
      ...info,
      id: result.lastID,
      pressed: false,
      lastUnpress: null,
    }

    fireEvent(dvid, { type: 'control', subtype: 'create', info: created })

    ctx.body = created
  })
})

router.post('/controls/:dvid/delete/:cid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const cid = parseInt(ctx.params.cid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !cid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'DELETE FROM Controls WHERE Id = ? AND Id IN ('
        + ' SELECT Controls.Id FROM Devices JOIN Controls ON Devices.Id = Controls.DeviceId'
        + ' WHERE Devices.Id = ? AND Devices.OwnerId = ?);',
      cid, dvid, auth.id)

    if (result.changes === 0) {
      ctx.throw(404)
    }

    fireEvent(dvid, { type: 'control', subtype: 'delete', cid })

    ctx.body = ''
  })
})

router.post('/controls/:dvid/changeName/:cid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const cid = parseInt(ctx.params.cid)

  const { name } = ctx.request.body as { name?: string }

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !cid || !name || typeof name !== 'string') {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'UPDATE Controls SET Name = ? WHERE Id = ? AND Id IN ('
        + 'SELECT Controls.Id FROM Controls JOIN Devices ON Controls.DeviceId = Devices.Id '
        + ' WHERE Devices.Id = ? AND Devices.OwnerId = ?);',
      name, cid, dvid, auth.id)

    if (result.changes === 0) {
      ctx.throw(400)
    }

    fireEvent(dvid, { type: 'control', subtype: 'rename', cid, name })

    ctx.body = ''
  })
})

router.post('/controls/:dvid/press/:cid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const cid = parseInt(ctx.params.cid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !cid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const rows = await conn.all(
      'SELECT Controls.Id as Id, Pressed'
        + ' FROM Controls JOIN Devices ON Controls.DeviceId = Devices.Id'
        + ' WHERE Devices.OwnerId = ? AND Devices.Id = ? AND Controls.Id = ?;',
      auth.id, dvid, cid)

    if (rows.length === 0) {
      ctx.throw(404)
    }

    const prevPressed = !!rows[0].Pressed
    if (!prevPressed) {
      const result = await conn.run('UPDATE Controls SET Pressed = 1 WHERE Id = ?', cid)

      if (result.changes === 0) {
        ctx.throw(404)
      }

      fireEvent(dvid, { type: 'control', subtype: 'press', cid, press: true })

      ctx.body = ''
    } else {
      ctx.status = 304  // Not Modified
      ctx.body  = ''
    }
  })
})

router.post('/controls/:dvid/clearLastUnpress/:cid', async ctx => {
  const auth: AuthInfo | undefined = ctx.session?.auth

  const dvid = parseInt(ctx.params.dvid)
  const cid = parseInt(ctx.params.cid)

  if (!auth) {
    ctx.throw(401)
    return
  }
  if (!dvid || !cid) {
    ctx.throw(400)
    return
  }

  await getTransaction(async conn => {
    const result = await conn.run(
      'UPDATE Controls SET LastUnpress = NULL '
        + 'WHERE Id = ? AND LastUnpress IS NOT NULL AND Id IN ('
        + 'SELECT Controls.Id FROM Controls JOIN Devices ON Controls.DeviceId = Devices.Id '
        + 'WHERE Devices.Id = ? AND Devices.OwnerId = ?);',
      cid, dvid, auth.id)

    if (result.changes === 0) {
      ctx.throw(400)
    }

    fireEvent(dvid, { type: 'control', subtype: 'clearLastUnpress', cid })

    ctx.body = ''
  })
})

export default router
