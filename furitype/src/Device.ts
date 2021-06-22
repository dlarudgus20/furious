import { SensorInfo } from './Sensor'
import { ControlInfo } from './Control'

export interface DeviceInfo {
  id: number
  ownerId: number
  name: string
  isOnline: boolean
}

export interface DeviceDescript extends DeviceInfo {
  sensors: SensorInfo[]
  controls: ControlInfo[]
}
