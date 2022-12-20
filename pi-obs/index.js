'use strict'

const { spawn } = require('child_process')
const { Gpio } = require('onoff')
const { Device, delay } = require('@furious/furidev')

const led = new Gpio(4, 'out')

const id = 3
const secret = '9q7XbksL4gNtxYW++GiC3BhEV6SYOIR2zjIJDujaaMXQgqrZ7E27FrQeLY/h7QeuXEAxFPED3Nviufr6Zl5oxyCPQlhp6oxpXsMkldUNw7AwFPXl6/dpcUeKMZFA6uEsz8R+vT7tURanT7CuJiYVe5g0w+vFCfThrLENk3jfzYg='

const device = new Device(id, secret)

led.writeSync(1)

device.listenControl('LED 켜기', () => {
  console.log('LED가 켜집니다')
  led.writeSync(1)
})
device.listenControl('LED 끄기', () => {
  console.log('LED가 꺼집니다')
  led.writeSync(0)
})

device.connect(async () => {
  while (true) {
    await delay(5000)

    const { stdout } = spawn('raspistill', ['-w', '640', '-h', '480', '-q', '5', '-o', '-'])
    const buffer = await streamToBuffer(stdout)

    const data = ['data:image/jpg;base64,', buffer.toString('base64')].join('')
    await device.sendSensor('카메라', data)
  }
})

function streamToBuffer(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', err => reject(err))
    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}
