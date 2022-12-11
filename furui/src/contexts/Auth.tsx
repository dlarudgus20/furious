import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import axios from 'axios'

interface AuthInfo {
  id: number
  name: string
  email: string
}

interface AuthCtxData {
  initialized: boolean
  userInfo?: AuthInfo
}

interface AuthCtx extends AuthCtxData {
  signIn(email: string, pw: string): Promise<boolean>
  signUp(email: string, pw: string, name: string): Promise<boolean>
  changeName(name: string): Promise<void>
}

const defaultData: AuthCtxData = {
  initialized: false,
  userInfo: undefined,
}

const defaultValue: AuthCtx = {
  ...defaultData,
  signIn() { throw new Error() },
  signUp() { throw new Error() },
  changeName() { throw new Error() },
}

const AuthContext = createContext<AuthCtx>(defaultValue)

export const useAuth = () => useContext(AuthContext)

export function Provider(props: any) {
  const [contextData, setContextData] = useState(defaultData)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await axios.get<AuthInfo | ''>('/api/front/auth')
      setContextData({
        initialized: true,
        userInfo: data || undefined
      })
    }
    checkAuth()
  }, [])

  const context: AuthCtx = useMemo(() => {
    return {
      ...contextData,
      async signIn(email: string, pw: string) {
        try {
          const { data } = await axios.post<AuthInfo>('/api/front/auth/signIn', { email, pw })
          setContextData({
            ...contextData,
            userInfo: data,
          })
          return true
        } catch {
          return false
        }
      },
      async signUp(email: string, pw: string, name: string) {
        try {
          const { data } = await axios.post<AuthInfo>('/api/front/auth/signUp', { email, pw, name })
          setContextData({
            ...contextData,
            userInfo: data,
          })
          return true
        } catch {
          return false
        }
      },
      async changeName(name: string) {
        await axios.post<AuthInfo>('/api/front/auth/changeName', { name })
        setContextData({
          ...contextData,
          userInfo: { ...context.userInfo!, name: name },
        })
      },
    }
  }, [contextData])

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const Consumer = AuthContext.Consumer
