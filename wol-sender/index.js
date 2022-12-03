'use strict'

const { Device, delay } = require('furidev')
const dotenv = require('dotenv')
const ping = require('ping')

dotenv.config()

const id = process.env.DEVICE_ID
const secret = process.env.DEVICE_SECRET
const ip = process.env.TARGET_IP

const device = new Device(id, secret)

device.connect(async () => {
  device.listenControl('컴퓨터 켜기', () => {
    turnOn()
  })

  while (true) {
    await delay(5000)

    device.sendSensor('컴퓨터 상태', isAlive() ? '켜짐' : '꺼짐')
  }
})

async function turnOn() {
  console.log('(컴퓨터 켜기)')
}

async function isAlive() {
  const res = await ping.promise.probe([ip])
  return res.alive
}
