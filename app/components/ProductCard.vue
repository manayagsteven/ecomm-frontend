<!-- ========================================
     PRODUCT CARD
     Soft grey card, photo centred on top, then category,
     name, price and the add-to-cart button. Every card keeps
     the same layout so rows line up.
========================================= -->
<template>
  <article class="pc" :class="{ 'is-soldout': soldOut }">
    <div class="pc__media">
      <ProductImage
        v-if="imageUrl"
        :src="imageUrl"
        :alt="product.image?.alternativeText || product.name"
        class="pc__img"
      />
      <v-icon v-else :icon="getCategoryIcon(product.category)" size="56" class="pc__placeholder" />

      <span v-if="soldOut" class="pc__flag">Gone for now</span>
      <span v-else-if="stock.tone === 'warning'" class="pc__flag pc__flag--low">{{ stock.label }}</span>

      <!-- Wishlist toggle -->
      <button
        type="button"
        class="pc__wish sk-focus"
        :class="{ 'is-on': wishlisted }"
        :aria-pressed="wishlisted"
        :aria-label="wishlisted ? `Unsave ${product.name}` : `Save ${product.name} for later`"
        @click="onToggleWishlist"
      >
        <v-icon :icon="wishlisted ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
      </button>
    </div>

    <div class="pc__body">
      <span class="pc__category">{{ product.category || 'Uncategorized' }}</span>
      <h3 class="pc__name">{{ product.name }}</h3>
      <p class="pc__desc">{{ product.description || 'More details coming soon.' }}</p>

      <div class="pc__foot">
        <div class="pc__pricing">
          <div class="pc__price sk-num">{{ formatPrice(product.price) }}</div>
          <div v-if="inCart" class="pc__incart">{{ inCart }} in your cart</div>
          <div v-else class="pc__stock" :class="`pc__stock--${stock.tone}`">{{ stock.label }}</div>
        </div>

        <v-btn
          color="primary"
          :disabled="soldOut || atLimit"
          :prepend-icon="soldOut ? undefined : atLimit ? 'mdi-check' : 'mdi-cart-plus'"
          class="pc__add"
          :aria-label="`Put ${product.name} in your cart`"
          @click="onAdd"
        >
          {{ soldOut ? 'Unavailable' : atLimit ? 'All in cart' : 'Add' }}
        </v-btn>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Product } from '~/composables/useStrapi'

const props = defineProps<{ product: Product }>()

const { getImageUrl } = useStrapi()
const cart = useCart()
const wishlist = useWishlist()
const { notify } = useToast()

const imageUrl = computed(() => getImageUrl(props.product.image))
const stock = computed(() => getStockState(props.product.stock))
const soldOut = computed(() => Number(props.product.stock || 0) <= 0 || !props.product.is_active)
const inCart = computed(() => cart.getQuantity(props.product.documentId))
// Disable "Add" once the cart holds every unit in stock
const atLimit = computed(() => !soldOut.value && inCart.value >= Number(props.product.stock))
const wishlisted = computed(() => wishlist.isWishlisted(props.product.documentId))

function onAdd() {
  const result = cart.addToCart(props.product)
  notify(result.message, result.ok ? 'success' : 'warning')
}

function onToggleWishlist() {
  const added = wishlist.toggleWishlist(props.product.documentId)
  notify(added ? `Saved ${props.product.name} for later.` : `${props.product.name} is off your saved list.`, 'info')
}
</script>

<style scoped>
.pc {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sk-well);
  border-radius: var(--sk-r-lg);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pc:hover {
  transform: translateY(-3px);
  box-shadow: var(--sk-shadow-md);
}

/* Every photo sits in the same square box, centred in the frame.
   Photos are pre-trimmed (ProductImage), so the item itself fills the box. */
.pc__media {
  position: relative;
  aspect-ratio: 1 / 0.9;
  display: grid;
  place-items: center;
  overflow: hidden;
}

.pc__img {
  display: block;
  width: 70%;
  height: 70%;
  object-fit: contain;
  object-position: center;
  /* White photo backgrounds blend into the grey card */
  mix-blend-mode: multiply;
  transition: transform 0.35s ease, opacity 0.25s ease;
}

.pc:hover .pc__img {
  transform: scale(1.06);
}

.pc__placeholder {
  color: var(--sk-line-strong);
}

/* Sold out: muted, but the product is still easy to recognise */
.is-soldout .pc__img.is-ready {
  filter: saturate(0.35);
  opacity: 0.7;
}

.pc__flag {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--sk-secondary);
  color: var(--sk-white);
  font-size: 11px;
  font-weight: 600;
}

.pc__flag--low {
  background: var(--sk-primary-soft);
  color: var(--sk-ink);
}

.pc__wish {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--sk-white);
  color: var(--sk-ink-2);
  box-shadow: var(--sk-shadow-sm);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.pc__wish:hover {
  color: var(--sk-ink);
  transform: scale(1.08);
}

.pc__wish.is-on {
  background: var(--sk-primary);
  color: var(--sk-on-primary);
}

.pc__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 6px 18px 18px;
}

.pc__category {
  font-size: 12px;
  font-weight: 500;
  color: var(--sk-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc__name {
  font-family: var(--sk-font-display);
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 4px 0 6px;
  color: var(--sk-ink);
}

.pc__desc {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--sk-ink-3);
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.55em;
}

.pc__foot {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.pc__price {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sk-ink);
}

.pc__incart,
.pc__stock {
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
  color: var(--sk-ink-3);
}

.pc__incart,
.pc__stock--success {
  color: #15803d;
}

.pc__stock--warning {
  color: var(--sk-warning-ink);
}

.pc__stock--error {
  color: #b91c1c;
}

.pc__add {
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .pc__body {
    padding: 4px 12px 14px;
  }

  .pc__name {
    font-size: 0.95rem;
  }

  .pc__desc {
    display: none;
  }

  .pc__foot {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .pc__wish {
    width: 34px;
    height: 34px;
    right: 8px;
    top: 8px;
  }
}
</style>
