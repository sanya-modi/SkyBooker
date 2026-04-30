import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { authApi, clearCache, type AuthResponseData, type UserResponse } from '../services/api'

export interface AuthUser {
  userId: number
  email: string
  role: string
  firstName?: string
  lastName?: string
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phoneNumber: string
  role: string
  passportNumber?: string
  nationality?: string
  airlineId?: number
}

interface AuthContextType {
  user: AuthUser | null
  profile: UserResponse | null
  token: string | null
  isLoggedIn: boolean
  isAuthReady: boolean
  login: (email: string, password: string) => Promise<AuthResponseData>
  loginWithGoogle: (idToken: string) => Promise<AuthResponseData>
  register: (data: RegisterData) => Promise<AuthResponseData>
  updateProfile: (data: Partial<UserResponse>) => Promise<UserResponse>
  deleteAccount: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)
const PROFILE_STORAGE_KEY = 'skybooker_profile'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  const syncProfile = useCallback((baseUser: AuthUser, nextProfile: UserResponse | null) => {
    if (!nextProfile) {
      setProfile(null)
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      return
    }

    const syncedUser: AuthUser = {
      ...baseUser,
      firstName: nextProfile.firstName,
      lastName: nextProfile.lastName,
    }

    setUser(syncedUser)
    setProfile(nextProfile)
    localStorage.setItem('skybooker_user', JSON.stringify(syncedUser))
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile))
  }, [])

  const loadProfile = useCallback(async (baseUser: AuthUser) => {
    try {
      const nextProfile = await authApi.getUserById(baseUser.userId)
      syncProfile(baseUser, nextProfile)
    } catch {
      syncProfile(baseUser, null)
    }
  }, [syncProfile])

  useEffect(() => {
    const savedToken = localStorage.getItem('skybooker_token')
    const savedUser = localStorage.getItem('skybooker_user')
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)

    if (!savedToken || !savedUser) {
      setIsAuthReady(true)
      return
    }

    try {
      const nextUser = JSON.parse(savedUser) as AuthUser
      setToken(savedToken)
      setUser(nextUser)
      if (savedProfile) {
        try {
          const nextProfile = JSON.parse(savedProfile) as UserResponse
          setProfile(nextProfile)
        } catch {
          localStorage.removeItem(PROFILE_STORAGE_KEY)
        }
      }
      void loadProfile(nextUser)
    } catch {
      localStorage.removeItem('skybooker_token')
      localStorage.removeItem('skybooker_user')
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    } finally {
      setIsAuthReady(true)
    }
  }, [loadProfile])

  const setAuthFromResponse = useCallback(async (response: AuthResponseData) => {
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
    await loadProfile(nextUser)
  }, [loadProfile])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password })
    await setAuthFromResponse(response)
    return response
  }, [setAuthFromResponse])

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const response = await authApi.loginWithGoogle({ idToken })
    await setAuthFromResponse(response)
    return response
  }, [setAuthFromResponse])

  const register = useCallback(async (data: RegisterData) => {
    const response = await authApi.register(data)
    await setAuthFromResponse(response)
    return response
  }, [setAuthFromResponse])

  const updateProfile = useCallback(async (data: Partial<UserResponse>) => {
    if (!user) throw new Error('Not authenticated')
    const updatedUser = await authApi.updateUser(user.userId, data)
    syncProfile(user, updatedUser)
    return updatedUser
  }, [user, syncProfile])

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error('Not authenticated')
    await authApi.deleteUser(user.userId)
    setUser(null)
    setProfile(null)
    setToken(null)
    localStorage.removeItem('skybooker_token')
    localStorage.removeItem('skybooker_user')
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }, [user])

  const logout = useCallback(() => {
    setUser(null)
    setProfile(null)
    setToken(null)
    clearCache()
    localStorage.removeItem('skybooker_token')
    localStorage.removeItem('skybooker_user')
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, token, isLoggedIn: !!user, isAuthReady, login, loginWithGoogle, register, updateProfile, deleteAccount, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
