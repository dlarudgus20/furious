import { DeviceDescript, DeviceInfo } from './Device'
import { SensorInfo } from './Sensor'
import { ControlInfo } from './Control'

// this is not a regular event
// When a device make connection to the server,
// it gets BootEvent instaed of StartEvent
export type BootEvent = {
  type: 'boot'
  descript  : DeviceDescript
}

type StartEvent = {
  type: 'start'
  info: DeviceInfo
}

type OfflineEvent = {
  type: 'offline'
}

type SensorValueEvent = {
  type: 'sensor'
  subtype: 'value'
  sid: number
  value: string
}

type SensorRenameEvent = {
  type: 'sensor'
  subtype: 'rename'
  sid: number
  name: string
}

type SensorCreationEvent = {
  type: 'sensor'
  subtype: 'create'
  info: SensorInfo
}

type SensorDeleteEvent = {
  type: 'sensor'
  subtype: 'delete'
  sid: number
}

type ControlPressEvent = {
  type: 'control'
  subtype: 'press'
  cid: number
  press: boolean
}

type ControlRenameEvent = {
  type: 'control'
  subtype: 'rename'
  cid: number
  name: string
}

type ControlCreationEvent = {
  type: 'control'
  subtype: 'create'
  info: ControlInfo
}

type ControlDeleteEvent = {
  type: 'control'
  subtype: 'delete'
  cid: number
}

export type Event =
  | StartEvent | OfflineEvent
  | SensorValueEvent | SensorRenameEvent | SensorCreationEvent | SensorDeleteEvent
  | ControlPressEvent | ControlRenameEvent | ControlCreationEvent | ControlDeleteEvent
