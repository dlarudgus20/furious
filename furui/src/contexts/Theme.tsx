import { createContext, useContext, useMemo, useState } from 'react'
import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles'
import * as MuiLocales from '@mui/material/locale'
import { Localization } from '../Localization'
import MyLocales, { SupportedLocales } from '../locales'

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const theme = createTheme({
  typography: {
    fontFamily: [
      'Arial',
      'sans-serif'
    ].join(',')
  },
})

interface ThemeCtxData {
  locale: SupportedLocales,
}

interface ThemeCtx extends ThemeCtxData {
  getLocalization(): Localization,
  setLocale(locale: SupportedLocales): void,
}

const defaultData: ThemeCtxData = {
  locale: 'enUS',
}

const defaultValue: ThemeCtx = {
  ...defaultData,
  getLocalization() { throw new Error() },
  setLocale(locale) { throw new Error() },
}

const ThemeContext = createContext<ThemeCtx>(defaultValue)

export const useTheme = () => useContext(ThemeContext)

export function Provider(props: any) {
  const [contextData, setContextData] = useState(defaultData)

  const context: ThemeCtx = useMemo(() => {
    return {
      ...contextData,
      getLocalization() {
        return MyLocales[this.locale]
      },
      setLocale(locale: SupportedLocales) {
        setContextData({ ...contextData, locale })
      }
    }
  }, [contextData])

  const themeWithLocale = useMemo(
    () => createTheme(theme, MuiLocales[context.locale]),
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
