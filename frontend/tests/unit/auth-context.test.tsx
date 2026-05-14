import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/context/auth-context'
import * as api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  authApi: {
    getUserById: vi.fn(),
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
  },
  airlineApi: { getById: vi.fn() },
  clearCache: vi.fn(),
}))

const mockUser = { id: 1, firstName: 'John', lastName: 'Doe', email: 'test@test.com', phoneNumber: '123', passportNumber: 'ABC', nationality: 'US', airlineId: null, authProvider: 'LOCAL', role: 'PASSENGER', isActive: true }

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    ;(localStorage.getItem as any).mockReturnValue(null)
    vi.mocked(api.authApi.getUserById).mockResolvedValue(mockUser)
  })

  it('provides initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
    expect(result.current.isLoggedIn).toBe(false)
  })

  it('logs in user', async () => {
    vi.mocked(api.authApi.login).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.login('test@test.com', 'pass')
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
  })

  it('logs in with Google', async () => {
    vi.mocked(api.authApi.loginWithGoogle).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.loginWithGoogle('google-token')
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
  })

  it('registers user', async () => {
    vi.mocked(api.authApi.register).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.register({ firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'pass', phoneNumber: '123', role: 'PASSENGER' })
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))
  })

  it('logs out user', async () => {
    vi.mocked(api.authApi.login).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.login('test@test.com', 'pass')
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))

    act(() => result.current.logout())
    expect(result.current.isLoggedIn).toBe(false)
  })

  it('updates profile', async () => {
    vi.mocked(api.authApi.login).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    vi.mocked(api.authApi.updateUser).mockResolvedValue({ ...mockUser, firstName: 'Jane' })
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.login('test@test.com', 'pass')
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))

    await act(async () => {
      await result.current.updateProfile({ firstName: 'Jane' })
    })

    await waitFor(() => expect(result.current.profile?.firstName).toBe('Jane'))
  })

  it('deletes account', async () => {
    vi.mocked(api.authApi.login).mockResolvedValue({ userId: 1, email: 'test@test.com', token: 'token', role: 'PASSENGER' })
    vi.mocked(api.authApi.deleteUser).mockResolvedValue(undefined)
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await act(async () => {
      await result.current.login('test@test.com', 'pass')
    })

    await waitFor(() => expect(result.current.isLoggedIn).toBe(true))

    await act(async () => {
      await result.current.deleteAccount()
    })

    expect(result.current.isLoggedIn).toBe(false)
  })

  it('restores from localStorage', async () => {
    ;(localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'skybooker_token') return 'token'
      if (key === 'skybooker_user') return JSON.stringify({ userId: 1, email: 'test@test.com', role: 'PASSENGER' })
      return null
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    
    await waitFor(() => expect(result.current.isAuthReady).toBe(true))
    expect(result.current.token).toBe('token')
  })

  it('handles invalid localStorage', () => {
    ;(localStorage.getItem as any).mockImplementation((key: string) => {
      if (key === 'skybooker_token') return 'token'
      if (key === 'skybooker_user') return 'invalid'
      return null
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
    expect(result.current.user).toBeNull()
  })

  it('throws error when used outside provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow()
  })
})
