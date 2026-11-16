<!-- ========================================
     PRODUCT CARD
     White surface, fine border, square image well.
     Name, price, stock and actions always sit in the same place.
========================================= -->
<template>
  <article class="pc" :class="{ 'is-soldout': soldOut }">
    <div class="pc__media sk-image-well">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="product.image?.alternativeText || product.name"
        loading="lazy"
      >
      <v-icon v-else :icon="getCategoryIcon(product.category)" size="56" class="pc__placeholder" />

      <span v-if="soldOut" class="pc__flag">Sold out</span>

      <!-- Wishlist toggle -->
      <button
        type="button"
        class="pc__wish sk-focus"
        :class="{ 'is-on': wishlisted }"
        :aria-pressed="wishlisted"
        :aria-label="wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`"
        @click="onToggleWishlist"
      >
        <v-icon :icon="wishlisted ? 'mdi-heart' : 'mdi-heart-outline'" size="20" />
      </button>
    </div>

    <div class="pc__body">
      <div class="pc__meta">
        <span class="pc__category">{{ product.category || 'Uncategorized' }}</span>
        <span class="sk-pill" :class="`sk-pill--${stock.tone}`">{{ stock.label }}</span>
      </div>

      <h3 class="pc__name">{{ product.name }}</h3>
      <p class="pc__desc">{{ product.description || 'No description provided.' }}</p>

      <div class="pc__foot">
        <div>
          <div class="pc__price sk-num">{{ formatPrice(product.price) }}</div>
          <div v-if="inCart" class="pc__incart">{{ inCart }} in cart</div>
        </div>

        <v-btn
          color="primary"
          :disabled="soldOut || atLimit"
          :prepend-icon="soldOut ? undefined : atLimit ? 'mdi-check' : 'mdi-plus'"
          class="pc__add"
          :aria-label="`Add ${product.name} to cart`"
          @click="onAdd"
        >
          {{ soldOut ? 'Unavailable' : atLimit ? 'Max added' : 'Add' }}
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
  notify(added ? `${props.product.name} saved to wishlist.` : `${props.product.name} removed from wishlist.`, 'info')
}
</script>

<style scoped>
.pc {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--sk-white);
  border: 1px solid var(--sk-line);
  border-radius: var(--sk-r-lg);
  overflow: hidden;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.pc:hover {
  border-color: var(--sk-line-strong);
  transform: translateY(-2px);
  box-shadow: var(--sk-shadow-md);
}

.pc__media {
  position: relative;
  aspect-ratio: 1 / 1;
}

.pc__media img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10%;
  transition: transform 0.35s ease;
}

.pc:hover .pc__media img {
  transform: scale(1.04);
}

.pc__placeholder {
  color: var(--sk-line-strong);
}

.is-soldout .pc__media img {
  filter: grayscale(0.9);
  opacity: 0.55;
}

.pc__flag {
  position: absolute;
  left: 12px;
  top: 12px;
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--sk-ink);
  color: var(--sk-white);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pc__wish {
  position: absolute;
  right: 12px;
  top: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--sk-white);
  border: 1px solid var(--sk-line);
  color: var(--sk-ink-2);
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.pc__wish:hover {
  color: var(--sk-teal);
  transform: scale(1.06);
}

.pc__wish.is-on {
  background: var(--sk-meadow);
  border-color: var(--sk-meadow);
  color: var(--sk-teal);
}

.pc__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px 18px 18px;
}

.pc__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.pc__category {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--sk-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pc__name {
  font-family: var(--sk-font-display);
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  margin: 0 0 6px;
}

.pc__desc {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--sk-ink-2);
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6em;
}

.pc__foot {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.pc__price {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--sk-ink);
}

.pc__incart {
  font-size: 12px;
  font-weight: 700;
  color: var(--sk-success);
  margin-top: 2px;
}

.pc__add {
  flex-shrink: 0;
}

@media (max-width: 599px) {
  .pc__body {
    padding: 12px 12px 14px;
  }

  .pc__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .pc__name {
    font-size: 1.02rem;
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
