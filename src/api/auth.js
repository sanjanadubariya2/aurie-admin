import { MOCK, post, get, setToken, delay } from './client.js'
import { PATHS, unwrap } from './endpoints.js'

/**
 * POST /admin/login  { email, password } -> { token, admin }
 * GET  /admin/me                          -> { admin }
 *
 * If your login route returns the staff object under a different key, adjust
 * the unwrap call — it already handles `admin`, `staff`, `user` and `data`.
 */

const readStaff = (body) =>
  unwrap(body, 'admin') || unwrap(body, 'staff') || unwrap(body, 'user') || { email: 'admin' }

export async function login(email, password) {
  if (MOCK) {
    await delay(600)
    if (!email.includes('@') || password.length < 4) throw new Error('Check the email and password.')
    setToken('mock-admin-token')
    return { name: 'Aurie', email, role: 'admin' }
  }
  const body = await post(PATHS.login, { email, password })
  const token = body?.token || body?.accessToken || unwrap(body, 'token')
  if (!token) throw new Error('Login succeeded but no token came back. Check the login route.')
  setToken(token)
  return readStaff(body)
}

/** Confirms a stored token is still good on page load. */
export async function fetchMe() {
  if (MOCK) {
    await delay(200)
    return { name: 'Aurie', email: 'owner@aurie.co', role: 'admin' }
  }
  const body = await get(PATHS.me)
  return readStaff(body)
}

export const logout = () => setToken(null)
