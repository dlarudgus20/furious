import EventSource from 'eventsource'
import axios from 'axios'
import axiosCookieJarSupport from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import PQueue from 'p-queue'
import { DeviceDescript, BootEvent, Event, ControlInfo } from 'furitype'
import { logger } from './logger'

type Timeout = ReturnType<typeof setTimeout>

type Listener = () => (Promise<unknown> | unknown);

const baseURL = process.env.FURI_SERVER || 'http://localhost:8080'
const retryInterval = 20000

axiosCookieJarSupport(axios)

export const delay = (ms: number) => new Promise<void>(resolve => setTimeout(() => resolve(), ms))

function tryParseJSON(str: string) {
  try {
    const o = JSON.parse(str)

    if (o && typeof o === 'object') {
      return o
    }
  } catch {}

  return null
}

export class Device {
  private cookieJar = new CookieJar()

  private config = {
    baseURL,
    jar: this.cookieJar,
    withCredentials: true,
  }

  private sse: EventSource | null = null

  private descript: DeviceDescript | null = null

  private retrying: Timeout | null = null

  private disposed = false

  private queue = new PQueue({ concurrency: 1 })

  private listenerMap = new Map<string, Listener[]>()

  constructor(private id: number, private secret: string) {}

  private async auth() {
    await axios.post('/api/device/auth', { id: this.id, pw: this.secret }, this.config)
  }

  private openSSE(cookie: string) {
    return new Promise<DeviceDescript>((resolve, reject) => {
      const sse = new EventSource(`${baseURL}/api/device/start`, {
        headers: { 'Cookie': cookie }
      })

      sse.onopen = e => {
        logger.info('sse connected')
        this.sse = sse
      }

      sse.onerror = e => {
        sse.close()
        reject(new Error('sse disconnected'))

        if (sse === this.sse) {
          this.sse = null
          this.onDisconnect()
        }
      }

      sse.onmessage = async e => {
        if (e.data === 'open' || e.data === '') {
          // ping
        } else {
          const event = tryParseJSON(e.data)
          if (event) {
            if (event.type === 'boot') {
              resolve(event.descript)
            } else {
              logger.debug(`received: ${e.data}`)
              this.queue.add(() => this.onReceive(event as Event))
            }
          } else {
            logger.info(`unknown sse message: ${e.data}`)
          }
        }
      }
    })
  }

  async connect(callback?: () => Promise<void> | void) {
    await this.auth()
    logger.info('authentication succeed')

    const cookie = await this.cookieJar.getCookieString(baseURL)

    this.descript = await this.openSSE(cookie)
    logger.info('connection established')

    if (callback) {
      await Promise.resolve(callback())
    }
  }

  sendSensor(name: string, value: any) {
    const str = typeof value === 'object' ? JSON.stringify(value) : `${value}`

    return this.queue.add(async () => {
      if (this.sse === null || this.descript === null) {
        return false
      }

      const info = this.descript.sensors.find(x => x.name === name)
      if (!info) {
        return false
      }

      try {
        await axios.post(`/api/device/sensor/${info.id}`, { value: str }, this.config)
        return true
      } catch (err) {
        logger.error(`sendSensor() error: ${err.stack}`)
        return false
      }
    })
  }

  listenControl(name: string, listener: Listener) {
    const list = this.listenerMap.get(name) || []

    if (list.length === 0) {
      this.listenerMap.set(name, list)
    }

    list.push(listener)
  }

  unlistenControl(name: string, listener: Listener) {
    const list = this.listenerMap.get(name) || []

    while (true) {
      const index = list.findIndex(x => x === listener)
      if (index < 0) {
        break
      }
      list.splice(index, 1)
    }
  }

  private onControlPress(info: ControlInfo) {
    const list = this.listenerMap.get(info.name) || []

    for (const listener of list) {
      this.queue.add(async () => {
        try {
          await Promise.resolve(listener())
        } catch (err) {
          logger.error(`Control ${info.name} handler error: ${err.stack}`)
        }
      })
    }

    this.queue.add(async () => {
      try {
        await axios.post(`/api/device/control/${info.id}/unpress`, {}, this.config)
      } catch (err) {
        logger.error(`control unpress error: ${err.stack}`)
      }
    })
  }

  dispose() {
    this.disposed = true
    this.sse?.close()
    if (this.retrying !== null) {
      clearInterval(this.retrying)
      this.retrying = null
    }
  }

  private onDisconnect() {
    logger.info('device disconnected')
    if (this.disposed) {
      return
    }

    this.retrying = setInterval(async () => {
      if (this.disposed && this.retrying !== null) {
        clearInterval(this.retrying)
        this.retrying = null
      } else {
        try {
          await this.connect()
          if (this.retrying !== null) {
            clearInterval(this.retrying)
            this.retrying = null
          }
        } catch { }
      }
    }, retryInterval)
  }

  private onReceive(data: Event) {
    if (this.sse === null || this.descript === null) {
      return
    }

    const { sensors, controls } = this.descript

    if (data.type === 'sensor') {
      switch (data.subtype) {
        case 'create': {
          const index = sensors.findIndex(x => x.id === data.info.id)
          if (index >= 0) {
            logger.error('sensor-create: duplicated id')
            sensors.splice(index, 1)
          }
          sensors.push(data.info)
          break
        }
        case 'delete': {
          const index = sensors.findIndex(x => x.id === data.sid)
          if (index >= 0) {
            sensors.splice(index, 1)
          } else {
            logger.error('sensors: device descript mismatch')
          }
          break
        }
        case 'rename': {
          const info = sensors.find(x => x.id === data.sid)
          if (info) {
            info.name = data.name
          } else {
            logger.error('sensors: device descript mismatch')
          }
          break
        }
        case 'value':
          // don't care
          break
      }
    } else if (data.type === 'control') {
      switch (data.subtype) {
        case 'create': {
          const index = controls.findIndex(x => x.id === data.info.id)
          if (index >= 0) {
            logger.error('control-create: duplicated id')
            controls.splice(index, 1)
          }
          controls.push(data.info)
          break
        }
        case 'delete': {
          const index = controls.findIndex(x => x.id === data.cid)
          if (index >= 0) {
            controls.splice(index, 1)
          } else {
            logger.error('controls: device descript mismatch')
          }
          break
        }
        case 'rename': {
          const info = controls.find(x => x.id === data.cid)
          if (info) {
            info.name = data.name
          } else {
            logger.error('controls: device descript mismatch')
          }
          break
        }
        case 'press': {
          const info = controls.find(x => x.id === data.cid)
          if (info) {
            info.pressed = data.press
            if (data.press) {
              this.onControlPress(info)
            }
          } else {
            logger.error('controls: device descript mismatch')
          }
          break
        }
      }
    }
  }
}
