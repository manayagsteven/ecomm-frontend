import type { Product } from './useStrapi'

/* ========================================
   SHOPPING CART
   - Saved in localStorage so it survives a page refresh.
   - Quantities can never go above the product's stock.
   - Inactive / deleted / sold-out products are flagged as unavailable.
========================================= */
export interface CartItem {
  documentId: string
  id: number
  name: string
  category: string
  price: number
  stock: number
  imageUrl: string
  quantity: number
  available: boolean
}

const STORAGE_KEY = 'shopkart-cart'

function readStorage(): CartItem[] {
  if (!import.meta.client) return []
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function useCart() {
  const items = useState<CartItem[]>('cart-items', readStorage)
  const { getImageUrl } = useStrapi()

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // Storage can be blocked (private mode); the cart still works for this visit
    }
  }

  /* ---------- Totals ---------- */
  const availableItems = computed(() => items.value.filter((item) => item.available))

  // Total number of units (e.g. 2 headphones + 1 bag = 3)
  const totalItems = computed(() =>
    availableItems.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  // Sum of every line subtotal (price x quantity)
  const totalAmount = computed(() =>
    availableItems.value.reduce((sum, item) => sum + lineSubtotal(item), 0)
  )

  const hasUnavailable = computed(() => items.value.some((item) => !item.available))

  function lineSubtotal(item: CartItem) {
    return Number(item.price) * item.quantity
  }

  function getQuantity(documentId: string) {
    return items.value.find((item) => item.documentId === documentId)?.quantity || 0
  }

  /* ---------- Add ---------- */
  function addToCart(product: Product, quantity = 1) {
    if (!product.is_active) {
      return { ok: false, message: `${product.name} can't be bought at the moment.` }
    }

    const stock = Number(product.stock || 0)
    if (stock <= 0) {
      return { ok: false, message: `Sorry, ${product.name} just sold out.` }
    }

    const existing = items.value.find((item) => item.documentId === product.documentId)
    const currentQty = existing?.quantity || 0

    if (currentQty + quantity > stock) {
      return {
        ok: false,
        message: `We only have ${stock} of ${product.name}, and ${currentQty} are already in your cart.`,
      }
    }

    if (existing) {
      existing.quantity += quantity
      existing.price = Number(product.price)
      existing.stock = stock
    } else {
      items.value.push({
        documentId: product.documentId,
        id: product.id,
        name: product.name,
        category: product.category || 'Uncategorized',
        price: Number(product.price),
        stock,
        imageUrl: getImageUrl(product.image),
        quantity,
        available: true,
      })
    }

    persist()
    return { ok: true, message: `${product.name} is now in your cart.` }
  }

  /* ---------- Update quantity (clamped between 1 and stock) ---------- */
  function updateQuantity(documentId: string, quantity: number) {
    const item = items.value.find((entry) => entry.documentId === documentId)
    if (!item) return { ok: false, message: 'That item is no longer in your cart.' }

    const wanted = Math.floor(Number(quantity) || 1)

    if (wanted > item.stock) {
      item.quantity = item.stock
      persist()
      return { ok: false, message: `We have just ${item.stock} of ${item.name} left.` }
    }

    item.quantity = Math.max(1, wanted)
    persist()
    return { ok: true, message: '' }
  }

  function removeItem(documentId: string) {
    items.value = items.value.filter((item) => item.documentId !== documentId)
    persist()
  }

  function clearCart() {
    items.value = []
    persist()
  }

  /* ---------- Sync with fresh Strapi data ----------
     `products` holds only ACTIVE products, so a cart item that is
     missing from it was deactivated or deleted. */
  function syncWithProducts(products: Product[]) {
    for (const item of items.value) {
      const product = products.find((entry) => entry.documentId === item.documentId)

      if (!product) {
        item.available = false
        continue
      }

      item.name = product.name
      item.category = product.category || 'Uncategorized'
      item.price = Number(product.price)
      item.stock = Number(product.stock || 0)
      item.imageUrl = getImageUrl(product.image)
      item.available = item.stock > 0

      if (item.available && item.quantity > item.stock) {
        item.quantity = item.stock
      }
    }
    persist()
  }

  return {
    items,
    availableItems,
    totalItems,
    totalAmount,
    hasUnavailable,
    lineSubtotal,
    getQuantity,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    syncWithProducts,
  }
}
