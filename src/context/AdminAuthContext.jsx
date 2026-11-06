import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { onSessionExpired } from '../api/client.js'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [staff, setStaff] = useState(null)
  const [checking, setChecking] = useState(true)

  // The session is a cookie this page cannot see, so ask the API once on load.
  useEffect(() => {
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

  const signIn = useCallback(async (email, password, code) => {
    const s = await authApi.login(email, password, code)
    setStaff(s)
    return s
  }, [])

  const signOut = useCallback(async () => {
    setStaff(null)
    await authApi.logout()
  }, [])

  const refresh = useCallback(async () => setStaff(await authApi.fetchMe()), [])

  const value = useMemo(
    () => ({ staff, checking, signIn, signOut, refresh, isSignedIn: Boolean(staff) }),
    [staff, checking, signIn, signOut, refresh],
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => useContext(AdminAuthContext)
