import { DeviceDescript } from './Device'

export interface ScriptDescript {
  id: number
  ownerId: number
  name: string
  isEnabled: boolean
  script: string
  devices: DeviceDescript[]
}

export interface ScriptInfo {
  id: number
  ownerId: number
  name: string
  isEnabled: boolean
  script: string
  devices: number[]
}
