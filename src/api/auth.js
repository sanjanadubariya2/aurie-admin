import { MOCK, post, get, delay } from './client.js'
import { PATHS, unwrap } from './endpoints.js'

/**
 * POST /admin/login   { email, password, code? } -> { admin }  (+ sets the aurie_admin cookie)
 *                     401 { needsTotp: true } when two-factor is on and the code is missing/wrong
 * GET  /admin/me                                -> { admin }  (401 when signed out)
 * POST /admin/logout                            -> { ok }
 * POST /admin/2fa/setup | enable | disable      two-factor management
 */

const MOCK_KEY = 'aurie.admin.mock.session'
const readStaff = (body) => unwrap(body, 'admin') || unwrap(body, 'staff') || unwrap(body, 'user') || null

export async function login(email, password, code) {
  if (MOCK) {
    await delay(600)
    if (!email.includes('@') || password.length < 4) throw new Error('Check the email and password.')
    const staff = { name: 'Aurie', email, role: 'admin', totpEnabled: false }
    window.localStorage.setItem(MOCK_KEY, JSON.stringify(staff))
    return staff
  }
  const body = await post(PATHS.login, { email, password, ...(code ? { code } : {}) }, { quiet401: true })
  return readStaff(body)
}

/** The signed-in admin, or null. */
export async function fetchMe() {
  if (MOCK) {
    await delay(150)
    return JSON.parse(window.localStorage.getItem(MOCK_KEY) || 'null')
  }
  try {
    return readStaff(await get(PATHS.me, { quiet401: true }))
  } catch (err) {
    if (err.status === 401 || err.status === 403) return null
    throw err
  }
}

export async function logout() {
  if (MOCK) return window.localStorage.removeItem(MOCK_KEY)
  await post('/admin/logout', {}).catch(() => {})
}

export const setupTwoFactor = () => post('/admin/2fa/setup', {})
export const enableTwoFactor = (code) => post('/admin/2fa/enable', { code })
export const disableTwoFactor = (code, password) => post('/admin/2fa/disable', { code, password })
