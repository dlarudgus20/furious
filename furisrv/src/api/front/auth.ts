import Router from 'koa-router'
import bcrypt from 'bcrypt'
import { getTransaction } from '../../db'
import { AuthInfo } from '../../types/auth'

const saltRounds = 10

const router = new Router()

router.get('/', ctx => {
  const auth = ctx.session && ctx.session.auth
  if (auth) {
    ctx.body = auth
  } else {
    ctx.body = ''
  }
})

router.post('/signIn', async ctx => {
  const { email, pw } = ctx.request.body as { email: string, pw: string }

  await getTransaction(async conn => {
    interface Result {
      Id: number
      Email: string
      Password: string
      Name: string
    }
    const rows = await conn.all<Result[]>('SELECT Id, Email, Password, Name FROM Users WHERE Email = ?;', email)

    if (rows.length === 0) {
      ctx.throw(401)
    }

    if (!await bcrypt.compare(pw, rows[0].Password)) {
      ctx.throw(401)
    }

    const auth: AuthInfo = {
      id: rows[0].Id,
      email: rows[0].Email,
      name: rows[0].Name,
    }

    ctx.session!.auth = auth
    ctx.body = auth
  })
})

router.post('/signUp', async ctx => {
  const { email, pw, name } = ctx.request.body as { email: string, pw: string, name: string }

  await getTransaction(async conn => {
    const pwhash = await bcrypt.hash(pw, saltRounds)

    try {
      const result = await conn.run('INSERT INTO Users ( Email, Password, Name ) VALUES ( ?, ?, ? );', email, pwhash, name)
      const id = result.lastID

      if (!id) {
        ctx.throw(409)
        return
      }

      const auth: AuthInfo = {
        id,
        email,
        name,
      }

      ctx.session!.auth = auth
      ctx.body = auth
    } catch (err) {
      ctx.throw(400, err)
    }
  })
})

router.post('/changeName', async ctx => {
  const { name } = ctx.request.body as { name: string }
  const auth: AuthInfo | undefined = ctx.session?.auth

  if (!name) {
    ctx.throw(400)
    return
  }
  if (!auth) {
    ctx.throw(401)
    return
  }

  await getTransaction(async conn => {
    try {
      const result = await conn.run('UPDATE Users SET Name = ? WHERE Id = ?;', name, auth.id)

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
