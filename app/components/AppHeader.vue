<!-- ========================================
     APP BAR
     White, fine bottom border, fixed at the top.
     Logo left, navigation centred, cart / wishlist and
     the orange "Store Admin" button on the right.
========================================= -->
<template>
  <v-app-bar flat height="72" class="sk-header">
    <div class="sk-container sk-header__row">
      <!-- Logo -->
      <NuxtLink to="/" class="sk-logo sk-focus" aria-label="ShopKart home">
        <img src="/logo.png?v=5" alt="" width="34" height="34" class="sk-logo__mark">
        <span class="sk-logo__word">ShopKart</span>
      </NuxtLink>

      <!-- Desktop navigation (centred) -->
      <nav class="sk-nav d-none d-md-flex" aria-label="Main">
        <NuxtLink
          v-for="link in desktopLinks"
          :key="link.label"
          :to="link.to"
          class="sk-nav__link sk-focus"
          :class="{ 'is-active': isActive(link) }"
          :aria-current="isActive(link) ? 'location' : undefined"
          @click="onNavClick(link, $event)"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Icon actions + primary button -->
      <div class="sk-actions">
        <!-- Wishlist -->
        <v-btn
          to="/wishlist"
          icon
          variant="text"
          class="sk-icon-btn"
          :active="false"
          :class="{ 'is-active': route.path === '/wishlist' }"
          :aria-label="`Saved items, ${wishlist.count.value}`"
        >
          <v-badge :model-value="wishlist.count.value > 0" :content="wishlist.count.value" color="primary" class="sk-badge">
            <v-icon :icon="wishlist.count.value ? 'mdi-heart' : 'mdi-heart-outline'" />
          </v-badge>
        </v-btn>

        <!-- Cart: opens the right-side cart drawer -->
        <v-btn
          icon
          variant="text"
          class="sk-icon-btn"
          :active="false"
          :class="{ 'is-active': drawer.isOpen.value }"
          :aria-label="`Open your cart, ${cart.totalItems.value} in it`"
          aria-haspopup="dialog"
          :aria-expanded="drawer.isOpen.value"
          @click="drawer.openDrawer()"
        >
          <v-badge :model-value="cart.totalItems.value > 0" :content="cart.totalItems.value" color="primary" class="sk-badge">
            <v-icon icon="mdi-cart-outline" />
          </v-badge>
        </v-btn>

        <v-btn
          to="/products"
          color="primary"
          variant="flat"
          class="d-none d-md-inline-flex sk-manage-btn"
          prepend-icon="mdi-view-dashboard-outline"
        >
          Manage Products
        </v-btn>

        <!-- Mobile menu -->
        <v-menu location="bottom end" offset="8">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-menu" variant="text" class="d-md-none sk-icon-btn" aria-label="Open menu" />
          </template>
          <v-list class="sk-menu" min-width="220" density="comfortable">
            <v-list-item v-for="link in links" :key="link.label" :to="link.to" :title="link.label" :prepend-icon="link.icon" />
            <v-list-item title="Cart" prepend-icon="mdi-cart-outline" @click="drawer.openDrawer()">
              <template #append>
                <span v-if="cart.totalItems.value" class="sk-pill sk-pill--peach sk-num">{{ cart.totalItems.value }}</span>
              </template>
            </v-list-item>
            <v-divider class="my-1" />
            <v-list-item to="/products" title="Manage Products" prepend-icon="mdi-view-dashboard-outline" />
          </v-list>
        </v-menu>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const cart = useCart()
const wishlist = useWishlist()
const drawer = useCartDrawer()

type NavLink = { label: string; to: string; icon: string; section?: string; mobileOnly?: boolean }

const links: NavLink[] = [
  { label: 'Home', to: '/', icon: 'mdi-home-outline', section: 'home' },
  { label: 'Departments', to: '/#categories', icon: 'mdi-shape-outline', section: 'categories' },
  { label: 'Shop All', to: '/#shop', icon: 'mdi-storefront-outline', section: 'shop' },
  { label: 'Our Promise', to: '/#why', icon: 'mdi-star-outline', section: 'why' },
  { label: 'Saved Items', to: '/wishlist', icon: 'mdi-heart-outline', mobileOnly: true },
]

// Wishlist already has an icon button on desktop
const desktopLinks = links.filter((link) => !link.mobileOnly)

/* ========================================
   SCROLL SPY (homepage only)
   The underline follows the section currently under the header,
   instead of always sitting on "Home".
========================================= */
const SPY_SECTIONS = ['categories', 'shop', 'why'] // in page order
const HEADER_OFFSET = 120 // header height plus a little slack
const activeSection = ref('home')

function updateActiveSection() {
  if (route.path !== '/') return
  let current = 'home'
  for (const id of SPY_SECTIONS) {
    const el = document.getElementById(id)
    if (el && el.getBoundingClientRect().top <= HEADER_OFFSET) current = id
  }
  activeSection.value = current
}

let frame = 0
function onScroll() {
  cancelAnimationFrame(frame)
  frame = requestAnimationFrame(updateActiveSection)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateActiveSection()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(frame)
})

// Re-check after navigating (the homepage renders its sections after load)
watch(
  () => route.fullPath,
  () => nextTick(() => setTimeout(updateActiveSection, 150))
)

function isActive(link: NavLink) {
  if (route.path === '/') return link.section === activeSection.value
  return !link.section && route.path.startsWith(link.to)
}

// "Home" while already on the homepage: scroll back to the top
function onNavClick(link: NavLink, event: MouseEvent) {
  if (link.section !== 'home' || route.path !== '/') return
  event.preventDefault()
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (route.hash) router.replace({ query: route.query, hash: '' })
}
</script>

<style scoped>
.sk-header {
  background: var(--sk-white) !important;
  border-bottom: 1px solid var(--sk-line) !important;
  color: var(--sk-ink) !important;
}

.sk-header :deep(.v-toolbar__content) {
  padding: 0;
}

/* Three columns on desktop so the nav sits in the true centre */
.sk-header__row {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (min-width: 960px) {
  .sk-header__row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }
}

.sk-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--sk-ink);
  border-radius: 8px;
  justify-self: start;
}

.sk-logo__mark {
  width: 34px;
  height: 34px;
  display: block;
  flex-shrink: 0;
}

.sk-logo__word {
  font-family: var(--sk-font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.sk-nav {
  align-items: center;
  gap: 4px;
}

.sk-nav__link {
  position: relative;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.925rem;
  font-weight: 500;
  color: var(--sk-ink-2);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.sk-nav__link:hover {
  color: var(--sk-ink);
  background: var(--sk-tint);
}

.sk-nav__link.is-active {
  color: var(--sk-ink);
  font-weight: 600;
}

.sk-nav__link.is-active::after {
  content: '';
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: -16px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--sk-primary);
}

.sk-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  justify-self: end;
}

.sk-manage-btn {
  margin-left: 10px;
}

.sk-icon-btn {
  color: var(--sk-ink) !important;
  width: 44px !important;
  height: 44px !important;
}

.sk-icon-btn.is-active {
  background: var(--sk-primary-tint);
}

.sk-badge :deep(.v-badge__badge) {
  color: var(--sk-on-primary) !important;
  font-weight: 700;
  border: 2px solid var(--sk-white);
  height: 20px;
  min-width: 20px;
}

.sk-menu {
  background: var(--sk-white) !important;
  border: 1px solid var(--sk-line);
  border-radius: var(--sk-r-md) !important;
  box-shadow: var(--sk-shadow-md) !important;
}
</style>
