import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import sqlite3 from 'sqlite3'
import { Database as SqliteDatabase } from 'sqlite'
import PQueue from 'p-queue'
import { CONFIG } from './config'
import { logger } from './logger'

type SqlDb = SqliteDatabase<sqlite3.Database, sqlite3.Statement>

const dbFilename = path.resolve(CONFIG.DB_FILE)
const dbDirectory = path.dirname(dbFilename)

const schemaFilename = path.join(__dirname, '../schema.sql')

const initializer = new PQueue({ concurrency: 1 })

export async function getTransaction<T>(fn: (conn: SqlDb) => Promise<T>) {
  const conn = await initializer.add(async () => {
    const exists = await fs.promises.access(dbFilename, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false)

    const conn = new SqliteDatabase({
        filename: dbFilename,
        driver: sqlite3.Database,
      })

    await mkdirp(dbDirectory)
    await conn.open()

    if (!exists) {
      logger.info('create initial database')

      await conn.run('BEGIN;')
      try {
        const definition = await fs.promises.readFile(schemaFilename, 'utf8')
        await conn.exec(definition)
        await conn.run('COMMIT;')
      } catch (err) {
        await conn.run('ROLLBACK;')
        await conn.close()
        throw err
      }
    }

    return conn
  })

  let ret: T

  await conn.run('BEGIN;')
  try {
    ret = await fn(conn)
    await conn.run('COMMIT;')
  } catch (err) {
    await conn.run('ROLLBACK;')
    throw err
  } finally {
    await conn.close()
  }

  return ret
}

export function initializeDatabase() {
  return getTransaction(async () => {})
}
