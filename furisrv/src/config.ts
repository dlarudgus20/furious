import dotenv from 'dotenv'

dotenv.config()

export const CONFIG = {
  PORT: process.env.PORT || 8080,
  FURUI_PUBLIC: process.env.FURUI_PUBLIC || '../../furui/build',
  SESSION_SECRET: process.env.SESSION_SECRET || 'wlBPZDPP8s',
}

Object.freeze(CONFIG)
