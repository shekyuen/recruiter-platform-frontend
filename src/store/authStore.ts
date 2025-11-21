import { create } from 'zustand'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: string
}

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  login: (token: string, user: User) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({ token, user })
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ token: null, user: null })
  },
}))
