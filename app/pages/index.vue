<!-- app/pages/index.vue - ShopKart storefront homepage -->
<template>
  <div>
    <!-- ========================================
         HERO BANNER (orange, rounded, featured product on the right)
    ========================================= -->
    <section class="sk-container hero-wrap" aria-labelledby="hero-title">
      <div class="hero">
        <div class="hero__copy">
          <span class="hero__kicker">Fresh drops · {{ year }}</span>
          <h1 id="hero-title" class="hero__title">Good Finds,<br>Right at Your Door</h1>
          <p class="hero__lede">
            From phones and perfume to gas stoves and plushies, pick what you
            need and we'll bring it to you. Pay the rider in cash, or settle
            it with GCash, Maya or a bank transfer.
          </p>
          <div class="hero__actions">
            <v-btn color="secondary" size="large" append-icon="mdi-arrow-right" @click="scrollTo('shop')">
              Start Browsing
            </v-btn>
            <v-btn variant="outlined" size="large" class="hero__ghost" @click="scrollTo('categories')">
              See Departments
            </v-btn>
          </div>

          <dl class="hero__facts">
            <div>
              <dd class="sk-num">{{ loading && !loaded ? '–' : products.length }}</dd>
              <dt>Items listed</dt>
            </div>
            <div>
              <dd class="sk-num">{{ categoriesInUse }}</dd>
              <dt>Departments</dt>
            </div>
            <div>
              <dd class="sk-num">{{ unitsInStock }}</dd>
              <dt>Pieces ready to ship</dt>
            </div>
          </dl>
        </div>

        <!-- Featured product -->
        <div class="hero__visual">
          <!-- Stage: soft glow + rings behind, a podium underneath the product -->
          <div class="hero__stage">
            <span class="hero__glow" aria-hidden="true" />
            <span class="hero__ring hero__ring--outer" aria-hidden="true" />
            <span class="hero__ring hero__ring--inner" aria-hidden="true" />
            <span class="hero__podium" aria-hidden="true" />

            <template v-if="featured">
              <ProductImage
                v-if="getImageUrl(featured.image)"
                :src="getImageUrl(featured.image)"
                :alt="featured.name"
                class="hero__img"
              />
              <v-icon v-else :icon="getCategoryIcon(featured.category)" size="120" class="hero__icon" />
            </template>
            <v-progress-circular v-else-if="loading" indeterminate color="secondary" class="hero__icon" />
            <v-icon v-else icon="mdi-shopping-outline" size="120" class="hero__icon" />
          </div>

          <template v-if="featured">
            <div class="hero__card">
              <div class="hero__card-info">
                <span class="hero__card-label">Spotlight · {{ featured.category || 'Just in' }}</span>
                <strong class="hero__card-name">{{ featured.name }}</strong>
                <span class="hero__card-price sk-num">{{ formatPrice(featured.price) }}</span>
              </div>
              <v-btn
                color="primary"
                icon="mdi-cart-plus"
                :disabled="Number(featured.stock) <= 0"
                :aria-label="`Put ${featured.name} in your cart`"
                @click="addFeatured"
              />
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- ========================================
         FEATURED PRODUCTS
    ========================================= -->
    <section
      v-if="(loading && !loaded) || featuredProducts.length"
      class="sk-container sk-section featured"
      aria-labelledby="featured-title"
    >
      <div class="sk-section-head">
        <h2 id="featured-title" class="sk-h2">This Week's Picks</h2>
        <v-btn color="primary" append-icon="mdi-arrow-right" @click="scrollTo('shop')">View Full Catalog</v-btn>
      </div>

      <div v-if="loading && !loaded" class="grid" aria-busy="true">
        <div v-for="n in 4" :key="n" class="skeleton">
          <div class="skeleton__img" />
          <div class="skeleton__line w-50" />
          <div class="skeleton__line w-75" />
        </div>
      </div>
      <div v-else class="grid">
        <ProductCard v-for="product in featuredProducts" :key="product.documentId" :product="product" />
      </div>
    </section>

    <!-- ========================================
         SHOP BY CATEGORY (horizontal scroller with arrows)
    ========================================= -->
    <section id="categories" class="sk-container sk-section sk-anchor cats" aria-labelledby="categories-title">
      <div class="sk-section-head">
        <h2 id="categories-title" class="sk-h2">Browse by Department</h2>
        <div class="cats__arrows">
          <button type="button" class="cats__arrow sk-focus" aria-label="Scroll departments left" @click="scrollCategories(-1)">
            <v-icon icon="mdi-chevron-left" />
          </button>
          <button type="button" class="cats__arrow sk-focus" aria-label="Scroll departments right" @click="scrollCategories(1)">
            <v-icon icon="mdi-chevron-right" />
          </button>
        </div>
      </div>

      <div ref="categoryTrack" class="cats__track">
        <button
          v-for="tile in categoryTiles"
          :key="tile.name"
          type="button"
          class="cat sk-focus"
          :class="{ 'is-selected': selectedCategory === tile.name }"
          @click="selectCategory(tile.name, true)"
        >
          <span class="cat__text">
            <span class="cat__name">{{ tile.label || tile.name }}</span>
            <span class="cat__blurb">{{ tile.blurb }} · {{ tile.count }} {{ tile.count === 1 ? 'listing' : 'listings' }}</span>
            <span class="cat__link">Explore {{ tile.name === 'All Categories' ? 'the catalog' : tile.name }} <v-icon icon="mdi-chevron-right" size="16" /></span>
          </span>
          <span class="cat__media">
            <ProductImage v-if="tile.image" :src="tile.image" alt="" class="cat__img" />
            <v-icon v-else :icon="tile.icon" size="72" class="cat__icon" />
          </span>
        </button>
      </div>
    </section>

    <!-- ========================================
         ALL PRODUCTS: search, category filter, sort, grid
    ========================================= -->
    <section id="shop" class="sk-container sk-section sk-anchor shop" aria-labelledby="shop-title">
      <div class="sk-section-head">
        <div>
          <h2 id="shop-title" class="sk-h2">The Full Catalog</h2>
          <p class="sk-muted mt-1 mb-0">Type a product name or keyword, or tap a department to narrow things down.</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <v-text-field
          v-model="search"
          placeholder="Try “perfume” or “gas stove”"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="toolbar__search"
          aria-label="Find a product"
        />
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          item-title="label"
          item-value="value"
          hide-details
          class="toolbar__sort"
          aria-label="Sort the catalog"
          prepend-inner-icon="mdi-sort"
        />
      </div>

      <!-- Category filter chips -->
      <div class="chips" role="group" aria-label="Filter by department">
        <button
          v-for="name in ['All Categories', ...CATEGORY_NAMES]"
          :key="name"
          type="button"
          class="chip sk-focus"
          :class="{ 'is-on': selectedCategory === name }"
          :aria-pressed="selectedCategory === name"
          @click="selectCategory(name)"
        >
          {{ name === 'All Categories' ? 'Everything' : name }}
          <span class="chip__count sk-num">{{ name === 'All Categories' ? products.length : categoryCounts[name] || 0 }}</span>
        </button>
      </div>

      <div class="result-line">
        <span class="sk-muted">
          <strong class="sk-num">{{ filteredProducts.length }}</strong>
          {{ filteredProducts.length === 1 ? 'item' : 'items' }} found
          <template v-if="selectedCategory !== 'All Categories'"> in <strong>{{ selectedCategory }}</strong></template>
          <template v-if="search"> for “<strong>{{ search }}</strong>”</template>
        </span>
        <button v-if="hasFilters" type="button" class="sk-link sk-focus" @click="clearFilters">Reset filters</button>
      </div>

      <!-- Loading -->
      <div v-if="loading && !loaded" class="grid" aria-busy="true">
        <div v-for="n in 8" :key="n" class="skeleton">
          <div class="skeleton__img" />
          <div class="skeleton__line w-50" />
          <div class="skeleton__line w-75" />
          <div class="skeleton__line w-25" />
        </div>
      </div>

      <!-- API error -->
      <div v-else-if="error" class="state">
        <v-icon icon="mdi-cloud-alert-outline" size="44" color="error" />
        <h3 class="sk-h3 mt-3">We can't reach the store right now</h3>
        <p class="sk-muted mt-2">{{ error }}</p>
        <v-btn color="primary" class="mt-5" prepend-icon="mdi-refresh" @click="loadProducts">Reload</v-btn>
      </div>

      <!-- No products at all -->
      <div v-else-if="products.length === 0" class="state">
        <v-icon icon="mdi-package-variant" size="44" class="sk-subtle" />
        <h3 class="sk-h3 mt-3">The shelves are empty</h3>
        <p class="sk-muted mt-2">Products you publish from Store Admin will show up here.</p>
        <v-btn to="/products" color="primary" class="mt-5" prepend-icon="mdi-plus">Open Store Admin</v-btn>
      </div>

      <!-- No match for the filters -->
      <div v-else-if="filteredProducts.length === 0" class="state">
        <v-icon icon="mdi-magnify-close" size="44" class="sk-subtle" />
        <h3 class="sk-h3 mt-3">No matches for that</h3>
        <p class="sk-muted mt-2">Try another keyword, or switch back to Everything.</p>
        <v-btn color="secondary" variant="outlined" class="mt-5" @click="clearFilters">See everything</v-btn>
      </div>

      <!-- Product grid -->
      <div v-else class="grid">
        <ProductCard v-for="product in filteredProducts" :key="product.documentId" :product="product" />
      </div>
    </section>

    <!-- ========================================
         EXPERIENCE (three service highlights)
    ========================================= -->
    <section class="sk-container experience-wrap" aria-labelledby="experience-title">
      <div class="experience">
        <h2 id="experience-title" class="sk-h2 experience__title">
          Shopping Here Is<br>Easy From Start to Finish
        </h2>

        <div class="experience__grid">
          <div v-for="item in services" :key="item.title" class="service">
            <span class="service__icon"><v-icon :icon="item.icon" size="26" /></span>
            <h3 class="service__title">{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </div>

        <v-btn color="primary" size="large" @click="scrollTo('shop')">Find Something</v-btn>
      </div>
    </section>

    <!-- ========================================
         WHY SHOPKART (four reasons around a product photo)
    ========================================= -->
    <section id="why" class="sk-container sk-section sk-anchor why" aria-labelledby="why-title">
      <h2 id="why-title" class="sk-h2 why__title">The ShopKart Promise</h2>

      <div class="why__grid">
        <div class="why__col">
          <div v-for="reason in reasons.slice(0, 2)" :key="reason.title" class="reason">
            <h3 class="reason__title"><v-icon icon="mdi-play-outline" size="20" class="reason__mark" />{{ reason.title }}</h3>
            <p>{{ reason.text }}</p>
          </div>
        </div>

        <div class="why__visual">
          <div class="why__disc" />
          <ProductImage v-if="promoImage" :src="promoImage" alt="" class="why__img" />
          <v-icon v-else icon="mdi-headphones" size="140" class="why__icon" />
        </div>

        <div class="why__col">
          <div v-for="reason in reasons.slice(2)" :key="reason.title" class="reason">
            <h3 class="reason__title"><v-icon icon="mdi-play-outline" size="20" class="reason__mark" />{{ reason.title }}</h3>
            <p>{{ reason.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         NEWSLETTER (charcoal banner)
    ========================================= -->
    <section class="sk-container newsletter-wrap" aria-labelledby="newsletter-title">
      <div class="newsletter">
        <div>
          <h2 id="newsletter-title" class="sk-h2">Be the First to Know</h2>
          <p class="newsletter__lede">
            One short email a month about new items and restocks. Leave the list whenever you want.
          </p>
        </div>

        <v-form ref="newsletterForm" class="newsletter__form" @submit.prevent="subscribe">
          <template v-if="!subscribed">
            <label for="newsletter-email" class="newsletter__label">Your email</label>
            <div class="newsletter__row">
              <v-text-field
                id="newsletter-email"
                v-model="email"
                type="email"
                placeholder="juan@email.com"
                bg-color="white"
                :rules="emailRules"
                validate-on="submit"
                class="newsletter__field"
              />
              <v-btn type="submit" color="primary" size="x-large" :loading="subscribing">Sign Me Up</v-btn>
            </div>
          </template>
          <div v-else class="newsletter__done" role="status">
            <v-icon icon="mdi-email-check-outline" size="32" />
            <div>
              <strong>You're in!</strong>
              <div>Watch {{ subscribedEmail }} for our next update.</div>
            </div>
          </div>
        </v-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

useHead({ title: 'ShopKart · Good finds, right at your door' })

const route = useRoute()
const router = useRouter()
const year = new Date().getFullYear()

/* ========================================
   DATA (active products from Strapi)
========================================= */
const { products, loading, loaded, error, loadProducts } = useCatalog()
const { getImageUrl } = useStrapi()
const cart = useCart()
const { notify } = useToast()

/* ========================================
   SEARCH, CATEGORY FILTER, SORT
========================================= */
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const selectedCategory = ref(
  typeof route.query.category === 'string' ? route.query.category : 'All Categories'
)
const sortBy = ref('newest')

const sortOptions = [
  { label: 'Latest arrivals', value: 'newest' },
  { label: 'Lowest price', value: 'price-asc' },
  { label: 'Highest price', value: 'price-desc' },
  { label: 'Alphabetical (A–Z)', value: 'name' },
]

const filteredProducts = computed(() => {
  const keyword = (search.value || '').toLowerCase().trim()

  const list = products.value.filter((product) => {
    // Customers only ever see active products
    if (!product.is_active) return false

    const matchesCategory =
      selectedCategory.value === 'All Categories' || product.category === selectedCategory.value

    const matchesSearch =
      !keyword ||
      product.name?.toLowerCase().includes(keyword) ||
      product.description?.toLowerCase().includes(keyword) ||
      product.category?.toLowerCase().includes(keyword)

    return matchesCategory && matchesSearch
  })

  // Sort a copy so the original order stays intact
  return [...list].sort((a, b) => {
    if (sortBy.value === 'price-asc') return Number(a.price) - Number(b.price)
    if (sortBy.value === 'price-desc') return Number(b.price) - Number(a.price)
    if (sortBy.value === 'name') return a.name.localeCompare(b.name)
    return 0 // "newest": Strapi already returns createdAt:desc
  })
})

const hasFilters = computed(() => !!search.value || selectedCategory.value !== 'All Categories')

function selectCategory(name, scroll = false) {
  selectedCategory.value = name
  // Keep the URL in sync so footer links and refreshes keep the filter
  const query = { ...route.query }
  if (name === 'All Categories') delete query.category
  else query.category = name
  router.replace({ query })
  if (scroll) scrollTo('shop')
}

function clearFilters() {
  search.value = ''
  selectCategory('All Categories')
}

// Footer category links change the query while we are already on this page
watch(
  () => route.query.category,
  (value) => {
    selectedCategory.value = typeof value === 'string' ? value : 'All Categories'
  }
)

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ========================================
   CATEGORY CARDS (counts and photos come from Strapi data)
========================================= */
const categoryCounts = computed(() => {
  const counts = {}
  for (const product of products.value) {
    const key = product.category || 'Uncategorized'
    counts[key] = (counts[key] || 0) + 1
  }
  return counts
})

const categoriesInUse = computed(() => Object.keys(categoryCounts.value).length)
const unitsInStock = computed(() =>
  products.value.reduce((sum, product) => sum + Number(product.stock || 0), 0)
)

// First product photo in each category, used on its card
function categoryImage(name) {
  const product = products.value.find((item) => item.category === name && item.image)
  return getImageUrl(product?.image)
}

const categoryTiles = computed(() => [
  ...CATEGORIES.map((category) => ({
    ...category,
    count: categoryCounts.value[category.name] || 0,
    image: categoryImage(category.name),
  })),
  {
    name: 'All Categories',
    label: 'Everything',
    icon: 'mdi-view-grid-outline',
    blurb: 'Every department in one place',
    count: products.value.length,
    image: null,
  },
])

const categoryTrack = ref(null)

function scrollCategories(direction) {
  const track = categoryTrack.value
  if (!track) return
  track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
}

/* ========================================
   FEATURED + PROMO IMAGERY (from real products)
========================================= */
const inStockProducts = computed(() =>
  products.value.filter((product) => product.is_active && Number(product.stock) > 0)
)

// Product shown in the hero. Matched by name; if it is missing or sold out,
// the first in-stock product with a photo is used instead.
const HERO_PRODUCT_NAME = 'iphone 16'

const featured = computed(() => {
  const list = inStockProducts.value
  return (
    list.find((product) => product.name?.toLowerCase().trim() === HERO_PRODUCT_NAME) ||
    list.find((product) => product.image) ||
    list[0] ||
    null
  )
})

// Four in-stock products with photos, one per category where possible
const featuredProducts = computed(() => {
  const withImages = inStockProducts.value.filter((product) => product.image)
  const picked = []
  const seen = new Set()
  for (const product of withImages) {
    if (seen.has(product.category)) continue
    seen.add(product.category)
    picked.push(product)
    if (picked.length === 4) return picked
  }
  for (const product of withImages) {
    if (!picked.includes(product)) picked.push(product)
    if (picked.length === 4) break
  }
  return picked
})

const promoImage = computed(() => {
  const audio = products.value.find(
    (product) => product.category === 'Electronics' && product.image && product !== featured.value
  )
  const fallback = products.value.find((product) => product.image)
  return getImageUrl((audio || fallback)?.image)
})

function addFeatured() {
  if (!featured.value) return
  const result = cart.addToCart(featured.value)
  notify(result.message, result.ok ? 'success' : 'warning')
}

/* ========================================
   STATIC COPY (service highlights and reasons)
========================================= */
const services = [
  {
    icon: 'mdi-cash-multiple',
    title: 'Pay However You Like',
    text: 'Cash to the rider, GCash, Maya or a bank transfer. You decide at checkout.',
  },
  {
    icon: 'mdi-package-variant-closed-check',
    title: 'Real-Time Inventory',
    text: 'Counts update the moment someone buys, so what you order is really on the shelf.',
  },
  {
    icon: 'mdi-heart-outline',
    title: 'Your Cart Remembers',
    text: 'Close the tab and come back later. Your cart and saved items will still be here.',
  },
]

const reasons = [
  {
    title: 'Hand-Picked Selection',
    text: 'Seven departments stocked with things people actually use, from gas stoves to plushies.',
  },
  {
    title: 'Clear Stock Counts',
    text: 'Every listing shows how many pieces are left, with a heads-up when it runs low.',
  },
  {
    title: 'Cash or Cashless',
    text: 'Settle at your door in cash, or pay ahead from your phone. Both work.',
  },
  {
    title: 'Quick Checkout',
    text: 'Name, number, address and payment on a single page, and you are finished.',
  },
]

/* ========================================
   NEWSLETTER (front-end only)
========================================= */
const newsletterForm = ref(null)
const email = ref('')
const subscribing = ref(false)
const subscribed = ref(false)
const subscribedEmail = ref('')

const emailRules = [
  (value) => !!value || 'Please type your email',
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'That email doesn\'t look right',
]

async function subscribe() {
  const validation = await newsletterForm.value?.validate()
  if (validation && !validation.valid) return

  subscribing.value = true
  // No newsletter backend in this project: we simply confirm on screen.
  await new Promise((resolve) => setTimeout(resolve, 500))
  subscribedEmail.value = email.value
  subscribed.value = true
  subscribing.value = false
  notify('Welcome aboard! Watch your inbox.', 'success')
}

/* ========================================
   LOAD PRODUCTS (always refresh on visit)
========================================= */
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.sk-anchor {
  scroll-margin-top: 88px;
}

/* ---------- Hero banner ---------- */
.hero-wrap {
  padding-top: 28px;
}

.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  border-radius: var(--sk-r-xl);
  overflow: hidden;
  color: var(--sk-on-primary);
  background:
    radial-gradient(120% 140% at 100% 0%, #ff9a5c 0%, rgba(255, 154, 92, 0) 55%),
    var(--sk-primary);
}

@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1.15fr 1fr;
    min-height: 440px;
  }
}

.hero__copy {
  position: relative;
  z-index: 1;
  padding: 36px 24px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

@media (min-width: 900px) {
  .hero__copy {
    padding: 48px 0 48px 56px;
  }
}

.hero__kicker {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--sk-primary-soft);
  font-size: 12px;
  font-weight: 600;
}

.hero__title {
  margin: 18px 0 0;
  font-family: var(--sk-font-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 4.8vw, 3.6rem);
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.hero__lede {
  margin: 16px 0 0;
  max-width: 46ch;
  font-size: 1rem;
  line-height: 1.65;
  color: #2b2b2b;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.hero__ghost {
  color: var(--sk-on-primary) !important;
  border-color: var(--sk-on-primary) !important;
  background: rgba(255, 255, 255, 0.18);
}

.hero__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  margin: 32px 0 0;
}

.hero__facts div {
  display: flex;
  flex-direction: column-reverse;
}

.hero__facts dt {
  font-size: 13px;
  font-weight: 500;
  color: #2b2b2b;
}

.hero__facts dd {
  margin: 0;
  font-family: var(--sk-font-display);
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.2;
}

.hero__visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 24px 28px;
}

