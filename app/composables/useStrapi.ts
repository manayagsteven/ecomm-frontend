/* ========================================
   STRAPI PRODUCT API
   One place for every request the storefront makes.
========================================= */
export interface StrapiImage {
  url: string
  alternativeText?: string | null
  formats?: Record<string, { url: string }>
}

export interface Product {
  id: number
  documentId: string
  name: string
  description?: string | null
  price: number
  stock: number
  category?: string | null
  is_active: boolean
  image?: StrapiImage | null
  createdAt?: string
}

export interface CheckoutResult {
  reference: string
  totalItems: number
  totalAmount: number
  items: { documentId: string; name: string; price: number; quantity: number; subtotal: number }[]
}

export function useStrapi() {
  const config = useRuntimeConfig()
  const STRAPI_URL = config.public.strapiUrl as string

  // Turns a Strapi media object into a full URL (Strapi returns /uploads/... paths)
  function getImageUrl(image?: StrapiImage | null) {
    if (!image?.url) return ''
    if (image.url.startsWith('http://') || image.url.startsWith('https://')) return image.url
    return `${STRAPI_URL}${image.url}`
  }

  // GET /api/products?populate=image&filters[is_active][$eq]=true
  // Only active products are shown to customers.
  async function fetchActiveProducts(): Promise<Product[]> {
    const response: any = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',
        'filters[is_active][$eq]': true,
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })
    return response.data || []
  }

  // GET /api/products/:documentId - latest data for one product (used at checkout)
  async function fetchProduct(documentId: string): Promise<Product | null> {
    try {
      const response: any = await $fetch(`${STRAPI_URL}/api/products/${documentId}`, {
        query: { populate: 'image' },
      })
      return response.data || null
    } catch (error: any) {
      // 404 means the product was deleted
      if (error?.status === 404 || error?.statusCode === 404) return null
      throw error
    }
  }

  // POST /api/products/checkout - Strapi re-checks every product and deducts
  // the purchased quantities in ONE transaction (all or nothing).
  // Visitors are not allowed to PUT products directly.
  async function checkout(items: { documentId: string; quantity: number }[]): Promise<CheckoutResult> {
    const response: any = await $fetch(`${STRAPI_URL}/api/products/checkout`, {
      method: 'POST',
      body: { items },
    })
    return response.data
  }

  return { STRAPI_URL, getImageUrl, fetchActiveProducts, fetchProduct, checkout }
}
