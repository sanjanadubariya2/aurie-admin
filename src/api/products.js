import { MOCK, get, post, patch, del, postForm, delay } from './client.js'
import {
  PATHS,
  unwrapList,
  unwrap,
  normaliseProduct,
  productBody,
  IMAGE_FIELD,
  readUploadedUrl,
} from './endpoints.js'
import { mockProducts, saveMockProduct, deleteMockProduct } from './mockData.js'

/**
 * GET    /admin/products               -> { products: [...] }
 * POST   /admin/products               { ...fields } -> { product }
 * PATCH  /admin/products/:id           { ...fields } -> { product }
 * DELETE /admin/products/:id
 * POST   /admin/products/:id/image     multipart, field name from IMAGE_FIELD
 */

export async function fetchProducts() {
  if (MOCK) {
    await delay(350)
    return mockProducts().map(normaliseProduct)
  }
  const body = await get(PATHS.products)
  return unwrapList(body, 'products').map(normaliseProduct)
}

export async function createProduct(product) {
  if (MOCK) {
    await delay(400)
    return normaliseProduct(saveMockProduct(product))
  }
  const body = await post(PATHS.products, productBody(product))
  return normaliseProduct(unwrap(body, 'product'))
}

export async function updateProduct(id, product) {
  if (MOCK) {
    await delay(400)
    return normaliseProduct(saveMockProduct({ ...product, id }))
  }
  const body = await patch(PATHS.product(id), productBody(product))
  return normaliseProduct(unwrap(body, 'product'))
}

export async function deleteProduct(id) {
  if (MOCK) {
    await delay(350)
    deleteMockProduct(id)
    return true
  }
  await del(PATHS.product(id))
  return true
}

/** Returns the hosted URL of the uploaded file. */
export async function uploadProductImage(id, file) {
  if (MOCK) {
    await delay(700)
    return URL.createObjectURL(file)
  }
  const form = new FormData()
  form.append(IMAGE_FIELD, file)
  const body = await postForm(PATHS.productImage(id), form)
  return readUploadedUrl(body)
}
