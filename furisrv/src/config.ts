import os from 'os'
import path from 'path'
import dotenv from 'dotenv'

function config() {
  const candidates = [
    {
      conf: process.argv[2] || '',
      db: process.argv[3] || '/etc/furisrv/furisrv.db',
    },
    {
      conf: '/etc/furisrv/config.env',
      db: '/etc/furisrv/furisrv.db',
    },
    {
      conf: path.resolve(os.homedir(), '.config/furious/furisrv/config.env'),
      db: path.resolve(os.homedir(), '.config/furious/furisrv/furisrv.db'),
    },
    {
      conf: path.resolve(__dirname, '../.env'),
      db: path.resolve(__dirname, '../etc/furisrv.db'),
    },
  ]

  let confFile = null
  let dbFile = '/etc/furisrv/furisrv.db'

  for (const { conf, db } of candidates) {
    if (!conf) {
      continue
    }

    const { error } = dotenv.config({ path: conf })
    if (!error) {
      confFile = conf
      dbFile = db
      break
    }
  }

  if (confFile) {
    console.log(`furisrv: config file - ${confFile}`)
  } else {
    console.error('furisrv: cannot find config file')
  }

  dbFile = process.env.DB_FILE || dbFile
  if (dbFile) {
    console.log(`furisrv: database file - ${dbFile}`)
    process.env.DB_FILE = dbFile
  } else {
    console.error('furisrv: cannot find database file')
  }
}

config()

export const CONFIG = {
  PORT: process.env.PORT || 8080,
  FURUI_PUBLIC: process.env.FURUI_PUBLIC || '../../furui/build',
  SESSION_SECRET: process.env.SESSION_SECRET || 'wlBPZDPP8s',
  DB_FILE: process.env.DB_FILE || '',
}

Object.freeze(CONFIG)
