import type { Product } from './useStrapi'

/* ========================================
   CATALOG STATE
   Active products shared by the homepage, wishlist and cart.
   useState keeps one copy for the whole app.
========================================= */
export function useCatalog() {
  const products = useState<Product[]>('catalog-products', () => [])
  const loading = useState('catalog-loading', () => false)
  const loaded = useState('catalog-loaded', () => false)
  const error = useState<string | null>('catalog-error', () => null)

  const { fetchActiveProducts } = useStrapi()
  const cart = useCart()

  async function loadProducts() {
    loading.value = true
    error.value = null

    try {
      products.value = await fetchActiveProducts()
      loaded.value = true
      // Keep cart prices/stock in line with what Strapi says now
      cart.syncWithProducts(products.value)
    } catch (err) {
      console.error('Error fetching products:', err)
      error.value = 'We could not reach the store right now. Check that Strapi is running and try again.'
    } finally {
      loading.value = false
    }
  }

  // Load once; pages can call this freely
  async function ensureLoaded() {
    if (!loaded.value && !loading.value) await loadProducts()
  }

  function findProduct(documentId: string) {
    return products.value.find((product) => product.documentId === documentId)
  }

  return { products, loading, loaded, error, loadProducts, ensureLoaded, findProduct }
}
