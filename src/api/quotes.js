import { MOCK, get, patch, delay } from './client.js'
import { unwrapList, unwrap } from './endpoints.js'

/**
 * GET   /admin/quotes?status=      -> { quotes }
 * PATCH /admin/quotes/:id  { action: 'quote', price, adminNote, validDays } | { action: 'decline', reason } -> { quote }
 */
const MOCK_QUOTES = [
  {
    id: 'mq1',
    number: 'Q482910',
    status: 'new',
    productName: 'Love Note Reveal',
    occasion: 'Proposal',
    budget: '₹1,000–2,000',
    message: 'Will you marry me?',
    details: 'Two jars, red letter beads, rose scent. Gift boxed please.',
    neededBy: new Date(Date.now() + 12 * 864e5).toISOString(),
    images: [],
    customer: { email: 'ishita.rao@gmail.com', name: '' },
    createdAt: new Date(Date.now() - 3 * 36e5).toISOString(),
  },
]

export async function fetchQuotes(status) {
  if (MOCK) {
    await delay(300)
    return MOCK_QUOTES.filter((q) => !status || q.status === status)
  }
  return unwrapList(await get(`/admin/quotes${status ? `?status=${status}` : ''}`), 'quotes')
}

export async function sendQuote(id, { price, adminNote, validDays }) {
  if (MOCK) {
    await delay(400)
    return { ...MOCK_QUOTES.find((q) => q.id === id), status: 'quoted', price, adminNote }
  }
  return unwrap(await patch(`/admin/quotes/${id}`, { action: 'quote', price, adminNote, validDays }), 'quote')
}

export async function declineQuote(id, reason) {
  if (MOCK) {
    await delay(400)
    return { ...MOCK_QUOTES.find((q) => q.id === id), status: 'declined', declineReason: reason }
  }
  return unwrap(await patch(`/admin/quotes/${id}`, { action: 'decline', reason }), 'quote')
}
