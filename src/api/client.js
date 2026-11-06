/**
 * fetch wrapper for the admin app.
 *
 * The admin session is an httpOnly `aurie_admin` cookie set by POST
 * /admin/login — separate from the storefront's customer cookie, so signing
 * out of one never touches the other, and page JavaScript never holds a token.
 */

export const API_URL = import.meta.env.VITE_API_URL || '/api'
export const MOCK = import.meta.env.VITE_MOCK === '1'

// Older builds kept the token in localStorage — remove it so it does not linger.
try {
  window.localStorage.removeItem('aurie.admin.token')
} catch {
  /* storage unavailable */
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/** Listeners fire when the API says 401/403 so the shell can bounce to login. */
const expiryListeners = new Set()
export const onSessionExpired = (fn) => {
  expiryListeners.add(fn)
  return () => expiryListeners.delete(fn)
}

async function send(path, { method = 'GET', body, isForm = false, quiet401 = false } = {}) {
  const headers = {}
  // Do NOT set Content-Type for FormData — the browser must add the multipart
  // boundary itself, and setting it manually silently breaks the upload.
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the API. Is aurie-api running?', 0)
  }

  const text = await res.text()
  let payload = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = null
    }
  }

  if ((res.status === 401 || res.status === 403) && !quiet401) {
    expiryListeners.forEach((fn) => fn())
    throw new ApiError(
      res.status === 403 ? 'That account is not an admin.' : payload?.message || 'Your session expired. Sign in again.',
      res.status,
      payload,
    )
  }
  if (!res.ok) {
    throw new ApiError(payload?.message || payload?.error || `Request failed (${res.status})`, res.status, payload)
  }
  return payload
}

export const get = (path, opts) => send(path, opts)
export const post = (path, body, opts) => send(path, { method: 'POST', body, ...opts })
export const patch = (path, body) => send(path, { method: 'PATCH', body })
export const del = (path) => send(path, { method: 'DELETE' })
export const postForm = (path, formData) => send(path, { method: 'POST', body: formData, isForm: true })
export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))
