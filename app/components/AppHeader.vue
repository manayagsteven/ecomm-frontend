<!-- ========================================
     APP BAR
     Solid white, fine bottom border, sticky (fixed) at the top.
     Shows cart and wishlist counters.
========================================= -->
<template>
  <v-app-bar flat height="72" class="sk-header">
    <div class="sk-container d-flex align-center ga-2 h-100">
      <!-- Logo -->
      <NuxtLink to="/" class="sk-logo sk-focus" aria-label="ShopKart home">
        <span class="sk-logo__mark"><v-icon icon="mdi-cart-variant" size="20" /></span>
        <span class="sk-logo__word">Shop<em>Kart</em></span>
      </NuxtLink>

      <!-- Desktop navigation -->
      <nav class="sk-nav d-none d-md-flex" aria-label="Main">
        <NuxtLink
          v-for="link in desktopLinks"
          :key="link.label"
          :to="link.to"
          class="sk-nav__link sk-focus"
          :class="{ 'is-active': isActive(link) }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <v-spacer />

      <v-btn
        to="/products"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-view-dashboard-outline"
        class="d-none d-md-inline-flex sk-manage-btn"
        :class="{ 'is-active': route.path === '/products' }"
      >
        Manage Products
      </v-btn>

      <!-- Icon actions: wishlist, cart, mobile menu (evenly spaced group) -->
      <div class="sk-actions">
      <!-- Wishlist -->
      <v-btn
        to="/wishlist"
        icon
        variant="text"
        class="sk-icon-btn"
        :active="false"
        :class="{ 'is-active': route.path === '/wishlist' }"
        :aria-label="`Wishlist, ${wishlist.count.value} items`"
      >
        <v-badge :model-value="wishlist.count.value > 0" :content="wishlist.count.value" color="secondary" class="sk-badge">
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
        :aria-label="`Open cart, ${cart.totalItems.value} items`"
        aria-haspopup="dialog"
        :aria-expanded="drawer.isOpen.value"
        @click="drawer.openDrawer()"
      >
        <v-badge :model-value="cart.totalItems.value > 0" :content="cart.totalItems.value" color="secondary" class="sk-badge">
          <v-icon icon="mdi-cart-outline" />
        </v-badge>
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
              <span v-if="cart.totalItems.value" class="sk-pill sk-pill--sky sk-num">{{ cart.totalItems.value }}</span>
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
const cart = useCart()
const wishlist = useWishlist()
const drawer = useCartDrawer()

const links = [
  { label: 'Home', to: '/', icon: 'mdi-home-outline', exact: true },
  { label: 'Shop', to: '/#shop', icon: 'mdi-storefront-outline' },
  { label: 'Categories', to: '/#categories', icon: 'mdi-shape-outline' },
  { label: 'Wishlist', to: '/wishlist', icon: 'mdi-heart-outline', mobileOnly: true },
]

// Wishlist already has an icon button on desktop
const desktopLinks = links.filter((link) => !link.mobileOnly)

function isActive(link: { to: string; exact?: boolean }) {
  if (link.to.includes('#')) return false
  if (link.exact) return route.path === link.to
  return route.path.startsWith(link.to)
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

.sk-logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--sk-ink);
  margin-right: 24px;
  border-radius: 8px;
}

.sk-logo__mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--sk-teal);
  color: var(--sk-meadow);
}

.sk-logo__word {
  font-family: var(--sk-font-display);
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.sk-logo__word em {
  font-style: italic;
  font-weight: 400;
  color: var(--sk-teal);
}

.sk-nav {
  align-items: center;
  gap: 4px;
}

.sk-nav__link {
  position: relative;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--sk-ink-2);
  text-decoration: none;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.sk-nav__link:hover {
  color: var(--sk-ink);
  background: var(--sk-mist);
}

.sk-nav__link.is-active {
  color: var(--sk-teal);
}

.sk-nav__link.is-active::after {
  content: '';
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -15px;
  height: 2px;
  background: var(--sk-teal);
}

.sk-manage-btn {
  border-color: var(--sk-line-strong) !important;
}

/* Wishlist + cart + menu: one evenly spaced group, set apart from Manage Products */
.sk-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;
}

@media (max-width: 959px) {
  .sk-actions {
    gap: 6px;
    margin-left: 0;
  }
}

.sk-manage-btn.is-active {
  background: var(--sk-meadow) !important;
  border-color: var(--sk-meadow) !important;
}

.sk-icon-btn {
  color: var(--sk-ink) !important;
  width: 44px !important;
  height: 44px !important;
}

.sk-icon-btn.is-active {
  background: var(--sk-mist-deep);
}

.sk-badge :deep(.v-badge__badge) {
  color: var(--sk-teal) !important;
  font-weight: 800;
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
