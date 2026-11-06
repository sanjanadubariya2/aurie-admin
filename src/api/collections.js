import { MOCK, get } from './client.js'
import { PATHS, unwrapList } from './endpoints.js'

/**
 * GET /admin/collections -> { collections: [{ id, name, tagline, note }] }
 *
 * Read from the database so the admin, the storefront and the API can never
 * disagree about which collections exist. FALLBACK is only used in mock mode
 * or if the request fails, so the product form still works.
 */
export const FALLBACK_COLLECTIONS = [
  { id: 'festive', name: 'Festive' },
  { id: 'bloom', name: 'Bloom' },
  { id: 'brew', name: 'Brew & Glow' },
  { id: 'tide', name: 'Tide' },
  { id: 'whims', name: 'Whims' },
  { id: 'jars', name: 'Jars' },
  { id: 'secret', name: 'Secret Glow' },
  { id: 'luxe', name: 'Luxe Boxes' },
]

export async function fetchCollections() {
  if (MOCK) return FALLBACK_COLLECTIONS
  try {
    const list = unwrapList(await get(PATHS.collections), 'collections')
    return list.length ? list : FALLBACK_COLLECTIONS
  } catch {
    return FALLBACK_COLLECTIONS
  }
}
