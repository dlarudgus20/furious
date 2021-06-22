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
  const [authInfo, setAuthInfo] = useState<AuthCtx>(defaultValue)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await axios.get<AuthInfo | ''>('/api/front/auth')

      const functions = {
        initialized: true,
        signIn, signUp, changeName
      }

      async function signIn(email: string, pw: string) {
        try {
          const { data } = await axios.post<AuthInfo>('/api/front/auth/signIn', { email, pw })
          setAuthInfo({
            userInfo: data,
            ...functions,
          })
          return true
        } catch {
          return false
        }
      }

      async function signUp(email: string, pw: string, name: string) {
        try {
          const { data } = await axios.post<AuthInfo>('/api/front/auth/signUp', { email, pw, name })
          setAuthInfo({
            userInfo: data,
            ...functions,
          })
          return true
        } catch {
          return false
        }
      }

      async function changeName(name: string) {
        await axios.post<AuthInfo>('/api/front/auth/changeName', { name })
        setAuthInfo({
          userInfo: { ...authInfo.userInfo!, name: name },
          ...functions,
        })
      }

      setAuthInfo({
        userInfo: data || undefined,
        ...functions,
      })
    }
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={authInfo}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const Consumer = AuthContext.Consumer
