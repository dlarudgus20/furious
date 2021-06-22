import crypto from 'crypto'
import { promisify } from 'util'
import Router from 'koa-router'
import { getTransaction } from '../../db'
import { logger } from '../../logger'
import { AuthInfo } from './auth'

export interface DeviceInfo {
  id: number
  ownerId: number
  name: string
  isOnline: boolean
}

const randomBytes = promisify(crypto.randomBytes)

const router = new Router()

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

export default router
