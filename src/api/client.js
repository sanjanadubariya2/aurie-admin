/**
 * fetch wrapper for the admin app.
 *
 * Holds a separate token from the storefront (`aurie.admin.token`) so signing
 * out of one does not sign you out of the other, and so a customer session can
 * never be mistaken for a staff session.
 */

export const API_URL = import.meta.env.VITE_API_URL || '/api'
export const MOCK = import.meta.env.VITE_MOCK === '1'

const TOKEN_KEY = 'aurie.admin.token'

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token)
    else window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* private mode — the session still works, it just will not survive reload */
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Listeners fire when the API says 401/403 so the shell can bounce to login. */
const expiryListeners = new Set()
export const onSessionExpired = (fn) => {
  expiryListeners.add(fn)
  return () => expiryListeners.delete(fn)
}

async function send(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  // Do NOT set Content-Type for FormData — the browser must add the multipart
  // boundary itself, and setting it manually silently breaks the upload.
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'

  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: isForm ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the API. Is aurie-api running?', 0)
  }

  if (res.status === 401 || res.status === 403) {
    setToken(null)
    expiryListeners.forEach((fn) => fn())
    throw new ApiError(
      res.status === 403 ? 'That account is not an admin.' : 'Your session expired. Sign in again.',
      res.status,
    )
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

  if (!res.ok) {
    const message = payload?.message || payload?.error || `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }

  return payload
}

export const get = (path) => send(path)
export const post = (path, body) => send(path, { method: 'POST', body })
export const patch = (path, body) => send(path, { method: 'PATCH', body })
export const del = (path) => send(path, { method: 'DELETE' })
export const postForm = (path, formData) => send(path, { method: 'POST', body: formData, isForm: true })

export const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))