@media (min-width: 900px) {
  .hero__visual {
    padding: 28px 40px 32px;
  }
}

/* Stage: everything behind and under the product */
.hero__stage {
  position: relative;
  width: min(100%, 440px);
  aspect-ratio: 1 / 0.86;
  display: grid;
  place-items: center;
}

/* Soft white light behind the product */
.hero__glow {
  position: absolute;
  inset: 4% 8% 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0) 68%);
}

/* Two thin rings, like ripples around the product */
.hero__ring {
  position: absolute;
  top: 47%;
  left: 50%;
  aspect-ratio: 1;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.hero__ring--outer {
  width: 98%;
  border: 2px dashed rgba(255, 255, 255, 0.55);
}

.hero__ring--inner {
  width: 72%;
  border: 2px solid rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.18);
}

/* Podium: a peach top with a deeper orange side */
.hero__podium {
  position: absolute;
  left: 50%;
  bottom: 6%;
  width: 66%;
  height: 15%;
  transform: translateX(-50%);
  border-radius: 50%;
  background: linear-gradient(180deg, #fff3e8 0%, var(--sk-primary-soft) 100%);
  box-shadow:
    0 14px 0 #e8590f,
    0 30px 36px -10px rgba(27, 27, 27, 0.35);
}

/* The product stands on the podium; its photo has no background,
   so it sits straight on the orange with a soft shadow */
.hero__img {
  position: relative;
  z-index: 1;
  width: 80%;
  height: 80%;
  object-fit: contain;
  object-position: center bottom;
  align-self: start;
  margin-top: 5%;
  filter: drop-shadow(0 18px 18px rgba(27, 27, 27, 0.28));
}

.hero__icon {
  position: relative;
  z-index: 1;
  color: var(--sk-secondary);
  margin-bottom: 14%;
}

.hero__card {
  position: relative;
  z-index: 2;
  margin-top: 18px;
  width: min(100%, 340px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 12px 18px;
  border-radius: var(--sk-r-lg);
  background: var(--sk-white);
  box-shadow: var(--sk-shadow-md);
}

.hero__card-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.hero__card-label {
  font-size: 12px;
  color: var(--sk-ink-3);
}

.hero__card-name {
  font-family: var(--sk-font-display);
  font-weight: 600;
  font-size: 0.98rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero__card-price {
  font-weight: 700;
  font-size: 0.95rem;
}

/* ---------- Product grids ---------- */
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

.featured {
  padding-bottom: 0;
}

/* ---------- Shop by category ---------- */
.cats {
  padding-bottom: 0;
}

.cats__arrows {
  display: flex;
  gap: 8px;
}

.cats__arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--sk-line-strong) !important;
  display: grid;
  place-items: center;
  color: var(--sk-ink);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.cats__arrow:hover {
  background: var(--sk-primary);
  border-color: var(--sk-primary) !important;
}

.cats__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(240px, 1fr);
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  padding-bottom: 4px;
}

@media (min-width: 960px) {
  .cats__track {
    grid-auto-columns: calc((100% - 32px) / 3);
    gap: 16px;
  }
}

.cats__track::-webkit-scrollbar {
  display: none;
}

.cat {
  scroll-snap-align: start;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 330px;
  border-radius: var(--sk-r-lg);
  background: var(--sk-well);
  overflow: hidden;
  border: 2px solid transparent !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.cat:hover {
  transform: translateY(-3px);
  box-shadow: var(--sk-shadow-md);
}

.cat.is-selected {
  border-color: var(--sk-primary) !important;
}

.cat__text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 22px 22px 0;
}

.cat__name {
  font-family: var(--sk-font-display);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--sk-ink);
}

