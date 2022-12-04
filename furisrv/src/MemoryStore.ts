// https://github.com/kalvinarts/koa-session-memory/blob/master/index.js
import { EventEmitter } from 'events'
import { stores, Session } from 'koa-session'

export class MemoryStore extends EventEmitter implements stores {
  private sessions: { [key: string]: any } = {}

  get(key: string, maxAge: number | 'session' | undefined, data: { rolling: boolean | undefined }) {
    return this.sessions[key]
  }

  set(key: string,
    session: Partial<Session> & { _expire?: number | undefined; _maxAge?: number | undefined },
    maxAge: number | 'session' | undefined,
    data: { changed: boolean; rolling: boolean | undefined }) {
    if (data.changed) {
      this.sessions[key] = session
      this.emit('changed', {
        key,
        session,
      })
    }
  }

  destroy(key: string) {
    delete this.sessions[key]
  }
}
