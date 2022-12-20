import path from 'path'
import dotenv from 'dotenv'

function config() {
  const candidates = [
    process.argv[2] || '',
    '/etc/furisrv/config.env',
    path.resolve(__dirname, '../.env'),
  ]

  let file = null

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const { error } = dotenv.config({ path: candidate })
    if (!error) {
      file = candidate
      break
    }
  }

  if (file) {
    console.log(`furidev: config file - ${file}`)
  } else {
    console.error('furidev: cannot find config file')
  }
}

config()

export const CONFIG = {
  PORT: process.env.PORT || 8080,
  FURUI_PUBLIC: process.env.FURUI_PUBLIC || '../../furui/build',
  SESSION_SECRET: process.env.SESSION_SECRET || 'wlBPZDPP8s',
}

Object.freeze(CONFIG)
