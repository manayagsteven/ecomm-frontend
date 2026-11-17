<!-- app/pages/checkout.vue - Finish your order -->
<template>
  <div class="sk-container page">
    <!-- ========================================
         SUCCESS (shown after a completed checkout)
    ========================================= -->
    <section v-if="placedOrder" class="done" aria-live="polite">
      <div class="done__hero sk-tint-peach">
        <span class="done__badge"><v-icon icon="mdi-check" size="28" /></span>
        <span class="sk-eyebrow mt-6">All set</span>
        <h1 class="sk-h1 mt-3">Salamat,<br><em>{{ firstName }}!</em></h1>
        <p class="done__lede">
          We've got your order. Store stock has been adjusted, and your cart is clear for next time.
        </p>
        <div class="d-flex flex-wrap ga-3 mt-8">
          <v-btn to="/#shop" color="primary" size="large" append-icon="mdi-arrow-right">Back to the shop</v-btn>
          <v-btn to="/products" variant="outlined" color="primary" size="large" prepend-icon="mdi-view-dashboard-outline">
            See updated stock in Store Admin
          </v-btn>
        </div>
      </div>

      <div class="done__receipt sk-surface">
        <div class="receipt__head">
          <div>
            <div class="sk-subtle receipt__label">Reference no.</div>
            <div class="receipt__ref">{{ placedOrder.reference }}</div>
          </div>
          <div class="text-right">
            <div class="sk-subtle receipt__label">Date</div>
            <div class="font-weight-bold">{{ placedOrder.date }}</div>
          </div>
        </div>

        <ul class="receipt__lines">
          <li v-for="item in placedOrder.items" :key="item.documentId">
            <span><strong>{{ item.name }}</strong> <span class="sk-subtle">× {{ item.quantity }}</span></span>
            <span class="sk-num">{{ formatPrice(item.subtotal) }}</span>
          </li>
        </ul>

        <dl class="receipt__meta">
          <div><dt>Pieces</dt><dd class="sk-num">{{ placedOrder.totalItems }}</dd></div>
          <div><dt>Paid via</dt><dd>{{ placedOrder.payment }}</dd></div>
          <div><dt>Ship to</dt><dd>{{ placedOrder.customer.fullName }} · {{ placedOrder.customer.contactNumber }}<br>{{ placedOrder.customer.address }}</dd></div>
        </dl>

        <div class="receipt__total">
          <span>Order total</span>
          <strong class="sk-num">{{ formatPrice(placedOrder.totalAmount) }}</strong>
        </div>
      </div>
    </section>

    <!-- ========================================
         EMPTY CART
    ========================================= -->
    <section v-else-if="items.length === 0" class="empty">
      <span class="sk-eyebrow">Checkout</span>
      <h1 class="sk-h1 mt-3">Nothing to <em>check out.</em></h1>
      <p class="sk-lede mt-4">Pick a few items first, then come back to finish your order.</p>
      <v-btn to="/#shop" color="primary" size="large" class="mt-6" append-icon="mdi-arrow-right">Find products</v-btn>
    </section>

    <!-- ========================================
         DETAILS FORM + ITEMS PANEL
    ========================================= -->
    <template v-else>
      <header class="page-head">
        <NuxtLink to="/cart" class="back sk-focus"><v-icon icon="mdi-arrow-left" size="18" /> Return to cart</NuxtLink>
        <h1 class="sk-h1 mt-4">Finish your <em>order</em></h1>
      </header>

      <div class="layout">
        <v-form ref="checkoutForm" class="form" @submit.prevent="placeOrder">
          <!-- Problems found during the stock check -->
          <v-alert
            v-if="problems.length"
            type="error"
            variant="tonal"
            rounded="lg"
            class="mb-6"
            title="Your order didn't go through"
          >
            <ul class="problems">
              <li v-for="problem in problems" :key="problem">{{ problem }}</li>
            </ul>
            Some quantities changed while you were shopping. We've updated your cart, so give it a quick look and try again.
          </v-alert>

          <!-- 1. Contact -->
          <fieldset class="group">
            <legend class="group__legend"><span class="group__num">1</span> Who's receiving it?</legend>
            <div class="group__grid">
              <v-text-field
                v-model.trim="customer.fullName"
                label="Recipient's name"
                autocomplete="name"
                :rules="nameRules"
                prepend-inner-icon="mdi-account-outline"
              />
              <v-text-field
                v-model.trim="customer.contactNumber"
                label="Mobile number"
                placeholder="09XX XXX XXXX"
                autocomplete="tel"
                inputmode="tel"
                :rules="phoneRules"
                prepend-inner-icon="mdi-phone-outline"
                hint="We'll text this number about your delivery, e.g. 0917 123 4567"
              />
            </div>
          </fieldset>

          <!-- 2. Delivery -->
          <fieldset class="group">
            <legend class="group__legend"><span class="group__num">2</span> Where should we deliver?</legend>
            <v-textarea
              v-model.trim="customer.address"
              label="Complete address (house no., street, barangay, city, province)"
              autocomplete="street-address"
              rows="3"
              auto-grow
              :rules="addressRules"
              prepend-inner-icon="mdi-map-marker-outline"
            />
          </fieldset>

          <!-- 3. Payment -->
          <fieldset class="group">
            <legend class="group__legend"><span class="group__num">3</span> How will you pay?</legend>
            <v-radio-group v-model="customer.paymentMethod" :rules="paymentRules" class="pay-group">
              <div class="pay-grid">
                <label
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="pay"
                  :class="{ 'is-on': customer.paymentMethod === method.value }"
                >
                  <v-radio :value="method.value" color="primary" class="pay__radio" />
                  <v-icon :icon="method.icon" size="26" class="pay__icon" />
                  <span>
                    <span class="pay__name">{{ method.label }}</span>
                    <span class="pay__note">{{ method.note }}</span>
                  </span>
                </label>
              </div>
            </v-radio-group>
          </fieldset>
        </v-form>

        <!-- Items panel -->
        <aside class="summary" aria-label="Your items">
          <div class="summary__head">
            <h2 class="sk-h3">Your items</h2>
            <NuxtLink to="/cart" class="summary__edit">Change</NuxtLink>
          </div>

          <ul class="summary__lines">
            <li v-for="item in items" :key="item.documentId" :class="{ 'is-unavailable': !item.available }">
              <div class="summary__img sk-image-well">
                <ProductImage v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
                <v-icon v-else :icon="getCategoryIcon(item.category)" size="22" class="sk-subtle" />
                <span class="summary__qty sk-num">{{ item.quantity }}</span>
              </div>
              <div class="summary__info">
                <div class="summary__name">{{ item.name }}</div>
                <div class="summary__calc sk-num">
                  {{ item.available ? `${item.quantity} × ${formatPrice(item.price)}` : 'Not available' }}
                </div>
              </div>
              <div class="summary__sub sk-num">{{ item.available ? formatPrice(lineSubtotal(item)) : '—' }}</div>
            </li>
          </ul>

          <dl class="summary__rows">
            <div><dt>Pieces</dt><dd class="sk-num">{{ totalItems }}</dd></div>
            <div><dt>Subtotal</dt><dd class="sk-num">{{ formatPrice(totalAmount) }}</dd></div>
            <div><dt>Shipping</dt><dd>On us</dd></div>
          </dl>

          <div class="summary__total">
            <span>Order total</span>
            <strong class="sk-num">{{ formatPrice(totalAmount) }}</strong>
          </div>

          <v-btn
            color="primary"
            size="x-large"
            block
            class="mt-6"
            :loading="placing"
            :disabled="hasUnavailable || totalItems === 0"
            prepend-icon="mdi-lock-outline"
            @click="placeOrder"
          >
            Confirm Order
          </v-btn>
          <p v-if="hasUnavailable" class="summary__warn">
            Take unavailable items out of your cart first.
          </p>
          <p class="summary__fine">
            We double-check stock the moment you confirm.
          </p>
        </aside>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
