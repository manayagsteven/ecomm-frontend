<!-- app/pages/cart.vue - Shopping cart -->
<template>
  <div class="sk-container page">
    <header class="page-head">
      <span class="sk-eyebrow">Your cart</span>
      <h1 class="sk-h1 mt-3">Shopping <em>cart</em></h1>
    </header>

    <!-- ========================================
         EMPTY CART
    ========================================= -->
    <div v-if="items.length === 0" class="empty">
      <div class="empty__art"><v-icon icon="mdi-cart-outline" size="56" /></div>
      <div>
        <h2 class="sk-h2">Nothing in here <em>yet.</em></h2>
        <p class="sk-lede mt-3">Browse the shop and add a few things you like. Your cart is saved on this device.</p>
        <div class="d-flex flex-wrap ga-3 mt-6">
          <v-btn to="/#shop" color="primary" size="large" append-icon="mdi-arrow-right">Start shopping</v-btn>
          <v-btn v-if="wishlistCount" to="/wishlist" variant="outlined" color="primary" size="large">
            View wishlist ({{ wishlistCount }})
          </v-btn>
        </div>
      </div>
    </div>

    <div v-else class="layout">
      <!-- ========================================
           CART ITEMS
      ========================================= -->
      <section class="items sk-surface" aria-label="Cart items">
        <div class="items__head">
          <span class="sk-num"><strong>{{ items.length }}</strong> {{ items.length === 1 ? 'product' : 'products' }}</span>
          <button type="button" class="sk-link sk-focus clear-btn" @click="clearDialog = true">Clear cart</button>
        </div>

        <v-alert
          v-if="hasUnavailable"
          type="warning"
          variant="tonal"
          density="comfortable"
          class="ma-4 mb-0"
          rounded="lg"
        >
          Some items are no longer available (inactive, deleted or sold out). Remove them to continue to checkout.
        </v-alert>

        <ul class="lines">
          <li v-for="item in items" :key="item.documentId" class="line" :class="{ 'is-unavailable': !item.available }">
            <div class="line__img sk-image-well">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
              <v-icon v-else :icon="getCategoryIcon(item.category)" size="32" class="sk-subtle" />
            </div>

            <div class="line__info">
              <span class="line__cat">{{ item.category }}</span>
              <h2 class="line__name">{{ item.name }}</h2>
              <div class="line__unit sk-muted sk-num">{{ formatPrice(item.price) }} each</div>
              <span v-if="!item.available" class="sk-pill sk-pill--error mt-2">No longer available</span>
              <span v-else-if="item.quantity >= item.stock" class="sk-pill sk-pill--warning mt-2">
                Max stock reached ({{ item.stock }})
              </span>
            </div>

            <div class="line__qty">
              <div v-if="item.available" class="sk-stepper" role="group" :aria-label="`Quantity for ${item.name}`">
                <button type="button" :disabled="item.quantity <= 1" aria-label="Decrease quantity" @click="changeQty(item, item.quantity - 1)">
                  <v-icon icon="mdi-minus" size="18" />
                </button>
                <input
                  :value="item.quantity"
                  type="number"
                  min="1"
                  :max="item.stock"
                  inputmode="numeric"
                  :aria-label="`Quantity for ${item.name}`"
                  @change="changeQty(item, $event.target.value)"
                >
                <button type="button" :disabled="item.quantity >= item.stock" aria-label="Increase quantity" @click="changeQty(item, item.quantity + 1)">
                  <v-icon icon="mdi-plus" size="18" />
                </button>
              </div>
              <div class="line__stock sk-subtle">{{ item.available ? `${item.stock} in stock` : '' }}</div>
            </div>

            <div class="line__total">
              <div class="line__subtotal sk-num">{{ item.available ? formatPrice(lineSubtotal(item)) : '—' }}</div>
              <button type="button" class="remove sk-focus" :aria-label="`Remove ${item.name}`" @click="remove(item)">
                <v-icon icon="mdi-trash-can-outline" size="18" /> Remove
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- ========================================
           ORDER SUMMARY
      ========================================= -->
      <aside class="summary" aria-label="Order summary">
        <h2 class="sk-h3">Order summary</h2>
        <dl class="summary__rows">
          <div>
            <dt>Total items</dt>
            <dd class="sk-num">{{ totalItems }}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd class="sk-num">{{ formatPrice(totalAmount) }}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>Free</dd>
          </div>
        </dl>
        <div class="summary__total">
          <span>Total amount</span>
          <strong class="sk-num">{{ formatPrice(totalAmount) }}</strong>
        </div>

        <v-btn
          to="/checkout"
          color="secondary"
          size="x-large"
          block
          append-icon="mdi-arrow-right"
          :disabled="hasUnavailable || totalItems === 0"
          class="mt-6"
        >
          Checkout all
        </v-btn>
        <v-btn :loading="refreshing" variant="text" block class="mt-2 summary__ghost" prepend-icon="mdi-refresh" @click="refresh">
          Refresh stock
        </v-btn>
        <NuxtLink to="/#shop" class="summary__continue">Continue shopping</NuxtLink>
      </aside>
    </div>

    <!-- Clear cart confirmation -->
    <v-dialog v-model="clearDialog" max-width="420">
      <v-card class="sk-dialog pa-2">
        <v-card-text class="pa-6">
          <h2 class="sk-h3">Clear your cart?</h2>
          <p class="sk-muted mt-3 mb-0">All {{ items.length }} products will be removed. This can't be undone.</p>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="clearDialog = false">Keep items</v-btn>
          <v-btn color="error" variant="flat" class="flex-grow-1" @click="confirmClear">Clear cart</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
