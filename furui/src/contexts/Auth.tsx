import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

interface AuthInfo {
  id: number
  name: string
  email: string
}

interface AuthCtx {
  initialized: boolean
  userInfo?: AuthInfo
  signIn(email: string, pw: string): Promise<boolean>
  signUp(email: string, pw: string, name: string): Promise<boolean>
  changeName(name: string): Promise<void>
}

const defaultValue: AuthCtx = {
  initialized: false,
  userInfo: undefined,
  signIn() { throw new Error() },
  signUp() { throw new Error() },
  changeName() { throw new Error() },
}

const AuthContext = createContext<AuthCtx>(defaultValue)

export const useAuth = () => useContext(AuthContext)

export function Provider(props: any) {
  const [context, setContext] = useState<AuthCtx>(defaultValue)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await axios.get<AuthInfo | ''>('/api/front/auth')
      setContext({ ...defaultValue, userInfo: data || undefined })
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const functions = {
      ...defaultValue,
      userInfo: context.userInfo,
      async signIn(email: string, pw: string) {
        try {
          const { data } = await axios.post<AuthInfo>('/api/front/auth/signIn', { email, pw })
          setContext({
            ...functions,
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
          setContext({
            ...functions,
            userInfo: data,
          })
          return true
        } catch {
          return false
        }
      },
      async changeName(name: string) {
        await axios.post<AuthInfo>('/api/front/auth/changeName', { name })
        setContext({
          ...functions,
          userInfo: { ...context.userInfo!, name: name },
        })
      },
    }

    setContext(functions)
  }, [context.userInfo])

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const Consumer = AuthContext.Consumer
