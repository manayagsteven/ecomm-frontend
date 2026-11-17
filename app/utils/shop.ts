/* ========================================
   SHARED SHOP HELPERS
   Files in app/utils are auto-imported by Nuxt.
========================================= */

// Categories used by the storefront and the Product Management form.
// `tone` picks the solid surface used for the category tile on the homepage.
export const CATEGORIES = [
  { name: 'Electronics', icon: 'mdi-headphones', blurb: 'Phones, audio and smart gadgets' },
  { name: 'Fashion', icon: 'mdi-tshirt-crew-outline', blurb: 'Jackets, shoes and daily wear' },
  { name: 'Sports', icon: 'mdi-basketball', blurb: 'Training gear for every level' },
  { name: 'Bags', icon: 'mdi-bag-personal-outline', blurb: 'Backpacks for school and travel' },
  { name: 'Beauty', icon: 'mdi-lipstick', blurb: 'Fragrances and self-care' },
  { name: 'Home & Living', icon: 'mdi-sofa-outline', blurb: 'Kitchen and household helpers' },
  { name: 'Toys', icon: 'mdi-puzzle-outline', blurb: 'Gifts kids will love' },
] as const

export const CATEGORY_NAMES: string[] = CATEGORIES.map((category) => category.name)

export function getCategoryIcon(name?: string | null) {
  return CATEGORIES.find((category) => category.name === name)?.icon || 'mdi-tag-outline'
}

// Price in Philippine pesos, e.g. ₱1,299.00
export function formatPrice(price: number | string | null | undefined) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(price || 0))
}

// Low stock threshold shared by product cards, cart and dashboard
export const LOW_STOCK = 5

export function getStockState(stock: number | null | undefined) {
  const value = Number(stock || 0)
  if (value <= 0) return { tone: 'error', label: 'Sold out' }
  if (value <= LOW_STOCK) return { tone: 'warning', label: `Just ${value} left` }
  return { tone: 'success', label: `${value} available` }
}

// Reads the most useful message out of a $fetch / Strapi error
export function getErrorMessage(error: any) {
  return (
    error?.data?.error?.message ||
    error?.data?.message ||
    error?.message ||
    'Something went wrong.'
  )
}
