import enUS from './enUS'
import koKR from './koKR'

const MyLocales = {
  enUS,
  koKR,
}

export default MyLocales
export type SupportedLocales = keyof typeof MyLocales
