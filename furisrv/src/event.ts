import { PassThrough } from 'stream'
import { Event } from '@furious/furitype'

const interval = 32000

type Listener = { ping: NodeJS.Timeout, stream: PassThrough, finalizer?: () => void }

const channelMap = new Map<number, Listener[]>()

function finalize(channel: Listener[], index: number) {
  const { ping, stream, finalizer } = channel[index]
  channel.splice(index, 1)
  clearInterval(ping)
  if (finalizer) {
    try {
      finalizer()
    } catch { }
  }
}

export function addListener(topic: number, stream: PassThrough, finalizer?: () => void) {
  const channel = (() => {
    let channel = channelMap.get(topic)
    if (!channel) {
      channel = []
      channelMap.set(topic, channel)
    }
    return channel
  })()

  const ping = setInterval(() => {
    if (stream.destroyed) {
      const idx = channel.findIndex(x => x.stream === stream)
      if (idx >= 0) {
        finalize(channel, idx)
      }
    } else {
      stream.write(':\n\n')
    }
  }, interval)

  channel.push({ ping, stream, finalizer })
  stream.write('data: open\n\n')

  stream.on('close', () => {
    const idx = channel.findIndex(x => x.stream === stream)
    if (idx >= 0) {
      finalize(channel, idx)
    }
  })
}

export function fireEvent(topic: number, data: Event) {
  const channel = channelMap.get(topic) || []
  const json = JSON.stringify(data)

  for (let idx = 0; idx < channel.length; ) {
    const { ping, stream } = channel[idx]
    if (stream.destroyed) {
      finalize(channel, idx)
    } else {
      try {
        stream.write(`data: ${json}\n\n`)
        ++idx
      } catch {
        stream.destroy()
        finalize(channel, idx)
      }
    }
  }
}
