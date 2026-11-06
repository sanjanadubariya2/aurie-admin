import { MOCK, get, post, patch, postForm, delay } from './client.js'

/** Coupons, reviews and AI helpers — routes/adminGrowth.js in aurie-api. */
const none = (v) => async () => (await delay(200), v)

export const fetchCoupons = MOCK ? none([]) : () => get('/admin/coupons').then((d) => d.coupons)
export const createCoupon = (c) => post('/admin/coupons', c).then((d) => d.coupon)
export const updateCoupon = (id, c) => patch(`/admin/coupons/${id}`, c).then((d) => d.coupon)

export const fetchReviews = MOCK ? none([]) : (status = 'pending') => get(`/admin/reviews?status=${status}`).then((d) => d.reviews)
export const moderateReview = (id, status) => patch(`/admin/reviews/${id}`, { status }).then((d) => d.review)

export function describeProduct({ file, imageUrl, name }) {
  const form = new FormData()
  if (file) form.append('image', file)
  if (imageUrl) form.append('imageUrl', imageUrl)
  if (name) form.append('name', name)
  return postForm('/admin/ai/describe-product', form)
}
export const draftReply = (orderId, intent, channel) => post('/admin/ai/reply-draft', { orderId, intent, channel })
export const parseVoiceUpdate = (transcript) => post('/admin/ai/parse-update', { transcript })
export const fetchWeeklySummary = () => get('/admin/ai/weekly-summary')
