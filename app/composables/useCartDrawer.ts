/* ========================================
   CART DRAWER (right side panel)
   Shared open/closed state so the header button,
   the mobile menu and the drawer itself stay in sync.
========================================= */
export function useCartDrawer() {
  const isOpen = useState('cart-drawer-open', () => false)

  function openDrawer() {
    isOpen.value = true
  }

  function closeDrawer() {
    isOpen.value = false
  }

  return { isOpen, openDrawer, closeDrawer }
}
