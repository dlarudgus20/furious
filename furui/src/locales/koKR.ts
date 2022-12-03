import { Localization } from '../Localization'
import enUS from './enUS'

const koKR: Localization = {
  ...enUS,
  possesive(str?: string) {
    if (!str) {
      return ''
    } else {
      return str + "의"
    }
  }
}

export default koKR