useHead({ title: 'Place Your Order · ShopKart' })

const cart = useCart()
const { items, totalItems, totalAmount, hasUnavailable, lineSubtotal } = cart
const { loadProducts } = useCatalog()
const { fetchProduct, checkout } = useStrapi()
const { notify } = useToast()

/* ========================================
   FORM STATE + VALIDATION
========================================= */
const checkoutForm = ref(null)
const placing = ref(false)
const problems = ref([])
const placedOrder = ref(null)

const customer = reactive({
  fullName: '',
  contactNumber: '',
  address: '',
  paymentMethod: null,
})

const paymentMethods = [
  { value: 'Cash on Delivery', label: 'Cash on Delivery', note: 'Hand cash to the rider', icon: 'mdi-cash' },
  { value: 'GCash', label: 'GCash', note: 'Pay in the GCash app', icon: 'mdi-wallet-outline' },
  { value: 'Maya', label: 'Maya', note: 'Pay in the Maya app', icon: 'mdi-cellphone-nfc' },
  { value: 'Bank Transfer', label: 'Bank Transfer', note: 'Send from your bank app', icon: 'mdi-bank-outline' },
]

const nameRules = [
  (value) => !!value || 'Please tell us who will receive the order',
  (value) => (value && value.length >= 3) || 'That name looks too short',
  (value) => /^[A-Za-zÀ-ÿñÑ .'-]+$/.test(value || '') || 'Names can only use letters, spaces, periods and hyphens',
]

const phoneRules = [
  (value) => !!value || 'We need a mobile number to reach you',
  (value) =>
    /^(09|\+639)\d{9}$/.test((value || '').replace(/[\s-]/g, '')) ||
    'Use an 11-digit number starting with 09, or +639 followed by 9 digits',
]

const addressRules = [
  (value) => !!value || 'Please add your delivery address',
  (value) => (value && value.length >= 10) || 'Add a bit more detail, like your barangay and city',
]

const paymentRules = [(value) => !!value || 'Pick how you would like to pay']

const firstName = computed(() => placedOrder.value?.customer.fullName.split(' ')[0] || '')

/* ========================================
   STEP 1: re-check every cart item against Strapi
   Returns the latest product data, or a list of problems.
========================================= */
async function verifyStock() {
  const found = []
  const issues = []

  for (const item of items.value) {
    const latest = await fetchProduct(item.documentId)

    if (!latest) {
      issues.push(`${item.name} was taken down from the store.`)
    } else if (!latest.is_active) {
      issues.push(`${item.name} is hidden from the store right now.`)
    } else if (Number(latest.stock) <= 0) {
      issues.push(`${item.name} just sold out.`)
    } else if (item.quantity > Number(latest.stock)) {
      issues.push(`${item.name}: ${latest.stock} left, but your cart has ${item.quantity}.`)
    } else {
      found.push({ item, latest })
    }
  }

  return { found, issues }
}

/* ========================================
   STEP 2: deduct stock in Strapi
   POST /api/products/checkout validates the cart again on the server and
   deducts every quantity in one database transaction (all or nothing).
   A 409 response lists what changed (inactive, deleted, not enough stock).
========================================= */
async function deductStock(checked) {
  return checkout(
    checked.map(({ item }) => ({ documentId: item.documentId, quantity: item.quantity }))
  )
}

function getCheckoutIssues(error) {
  const status = error?.status || error?.statusCode
  return status === 409 ? error?.data?.error?.details?.issues || [] : []
}

/* ========================================
   CONFIRM ORDER
========================================= */
async function placeOrder() {
  problems.value = []

  const validation = await checkoutForm.value?.validate()
  if (validation && !validation.valid) {
    notify('A few details are missing. Check the fields marked in red.', 'error')
    document.querySelector('.v-input--error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (hasUnavailable.value || totalItems.value === 0) {
    notify('Some items in your cart can\'t be bought right now.', 'error')
    return
  }

  placing.value = true

  try {
    const { found, issues } = await verifyStock()

    if (issues.length) {
      problems.value = issues
      await loadProducts() // refresh cart quantities with the latest stock
      notify('Stock changed for some items. Take a quick look at your cart.', 'error')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    let order
    try {
      order = await deductStock(found)
    } catch (error) {
      const serverIssues = getCheckoutIssues(error)
      if (!serverIssues.length) throw error
      // Stock changed between the check and the order (e.g. another customer bought it)
      problems.value = serverIssues
      await loadProducts()
      notify('Stock changed for some items. Take a quick look at your cart.', 'error')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Snapshot the order BEFORE clearing the cart.
    // Prices and totals come from the server, not from the browser.
    placedOrder.value = {
      reference: order.reference,
      date: new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }),
      items: order.items.map((item) => ({
        documentId: item.documentId,
        name: item.name,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      totalItems: order.totalItems,
      totalAmount: order.totalAmount,
      payment: customer.paymentMethod,
      customer: { ...customer },
    }

    // Only clear the cart after Strapi accepted every stock update
    cart.clearCart()
    await loadProducts()
    notify('Order confirmed. Salamat!', 'success')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Order request error:', error)
    notify(`We couldn't complete your order: ${getErrorMessage(error)}`, 'error')
  } finally {
    placing.value = false
  }
}

// Sync cart with the latest product data when the page opens
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.page {
  padding-top: 40px;
  padding-bottom: 96px;
}

.page-head {
  margin-bottom: 32px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--sk-ink-2);
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  border-radius: 6px;
}

.back:hover {
  color: var(--sk-secondary);
}

.empty {
  padding: 64px 0;
}

.layout {
  display: grid;
  gap: 24px;
  align-items: start;
}

@media (min-width: 1100px) {
  .layout {
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 32px;
  }
}

/* ---------- Form groups ---------- */
.group {
  border: 1px solid var(--sk-line);
  border-radius: var(--sk-r-lg);
  background: var(--sk-white);
  padding: 24px 24px 8px;
  margin: 0 0 16px;
  min-width: 0;
}

.group__legend {
  float: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--sk-font-display);
  font-size: 1.3rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.group__legend + * {
  clear: both;
}

.group__num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--sk-primary-soft);
  color: var(--sk-secondary);
  font-family: var(--sk-font-ui);
  font-size: 0.85rem;
  font-weight: 800;
}

.group__grid {
  display: grid;
  gap: 4px 16px;
}

@media (min-width: 700px) {
  .group__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.problems {
  margin: 4px 0 8px 18px;
}

/* ---------- Payment tiles ---------- */
.pay-group :deep(.v-selection-control-group) {
  display: block;
}

.pay-grid {
  display: grid;
  gap: 12px;
  width: 100%;
}

@media (min-width: 600px) {
  .pay-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.pay {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 6px;
  border: 1px solid var(--sk-line-strong);
  border-radius: var(--sk-r-md);
  cursor: pointer;
  background: var(--sk-white);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.pay:hover {
  border-color: var(--sk-secondary);
}

.pay.is-on {
  border-color: var(--sk-primary);
  background: var(--sk-primary-tint);
  box-shadow: inset 0 0 0 1px var(--sk-primary);
}

.pay__radio {
  flex: 0 0 auto;
}

.pay__icon {
  color: var(--sk-secondary);
}

.pay__name {
  display: block;
  font-weight: 800;
}

.pay__note {
  display: block;
  font-size: 0.82rem;
  color: var(--sk-ink-3);
}

/* ---------- Summary ---------- */
.summary {
  background: var(--sk-white);
  border: 1px solid var(--sk-line);
  border-radius: var(--sk-r-xl);
  padding: 26px;
}

@media (min-width: 1100px) {
  .summary {
    position: sticky;
    top: 96px;
  }
}

.summary__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.summary__edit {
  color: var(--sk-secondary);
  font-weight: 700;
  font-size: 0.9rem;
}

.summary__lines {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
  display: grid;
  gap: 14px;
}

.summary__lines li {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.summary__lines li.is-unavailable {
  opacity: 0.5;
}

.summary__img {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: visible;
}

.summary__img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  mix-blend-mode: multiply;
  padding: 10%;
  border-radius: 12px;
}

.summary__qty {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--sk-secondary);
  color: var(--sk-white);
  font-size: 11px;
  font-weight: 800;
}

.summary__name {
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary__calc {
  font-size: 0.82rem;
  color: var(--sk-ink-3);
}

.summary__sub {
  font-weight: 800;
}

.summary__rows {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--sk-line);
  display: grid;
  gap: 10px;
}

.summary__rows > div {
  display: flex;
  justify-content: space-between;
  color: var(--sk-ink-2);
}

.summary__rows dd {
  color: var(--sk-ink);
  font-weight: 700;
}

.summary__total {
  margin-top: 16px;
  padding: 16px 18px;
  border-radius: var(--sk-r-md);
  background: var(--sk-primary-soft);
  color: var(--sk-secondary);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-weight: 700;
}

.summary__total strong {
  font-family: var(--sk-font-display);
  font-size: 1.8rem;
  font-weight: 500;
}

.summary__warn {
  margin: 12px 0 0;
  color: var(--sk-error);
  font-size: 0.85rem;
  font-weight: 600;
}

.summary__fine {
  margin: 12px 0 0;
  font-size: 0.8rem;
  color: var(--sk-ink-3);
  text-align: center;
}

/* ---------- Success ---------- */
.done {
  display: grid;
  gap: 20px;
  align-items: start;
}

@media (min-width: 1100px) {
  .done {
    grid-template-columns: 1.2fr 1fr;
  }
}

.done__hero {
  border-radius: var(--sk-r-xl);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.done__badge {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--sk-secondary);
  color: var(--sk-primary-soft);
}

.done__lede {
  margin: 16px 0 0;
  max-width: 42ch;
  line-height: 1.6;
}

.done__receipt {
  padding: 28px;
}

.receipt__head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px dashed var(--sk-line-strong);
}

.receipt__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.receipt__ref {
  font-family: var(--sk-font-display);
  font-size: 1.5rem;
  font-weight: 500;
}

.receipt__lines {
  list-style: none;
  padding: 0;
  margin: 18px 0;
  display: grid;
  gap: 10px;
}

.receipt__lines li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.receipt__meta {
  display: grid;
  gap: 10px;
  padding: 16px 0;
  border-top: 1px solid var(--sk-line);
  font-size: 0.92rem;
}

.receipt__meta > div {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 12px;
}

.receipt__meta dt {
  color: var(--sk-ink-3);
}

.receipt__total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 16px 18px;
  border-radius: var(--sk-r-md);
  background: var(--sk-secondary);
  color: var(--sk-on-secondary);
}

.receipt__total strong {
  font-family: var(--sk-font-display);
  font-size: 1.7rem;
  font-weight: 500;
  color: var(--sk-primary-soft);
}
</style>