.cat__blurb {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--sk-ink-3);
}

.cat__link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--sk-ink);
  text-decoration: underline;
  text-decoration-color: var(--sk-primary);
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}

.cat__media {
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 210px;
  padding: 16px 22px 24px;
}

.cat__img {
  width: 72%;
  height: 170px;
  object-fit: contain;
  object-position: center;
  mix-blend-mode: multiply;
  transition: transform 0.35s ease, opacity 0.25s ease;
}

.cat:hover .cat__img {
  transform: scale(1.05);
}

.cat__icon {
  color: var(--sk-ink-3);
}

/* ---------- All products ---------- */
.toolbar {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .toolbar {
    grid-template-columns: 1fr 240px;
  }
}

.toolbar :deep(.v-field) {
  background: var(--sk-tint);
}

.chips {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}

.chips::-webkit-scrollbar {
  display: none;
}

@media (min-width: 960px) {
  .chips {
    flex-wrap: wrap;
    overflow: visible;
  }
}

.chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--sk-line-strong) !important;
  background: var(--sk-white);
  color: var(--sk-ink-2);
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.chip:hover {
  border-color: var(--sk-secondary) !important;
  color: var(--sk-ink);
}

.chip.is-on {
  background: var(--sk-primary);
  border-color: var(--sk-primary) !important;
  color: var(--sk-on-primary);
  font-weight: 600;
}

