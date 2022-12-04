import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, Theme, StyledEngineProvider, adaptV4Theme } from '@mui/material/styles'
import * as MuiLocales from '@mui/material/locale'
import { Localization } from '../Localization'
import MyLocales, { SupportedLocales } from '../locales'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme(adaptV4Theme({
  typography: {
    fontFamily: [
      'Arial',
      'sans-serif'
    ].join(',')
  },
}))

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
    () => createTheme(adaptV4Theme(theme), MuiLocales[context.locale]),
    [context.locale])

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themeWithLocale}>
        <ThemeContext.Provider value={context}>
          {props.children}
        </ThemeContext.Provider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export const Consumer = ThemeContext.Consumer
