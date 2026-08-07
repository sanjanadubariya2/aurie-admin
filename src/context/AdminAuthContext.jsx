import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { getToken, onSessionExpired } from '../api/client.js'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [staff, setStaff] = useState(null)
  const [checking, setChecking] = useState(Boolean(getToken()))

  // A stored token might be expired or revoked. Verify it before showing the
  // dashboard, otherwise every panel loads and then fails at once.
  useEffect(() => {
    if (!getToken()) return
    let cancelled = false
    authApi
      .fetchMe()
      .then((s) => !cancelled && setStaff(s))
      .catch(() => !cancelled && setStaff(null))
      .finally(() => !cancelled && setChecking(false))
    return () => {
      cancelled = true
    }
  }, [])

  // Any 401/403 from anywhere in the app drops us back to the login screen.
  useEffect(() => onSessionExpired(() => setStaff(null)), [])

  const signIn = useCallback(async (email, password) => {
    const s = await authApi.login(email, password)
    setStaff(s)
    return s
  }, [])

  const signOut = useCallback(() => {
    authApi.logout()
    setStaff(null)
  }, [])

  const value = useMemo(
    () => ({ staff, checking, signIn, signOut, isSignedIn: Boolean(staff) }),
    [staff, checking, signIn, signOut],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => useContext(AdminAuthContext)
