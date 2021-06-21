import path from 'path'
import mkdirp from 'mkdirp'
import sqlite3 from 'sqlite3'
import { Database as SqliteDatabase } from 'sqlite'

type SqlDb = SqliteDatabase<sqlite3.Database, sqlite3.Statement>

const directory = path.join(__dirname, '../etc')
const filename = path.join(directory, 'furisrv.db')

const definition = String.raw`
CREATE TABLE IF NOT EXISTS Users (
  Id INT PRIMARY KEY,
  Password TEXT NOT NULL
);
`

let initialized = false

async function use<T>(fn: (db: SqlDb) => Promise<T>) {
  const db = new SqliteDatabase({
    filename,
    driver: sqlite3.cached.Database,
  })

  let ret: T

  await mkdirp(directory)
  await db.open()

  await db.run('BEGIN;')
  try {
    ret = await fn(db)
    await db.run('COMMIT;')
  } catch (err) {
    await db.run('ROLLBACK;')
    throw err
  } finally {
    await db.close()
  }

  return ret
}

export function useDatabase<T>(fn: (db: SqlDb) => Promise<T>) {
  if (!initialized) {
    throw new Error('Database is not initialized')
  }

  return use(fn)
}

export async function initializeDatabase() {
  await use(async db => {
    db.run(definition)
  })
  initialized = true
}
