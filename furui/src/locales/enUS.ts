import { Localization } from '../Localization'

const enUS: Localization = {
  possesive(str?: string) {
    if (!str) {
      return ''
    } else if (str[str.length - 1] === 's') {
      return str + "'"
    } else {
      return str + "'s"
    }
  }
}

export default enUS