.chip__count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 600;
  background: var(--sk-well);
  color: var(--sk-ink-2);
}

.chip.is-on .chip__count {
  background: var(--sk-white);
  color: var(--sk-ink);
}

.result-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin: 22px 0 18px;
  font-size: 0.95rem;
}

.state {
  text-align: center;
  padding: 56px 24px;
  border-radius: var(--sk-r-lg);
  background: var(--sk-tint);
}

.state p {
  max-width: 46ch;
  margin-left: auto;
  margin-right: auto;
}

.skeleton {
  border-radius: var(--sk-r-lg);
  background: var(--sk-tint);
  padding-bottom: 18px;
  overflow: hidden;
}

.skeleton__img {
  aspect-ratio: 1 / 0.86;
  background: var(--sk-well);
  margin-bottom: 16px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton__line {
  height: 12px;
  border-radius: 6px;
  background: var(--sk-well);
  margin: 10px 18px 0;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}

/* ---------- Experience panel ---------- */
.experience-wrap {
  padding-top: 24px;
}

.experience {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
  padding: 48px 24px;
  border-radius: var(--sk-r-xl);
  background: var(--sk-primary-soft);
}

.experience__grid {
  display: grid;
  gap: 28px;
  width: 100%;
  max-width: 920px;
  grid-template-columns: 1fr;
}

@media (min-width: 760px) {
  .experience__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.service {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.service__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--sk-white);
  color: var(--sk-ink);
}

.service__title {
  font-family: var(--sk-font-display);
  font-size: 1.05rem;
  font-weight: 600;
  margin: 4px 0 0;
}

.service p {
  margin: 0;
  max-width: 30ch;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--sk-ink-2);
}

