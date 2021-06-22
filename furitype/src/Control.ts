
export interface ControlInfo {
  id: number
  deviceId: number
  name: string
  pressed: boolean
}

export interface NewControlInfo {
  deviceId: number
  name: string
}

export function isNewControlInfo(x: any): x is NewControlInfo {
  return typeof x === 'object'
    && typeof x.deviceId === 'number'
    && typeof x.name === 'string'
    && x.name
}

export function isControlInfo(x: ControlInfo | NewControlInfo): x is ControlInfo {
  return typeof (x as any).id === 'number'
}
