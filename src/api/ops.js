import { API_URL, MOCK, get, post, patch, del, delay } from './client.js'

/** Operations endpoints (routes/adminOps.js in aurie-api). Mock mode returns empty data. */
const empty = (v) => async () => {
  await delay(250)
  return v
}

export const fetchSettings = MOCK ? empty({}) : () => get('/settings').then((d) => d.settings)

export const refundOrder = (id, { amount, reason }) => post(`/admin/orders/${id}/refund`, { ...(amount ? { amount } : {}), reason }).then((d) => d.order)
export const bookShipment = (id) => post(`/admin/orders/${id}/ship`, {}).then((d) => d.order)

export const fetchProduction = MOCK ? empty({ items: [], queue: [], totals: { orders: 0, units: 0 } }) : () => get('/admin/production')
export const fetchCustomers = MOCK ? empty([]) : () => get('/admin/customers').then((d) => d.customers)
export const fetchAudit = MOCK ? empty([]) : (target) => get(`/admin/audit${target ? `?target=${encodeURIComponent(target)}` : ''}`).then((d) => d.entries)

export const fetchMaterials = MOCK ? empty([]) : () => get('/admin/materials').then((d) => d.materials)
export const createMaterial = (m) => post('/admin/materials', m).then((d) => d.material)
export const updateMaterial = (id, m) => patch(`/admin/materials/${id}`, m).then((d) => d.material)
export const adjustMaterial = (id, delta, note) => post(`/admin/materials/${id}/adjust`, { delta, note }).then((d) => d.material)
export const deleteMaterial = (id) => del(`/admin/materials/${id}`)

export const fetchStaff = MOCK ? empty([]) : () => get('/admin/staff').then((d) => d.staff)
export const addStaff = (body) => post('/admin/staff', body).then((d) => d.member)
export const removeStaff = (id) => del(`/admin/staff/${id}`)

/** A plain link — the browser sends the session cookie and downloads the file. */
export const exportUrl = (from, to) => `${API_URL}/admin/orders/export.csv?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}`
