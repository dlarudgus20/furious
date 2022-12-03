import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles'
import * as MuiLocales from '@material-ui/core/locale'
import { Localization } from '../Localization'
import MyLocales, { SupportedLocales } from '../locales'

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Arial',
      'sans-serif'
    ].join(',')
  },
})

interface ThemeCtx {
  locale: SupportedLocales,
  getLocalization(): Localization,
  setLocale(locale: SupportedLocales): void,
}

const defaultValue: ThemeCtx = {
  locale: 'enUS',
  getLocalization() { return MyLocales[this.locale] },
  setLocale(locale) { throw new Error() },
}

const ThemeContext = createContext<ThemeCtx>(defaultValue)

export const useTheme = () => useContext(ThemeContext)

export function Provider(props: any) {
  const [context, setContext] = useState<ThemeCtx>(defaultValue)

  useEffect(() => {
    const functions: ThemeCtx = {
      ...defaultValue,
      setLocale,
    }

    function setLocale(locale: SupportedLocales) {
      setContext({ ...functions, locale })
    }

    setContext(functions)
  }, [])

  const themeWithLocale = useMemo(
    () => createMuiTheme(theme, MuiLocales[context.locale]),
    [context.locale])

  return (
    <ThemeProvider theme={themeWithLocale}>
      <ThemeContext.Provider value={context}>
        {props.children}
      </ThemeContext.Provider>
    </ThemeProvider>
  )
}

export const Consumer = ThemeContext.Consumer
