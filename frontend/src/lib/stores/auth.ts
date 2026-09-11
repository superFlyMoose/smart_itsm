import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoginUser } from '@/types/auth'

interface AuthState {
  token: string | null
  user: LoginUser | null
  setAuth: (token: string, user: LoginUser) => void
  setUser: (user: LoginUser) => void
  clearAuth: () => void
  hasPermission: (code: string | string[]) => boolean
  hasRole: (role: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: null, user: null }),
      hasPermission: (code) => {
        const permissions = get().user?.permissions ?? []
        if (Array.isArray(code)) {
          return code.some((item) => permissions.includes(item))
        }
        return permissions.includes(code)
      },
      hasRole: (role) => get().user?.roles?.includes(role) ?? false,
    }),
    {
      name: 'itsm-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)
