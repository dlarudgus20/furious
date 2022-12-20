'use strict'

const { Device, delay } = require('@furious/furidev')
const util = require('util')
const dotenv = require('dotenv')
const wol = require('wake_on_lan')
const ping = require('ping')

const wake = util.promisify(wol.wake)

dotenv.config()

const id = process.env.DEVICE_ID
const secret = process.env.DEVICE_SECRET
const broadcast = process.env.TARGET_BROADCAST || '255.255.255.255'
const ip = process.env.TARGET_IP
const mac = process.env.TARGET_MAC

const device = new Device(id, secret)

device.listenControl('컴퓨터 켜기', async () => {
  if (await isAlive()) {
    console.log('컴퓨터 켜기: 이미 켜져있음')
    device.sendSensor('컴퓨터 상태', '켜짐')
  } else {
    turnOn()
  }
})

device.connect(async () => {
  console.log(`시작 IP=${ip} MAC=${mac} BR=${broadcast}`)

  while (true) {
    await delay(5000)

    device.sendSensor('컴퓨터 상태', await isAlive() ? '켜짐' : '꺼짐')
  }
})

async function turnOn() {
  console.log(`컴퓨터 켜기: WOL wake ${mac} (broadcast: ${broadcast})`)

  await wake(mac, { address: broadcast })
}

async function isAlive() {
  const res = await ping.promise.probe([ip])
  return res.alive
}
