<!-- ========================================
     CART DRAWER
     Opens from the right when the cart icon is clicked.
     Solid white panel over a dimmed page (no blur).
========================================= -->
<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="right"
    temporary
    :width="drawerWidth"
    scrim="#0E2129"
    class="cd"
    aria-label="Shopping cart"
  >
    <div class="cd__inner">
      <!-- Header -->
      <header class="cd__head">
        <div>
          <span class="sk-eyebrow">Your cart</span>
          <h2 class="sk-h3 mt-2">
            {{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}
          </h2>
        </div>
        <v-btn icon="mdi-close" variant="text" aria-label="Close cart" @click="closeDrawer" />
      </header>

      <!-- Empty state -->
      <div v-if="items.length === 0" class="cd__empty">
        <div class="cd__empty-art"><v-icon icon="mdi-cart-outline" size="44" /></div>
        <h3 class="sk-h3 mt-5">Your cart is empty</h3>
        <p class="sk-muted mt-2">Add a few products and they'll show up here.</p>
        <v-btn color="primary" class="mt-5" append-icon="mdi-arrow-right" @click="goTo('/#shop')">
          Start shopping
        </v-btn>
      </div>

      <template v-else>
        <v-alert
          v-if="hasUnavailable"
          type="warning"
          variant="tonal"
          density="compact"
          rounded="lg"
          class="mx-5 mt-4"
        >
          Some items are no longer available. Remove them to check out.
        </v-alert>

        <!-- Items -->
        <ul class="cd__lines">
          <li v-for="item in items" :key="item.documentId" class="cd__line" :class="{ 'is-unavailable': !item.available }">
            <div class="cd__img sk-image-well">
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name">
              <v-icon v-else :icon="getCategoryIcon(item.category)" size="26" class="sk-subtle" />
            </div>

            <div class="cd__info">
              <div class="cd__row">
                <span class="cd__name">{{ item.name }}</span>
                <button type="button" class="cd__remove sk-focus" :aria-label="`Remove ${item.name}`" @click="remove(item)">
                  <v-icon icon="mdi-trash-can-outline" size="18" />
                </button>
              </div>
              <div class="cd__unit sk-subtle sk-num">{{ formatPrice(item.price) }} each</div>

              <div class="cd__row mt-3">
                <div v-if="item.available" class="sk-stepper cd__stepper" role="group" :aria-label="`Quantity for ${item.name}`">
                  <button type="button" :disabled="item.quantity <= 1" aria-label="Decrease quantity" @click="changeQty(item, item.quantity - 1)">
                    <v-icon icon="mdi-minus" size="16" />
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
                    <v-icon icon="mdi-plus" size="16" />
                  </button>
                </div>
                <span v-else class="sk-pill sk-pill--error">Unavailable</span>

                <span class="cd__sub sk-num">{{ item.available ? formatPrice(lineSubtotal(item)) : '—' }}</span>
              </div>

              <div v-if="item.available && item.quantity >= item.stock" class="cd__limit">
                Max stock reached ({{ item.stock }})
              </div>
            </div>
          </li>
        </ul>

        <!-- Totals + actions -->
        <footer class="cd__foot">
          <div class="cd__totals">
            <div><span>Total items</span><strong class="sk-num">{{ totalItems }}</strong></div>
            <div><span>Delivery</span><strong>Free</strong></div>
          </div>
          <div class="cd__total">
            <span>Total amount</span>
            <strong class="sk-num">{{ formatPrice(totalAmount) }}</strong>
          </div>
          <v-btn
            color="primary"
            size="x-large"
            block
            append-icon="mdi-arrow-right"
            :disabled="hasUnavailable || totalItems === 0"
            class="mt-4"
            @click="goTo('/checkout')"
          >
            Checkout all
          </v-btn>
          <v-btn variant="outlined" color="primary" block class="mt-2" @click="goTo('/cart')">
            View full cart
          </v-btn>
        </footer>
      </template>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
// @ts-nocheck
import { useDisplay } from 'vuetify'

const { isOpen, closeDrawer } = useCartDrawer()
const { items, totalItems, totalAmount, hasUnavailable, lineSubtotal, updateQuantity, removeItem } = useCart()
const { loadProducts } = useCatalog()
const { notify } = useToast()
const { width } = useDisplay()
const route = useRoute()
const router = useRouter()

// Full width on small phones, 420px everywhere else
const drawerWidth = computed(() => Math.min(420, width.value))

// Refresh stock/prices from Strapi each time the drawer opens
watch(isOpen, (open) => {
  if (open && items.value.length) loadProducts()
})

// Close the drawer whenever the page changes
watch(() => route.fullPath, closeDrawer)

function changeQty(item, value) {
  const result = updateQuantity(item.documentId, Number(value))
  if (!result.ok && result.message) notify(result.message, 'warning')
}

function remove(item) {
  removeItem(item.documentId)
  notify(`${item.name} removed from cart.`, 'info')
}

function goTo(path) {
  closeDrawer()
  router.push(path)
}
</script>

<style scoped>
.cd {
  background: var(--sk-white) !important;
  border-left: 1px solid var(--sk-line) !important;
  box-shadow: var(--sk-shadow-md) !important;
}

.cd__inner {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.cd__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid var(--sk-line-white);
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--sk-white);
}

/* ---------- Empty ---------- */
.cd__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 28px;
}

.cd__empty-art {
  width: 104px;
  height: 104px;
  border-radius: var(--sk-r-lg);
  display: grid;
  place-items: center;
  background: var(--sk-sky);
  color: var(--sk-teal);
}

/* ---------- Lines ---------- */
.cd__lines {
  list-style: none;
  margin: 0;
  padding: 0 20px;
  flex: 1;
}

.cd__line {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr);
  gap: 14px;
  padding: 18px 0;
  border-bottom: 1px solid var(--sk-line-white);
}

.cd__line:last-child {
  border-bottom: 0;
}

.cd__line.is-unavailable .cd__img,
.cd__line.is-unavailable .cd__name {
  opacity: 0.5;
}

.cd__img {
  width: 76px;
  height: 76px;
  border-radius: var(--sk-r-md);
}

.cd__img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8%;
}

.cd__info {
  min-width: 0;
}

.cd__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cd__name {
  font-family: var(--sk-font-display);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1.25;
}

.cd__unit {
  font-size: 0.85rem;
  margin-top: 2px;
}

.cd__remove {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 8px;
  display: grid;
  place-items: center;
  color: var(--sk-ink-3);
}

.cd__remove:hover {
  color: var(--sk-error);
  background: #fbe5e1;
}

.cd__stepper {
  height: 36px;
}

.cd__stepper button {
  width: 34px;
}

.cd__stepper input {
  width: 36px;
}

.cd__sub {
  font-weight: 800;
}

.cd__limit {
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--sk-warning);
}

/* ---------- Footer ---------- */
.cd__foot {
  position: sticky;
  bottom: 0;
  padding: 18px 20px 22px;
  background: var(--sk-white);
  border-top: 1px solid var(--sk-line);
}

.cd__totals {
  display: grid;
  gap: 8px;
  font-size: 0.92rem;
  color: var(--sk-ink-2);
}

.cd__totals > div {
  display: flex;
  justify-content: space-between;
}

.cd__totals strong {
  color: var(--sk-ink);
}

.cd__total {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: var(--sk-r-md);
  background: var(--sk-meadow);
  color: var(--sk-teal);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-weight: 700;
}

.cd__total strong {
  font-family: var(--sk-font-display);
  font-size: 1.6rem;
  font-weight: 500;
}
</style>
