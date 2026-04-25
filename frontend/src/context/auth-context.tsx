import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, type AuthResponseData, type UserResponse } from '../services/api'

export interface AuthUser {
  userId: number
  email: string
  role: string
  firstName?: string
  lastName?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<AuthResponseData>
  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    passportNumber?: string
    nationality?: string
  }) => Promise<AuthResponseData>
  updateProfile: (data: Partial<UserResponse>) => Promise<UserResponse>
  deleteAccount: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('skybooker_token')
    const savedUser = localStorage.getItem('skybooker_user')

    if (!savedToken || !savedUser) return

    try {
      setToken(savedToken)
      setUser(JSON.parse(savedUser) as AuthUser)
    } catch {
      localStorage.removeItem('skybooker_token')
      localStorage.removeItem('skybooker_user')
    }
  }, [])

  const setAuthFromResponse = useCallback((response: AuthResponseData) => {
    const nextUser: AuthUser = {
      userId: response.userId,
      email: response.email,
      role: response.role,
      firstName: undefined,
      lastName: undefined,
    }

    setUser(nextUser)
    setToken(response.token)
    localStorage.setItem('skybooker_token', response.token)
    localStorage.setItem('skybooker_user', JSON.stringify(nextUser))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    setAuthFromResponse(response)
    return response
  }, [setAuthFromResponse])

  const register = useCallback(async (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    passportNumber?: string
    nationality?: string
  }) => {
    const response = await authApi.register(data)
    setAuthFromResponse(response)
    return response
  }, [setAuthFromResponse])

  const updateProfile = useCallback(async (data: Partial<UserResponse>) => {
    if (!user) throw new Error('Not authenticated')
    return authApi.updateUser(user.userId, data)
  }, [user])

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error('Not authenticated')
    await authApi.deleteUser(user.userId)
    setUser(null)
    setToken(null)
    localStorage.removeItem('skybooker_token')
    localStorage.removeItem('skybooker_user')
  }, [user])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('skybooker_token')
    localStorage.removeItem('skybooker_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!user, login, register, updateProfile, deleteAccount, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
