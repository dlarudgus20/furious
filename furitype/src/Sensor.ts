export interface SensorInfo {
  id: number
  deviceId: number
  name: string
  value: string
  lastUpdated: number | null
}

export interface NewSensorInfo {
  deviceId: number
  name: string
  value: string
}

export function isNewSensorInfo(x: any): x is NewSensorInfo {
  return typeof x === 'object'
    && typeof x.deviceId === 'number'
    && typeof x.name === 'string'
    && typeof x.value === 'string'
    && x.name
}

export function isSensorInfo(x: SensorInfo | NewSensorInfo): x is SensorInfo {
  return typeof (x as any).id === 'number'
}
