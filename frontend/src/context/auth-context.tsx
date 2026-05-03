import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { airlineApi, authApi, clearCache, type AuthResponseData, type UserResponse } from '../services/api'

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

function readStoredAuth() {
  if (typeof window === 'undefined') {
    return {
      user: null as AuthUser | null,
      token: null as string | null,
      profile: null as UserResponse | null,
    }
  }

  const savedToken = localStorage.getItem('skybooker_token')
  const savedUser = localStorage.getItem('skybooker_user')
  const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)

  if (!savedToken || !savedUser) {
    return {
      user: null as AuthUser | null,
      token: null as string | null,
      profile: null as UserResponse | null,
    }
  }

  try {
    const user = JSON.parse(savedUser) as AuthUser
    let profile: UserResponse | null = null

    if (savedProfile) {
      try {
        profile = JSON.parse(savedProfile) as UserResponse
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY)
      }
    }

    return { user, token: savedToken, profile }
  } catch {
    localStorage.removeItem('skybooker_token')
    localStorage.removeItem('skybooker_user')
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    return {
      user: null as AuthUser | null,
      token: null as string | null,
      profile: null as UserResponse | null,
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredAuth().user)
  const [profile, setProfile] = useState<UserResponse | null>(() => readStoredAuth().profile)
  const [token, setToken] = useState<string | null>(() => readStoredAuth().token)
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
      const nextProfile = await authApi.getUserById(baseUser.userId, true)
      if (nextProfile.airlineId != null) {
        await airlineApi.getById(nextProfile.airlineId, true)
      }
      syncProfile(baseUser, nextProfile)
    } catch {
      syncProfile(baseUser, null)
    }
  }, [syncProfile])

  useEffect(() => {
    const storedAuth = readStoredAuth()

    if (!storedAuth.token || !storedAuth.user) {
      setIsAuthReady(true)
      return
    }

    try {
      setToken(storedAuth.token)
      setUser(storedAuth.user)
      setProfile(storedAuth.profile)
      void loadProfile(storedAuth.user)
    } catch {
      setToken(null)
      setUser(null)
      setProfile(null)
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

    clearCache()
    setProfile(null)
    setUser(nextUser)
    setToken(response.token)
    localStorage.setItem('skybooker_token', response.token)
    localStorage.setItem('skybooker_user', JSON.stringify(nextUser))
    localStorage.removeItem(PROFILE_STORAGE_KEY)
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
