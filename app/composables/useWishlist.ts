/* ========================================
   WISHLIST
   Stores product documentIds in localStorage.
========================================= */
const STORAGE_KEY = 'shopkart-wishlist'

function readStorage(): string[] {
  if (!import.meta.client) return []
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function useWishlist() {
  const ids = useState<string[]>('wishlist-ids', readStorage)

  function persist() {
    if (!import.meta.client) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.value))
    } catch {
      // ignore blocked storage
    }
  }

  const count = computed(() => ids.value.length)

  function isWishlisted(documentId: string) {
    return ids.value.includes(documentId)
  }

  // Adds when missing, removes when present. Returns the new state.
  function toggleWishlist(documentId: string) {
    if (isWishlisted(documentId)) {
      ids.value = ids.value.filter((id) => id !== documentId)
      persist()
      return false
    }
    ids.value = [...ids.value, documentId]
    persist()
    return true
  }

  function removeFromWishlist(documentId: string) {
    ids.value = ids.value.filter((id) => id !== documentId)
    persist()
  }

  return { ids, count, isWishlisted, toggleWishlist, removeFromWishlist }
}
