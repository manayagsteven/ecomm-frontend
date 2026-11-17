<!-- app/pages/wishlist.vue - Saved products -->
<template>
  <div class="sk-container page">
    <header class="head">
      <div>
        <span class="sk-eyebrow">Your favorites</span>
        <h1 class="sk-h1 mt-3">Saved <em>items</em></h1>
      </div>
      <p v-if="ids.length" class="sk-muted head__note sk-num">
        {{ ids.length }} {{ ids.length === 1 ? 'item' : 'items' }} saved
      </p>
    </header>

    <!-- Loading -->
    <div v-if="loading && !loaded" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state sk-surface">
      <v-icon icon="mdi-cloud-alert-outline" size="40" color="error" />
      <h2 class="sk-h3 mt-3">We couldn't load your saved items</h2>
      <p class="sk-muted mt-2">{{ error }}</p>
      <v-btn color="primary" class="mt-5" prepend-icon="mdi-refresh" @click="loadProducts">Reload</v-btn>
    </div>

    <!-- Empty -->
    <div v-else-if="ids.length === 0" class="empty">
      <div class="empty__art"><v-icon icon="mdi-heart-outline" size="56" /></div>
      <div>
        <h2 class="sk-h2">Nothing saved <em>so far.</em></h2>
        <p class="sk-lede mt-3">See something you like? Hit the heart icon and it lands on this page.</p>
        <v-btn to="/#shop" color="primary" size="large" class="mt-6" append-icon="mdi-arrow-right">Explore products</v-btn>
      </div>
    </div>

    <template v-else>
      <div v-if="savedProducts.length" class="grid">
        <ProductCard v-for="product in savedProducts" :key="product.documentId" :product="product" />
      </div>

      <!-- Saved items that are no longer sold (inactive or deleted) -->
      <section v-if="missingIds.length" class="missing sk-surface">
        <div>
          <h2 class="sk-h3">{{ missingIds.length }} saved {{ missingIds.length === 1 ? 'item is' : 'items are' }} not sold anymore</h2>
          <p class="sk-muted mt-1 mb-0">The store has hidden or deleted them.</p>
        </div>
        <v-btn variant="outlined" color="primary" @click="removeMissing">Clear them out</v-btn>
      </section>

      <div v-if="savedProducts.length" class="actions">
        <v-btn color="primary" size="large" prepend-icon="mdi-cart-plus" :disabled="!canAddAny" @click="addAllToCart">
          Move everything to cart
        </v-btn>
        <NuxtLink to="/#shop" class="sk-link">Back to the shop</NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
useHead({ title: 'Saved Items · ShopKart' })

const { ids, removeFromWishlist } = useWishlist()
const { products, loading, loaded, error, loadProducts } = useCatalog()
const cart = useCart()
const { notify } = useToast()

// Match saved ids against the active products from Strapi
const savedProducts = computed(() =>
  ids.value.map((id) => products.value.find((product) => product.documentId === id)).filter(Boolean)
)

const missingIds = computed(() =>
  loaded.value ? ids.value.filter((id) => !products.value.some((product) => product.documentId === id)) : []
)

const canAddAny = computed(() =>
  savedProducts.value.some((product) => Number(product.stock) > cart.getQuantity(product.documentId))
)

function removeMissing() {
  missingIds.value.forEach((id) => removeFromWishlist(id))
  notify('Cleared out the items that are no longer sold.', 'info')
}

function addAllToCart() {
  let added = 0
  for (const product of savedProducts.value) {
    if (Number(product.stock) > cart.getQuantity(product.documentId)) {
      if (cart.addToCart(product).ok) added++
    }
  }
  notify(added ? `Moved ${added} ${added === 1 ? 'item' : 'items'} into your cart.` : 'Everything here is already in your cart or sold out.', added ? 'success' : 'warning')
}

onMounted(loadProducts)
</script>

<style scoped>
.page {
  padding-top: 48px;
  padding-bottom: 96px;
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px 32px;
  margin-bottom: 32px;
}

.head__note {
  margin: 0;
  font-weight: 700;
}

.grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 760px) {
  .grid {
    gap: 20px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1100px) {
  .grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px 24px;
  margin-top: 32px;
}

.missing {
  margin-top: 24px;
  padding: 20px 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: var(--sk-well);
}

.state {
  text-align: center;
  padding: 56px 24px;
}

.empty {
  display: grid;
  gap: 32px;
  align-items: center;
  padding: 32px 0;
}

@media (min-width: 760px) {
  .empty {
    grid-template-columns: 220px 1fr;
  }
}

.empty__art {
  width: 200px;
  aspect-ratio: 1;
  border-radius: var(--sk-r-xl);
  background: var(--sk-primary-soft);
  color: var(--sk-secondary);
  display: grid;
  place-items: center;
}
</style>