useHead({ title: 'Cart | ShopKart' })

const { items, totalItems, totalAmount, hasUnavailable, lineSubtotal, updateQuantity, removeItem, clearCart } = useCart()
const { count: wishlistCount } = useWishlist()
const { loadProducts } = useCatalog()
const { notify } = useToast()

const clearDialog = ref(false)
const refreshing = ref(false)

function changeQty(item, value) {
  const result = updateQuantity(item.documentId, Number(value))
  if (!result.ok && result.message) notify(result.message, 'warning')
}

function remove(item) {
  removeItem(item.documentId)
  notify(`${item.name} removed from cart.`, 'info')
}

function confirmClear() {
  clearCart()
  clearDialog.value = false
  notify('Cart cleared.', 'info')
}

// Re-reads Strapi so prices, stock and availability are current
async function refresh() {
  refreshing.value = true
  await loadProducts()
  refreshing.value = false
}

onMounted(refresh)
</script>

<style scoped>
.page {
  padding-top: 48px;
  padding-bottom: 96px;
}

.page-head {
  margin-bottom: 32px;
}

/* ---------- Empty ---------- */
.empty {
  display: grid;
  gap: 32px;
  align-items: center;
  padding: 48px 0;
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
  background: var(--sk-sky);
  color: var(--sk-teal);
  display: grid;
  place-items: center;
}

/* ---------- Layout ---------- */
.layout {
  display: grid;
  gap: 24px;
  align-items: start;
}

@media (min-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 380px;
  }
}

.items {
  overflow: hidden;
}

.items__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  border-bottom: 1px solid var(--sk-line);
  background: var(--sk-white);
}

.clear-btn {
  font-size: 0.9rem;
  color: var(--sk-error);
}

.lines {
  list-style: none;
  margin: 0;
  padding: 0;
}

.line {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  grid-template-areas:
    'img info'
    'qty total';
  gap: 16px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--sk-line);
  align-items: center;
}

.line:last-child {
  border-bottom: 0;
}

/* Wider screens: image | name + stepper | subtotal */
@media (min-width: 600px) {
  .line {
    grid-template-columns: 112px minmax(0, 1fr) auto;
    grid-template-areas:
      'img info total'
      'img qty total';
    column-gap: 22px;
    row-gap: 12px;
    align-items: start;
  }

  .line__img {
    align-self: center;
  }

  .line__total {
    align-self: center;
  }
}

.line.is-unavailable .line__img,
.line.is-unavailable .line__info h2 {
  opacity: 0.5;
}

.line__img {
  grid-area: img;
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--sk-r-md);
}

.line__img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8%;
}

.line__info {
  grid-area: info;
  min-width: 0;
}

.line__cat {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sk-ink-3);
}

.line__name {
  font-family: var(--sk-font-display);
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 2px 0 4px;
}

.line__unit {
  font-size: 0.9rem;
}

.line__qty {
  grid-area: qty;
}

.line__stock {
  font-size: 12px;
  margin-top: 6px;
  min-height: 1em;
}

.line__total {
  grid-area: total;
  text-align: right;
}

.line__subtotal {
  font-size: 1.1rem;
  font-weight: 800;
}

.remove {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--sk-ink-3);
  border-radius: 6px;
}

.remove:hover {
  color: var(--sk-error);
}

/* ---------- Summary (solid teal panel) ---------- */
.summary {
  background: var(--sk-teal);
  color: var(--sk-on-teal);
  border-radius: var(--sk-r-xl);
  padding: 28px;
}

@media (min-width: 1100px) {
  .summary {
    position: sticky;
    top: 96px;
  }
}

.summary__rows {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.summary__rows > div {
  display: flex;
  justify-content: space-between;
  color: var(--sk-on-teal-2);
}

.summary__rows dd {
  color: var(--sk-on-teal);
  font-weight: 700;
}

.summary__total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #36606e;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.summary__total strong {
  font-family: var(--sk-font-display);
  font-size: 2rem;
  font-weight: 500;
  color: var(--sk-meadow);
}

.summary__ghost {
  color: var(--sk-on-teal) !important;
}

.summary__continue {
  display: block;
  text-align: center;
  margin-top: 12px;
  color: var(--sk-on-teal-2);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
