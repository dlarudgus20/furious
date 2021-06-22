import { Device, delay } from 'furidev'
import crypto from 'crypto'

const id = 2
const secret = 'DfqUBW2oFphhoL+pfoCultVbsiLzXoMo8nj3atIg/XnK1GJ6BsngfzWkhjIAjR+DjQ0K/UL0FA62b1Pm2A2LI/6pOhsTTpd/l5++meBX/QNYXg8ZbeGd+c1eYiNd0bJLyOAXVsmkMzPZCOxgw4Wrn4S5uyukqQTL/2O62Fv7pkg='

const device = new Device(id, secret)

device.connect(async () => {
  device.listenControl('왼쪽팔', async () => {
    console.log('/==O')
    await delay(2000)
    console.log('\\==O')
  })
  device.listenControl('오른팔', async () => {
    console.log('   O==\\')
    await delay(2000)
    console.log('   O==/')
  })

  while (true) {
    await delay(750)
    device.sendSensor('1번 센서', crypto.randomInt(10))
    await delay(750)
    device.sendSensor('2번 센서', crypto.randomInt(2))
  }
})