/* ---------- Why ShopKart ---------- */
.why__title {
  text-align: center;
  margin-bottom: 40px;
}

.why__grid {
  display: grid;
  gap: 32px;
  align-items: center;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .why__grid {
    grid-template-columns: 1fr 1.1fr 1fr;
  }
}

.why__col {
  display: grid;
  gap: 40px;
}

@media (min-width: 600px) and (max-width: 899px) {
  .why__col {
    grid-template-columns: 1fr 1fr;
  }
}

.reason__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--sk-font-display);
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
}

.reason__mark {
  color: var(--sk-primary);
}

.reason p {
  margin: 8px 0 0 28px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--sk-ink-3);
  max-width: 34ch;
}

.why__visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 300px;
  order: -1;
}

@media (min-width: 900px) {
  .why__visual {
    order: 0;
    min-height: 360px;
  }
}

.why__disc {
  position: absolute;
  width: min(86%, 340px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--sk-well);
}

.why__img {
  position: relative;
  width: min(58%, 240px);
  aspect-ratio: 1;
  height: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
}

.why__icon {
  position: relative;
  color: var(--sk-ink-3);
}

/* ---------- Newsletter ---------- */
.newsletter-wrap {
  padding-bottom: 72px;
}

.newsletter {
  display: grid;
  gap: 28px;
  align-items: center;
  padding: 40px 24px;
  border-radius: var(--sk-r-xl);
  background: var(--sk-secondary);
  color: var(--sk-on-secondary);
}

@media (min-width: 900px) {
  .newsletter {
    grid-template-columns: 1fr 1.1fr;
    padding: 48px 56px;
  }
}

.newsletter__lede {
  margin: 10px 0 0;
  max-width: 42ch;
  line-height: 1.6;
  color: var(--sk-on-secondary-2);
}

.newsletter__label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.newsletter__row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.newsletter__field {
  flex: 1 1 240px;
}

.newsletter__field :deep(.v-messages__message) {
  color: #fca5a5;
}

.newsletter__row .v-btn {
  height: 52px !important;
}

.newsletter__done {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 22px;
  border-radius: var(--sk-r-lg);
  background: var(--sk-white);
  color: var(--sk-ink);
  line-height: 1.5;
}
</style>
