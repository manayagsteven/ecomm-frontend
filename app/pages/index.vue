<!-- app/pages/index.vue - ShopKart storefront homepage -->
<template>
  <div>
    <!-- ========================================
         HERO (bento composition)
    ========================================= -->
    <section class="hero sk-container" aria-labelledby="hero-title">
      <div class="hero__grid">
        <!-- Editorial copy sits directly on the page, no card -->
        <div class="hero__copy">
          <span class="sk-eyebrow">New season · {{ year }}</span>
          <h1 id="hero-title" class="sk-display mt-5">
            Good things,<br><em>well chosen.</em>
          </h1>
          <p class="sk-lede mt-6">
            A short, considered catalog of tech, carry and home goods. Every
            order is checked against live stock before it ships.
          </p>
          <div class="d-flex flex-wrap align-center ga-5 mt-8">
            <v-btn color="primary" size="x-large" append-icon="mdi-arrow-right" @click="scrollTo('shop')">
              Shop the collection
            </v-btn>
            <a href="#categories" class="sk-link" @click.prevent="scrollTo('categories')">Browse categories</a>
          </div>

          <dl class="hero__facts">
            <div>
              <dt>Products</dt>
              <dd class="sk-num">{{ loading && !loaded ? '–' : products.length }}</dd>
            </div>
            <div>
              <dt>Categories</dt>
              <dd class="sk-num">{{ categoriesInUse }}</dd>
            </div>
            <div>
              <dt>Units in stock</dt>
              <dd class="sk-num">{{ unitsInStock }}</dd>
            </div>
          </dl>
        </div>

        <!-- Featured product: strong Teal Waters tile -->
        <article class="hero__feature sk-tint-teal">
          <div class="d-flex align-center justify-space-between">
            <span class="hero__tag">Featured</span>
            <span v-if="featured" class="hero__tag hero__tag--ghost">{{ featured.category || 'New in' }}</span>
          </div>

          <template v-if="featured">
            <div class="hero__plinth">
              <img v-if="getImageUrl(featured.image)" :src="getImageUrl(featured.image)" :alt="featured.name">
              <v-icon v-else :icon="getCategoryIcon(featured.category)" size="96" />
            </div>
            <div class="hero__feature-info">
              <div>
                <h2 class="sk-h3">{{ featured.name }}</h2>
                <div class="hero__price sk-num">{{ formatPrice(featured.price) }}</div>
              </div>
              <v-btn
                color="secondary"
                size="large"
                prepend-icon="mdi-plus"
                :disabled="Number(featured.stock) <= 0"
                @click="addFeatured"
              >
                Add to cart
              </v-btn>
            </div>
          </template>

          <div v-else class="hero__feature-empty">
            <v-progress-circular v-if="loading" indeterminate color="secondary" />
            <template v-else>
              <h2 class="sk-h3">Fresh arrivals land here.</h2>
              <p>Add an active product in Manage Products to feature it.</p>
            </template>
          </div>
        </article>

        <!-- Two small supporting tiles -->
        <div class="hero__tile sk-tint-meadow">
          <v-icon icon="mdi-cash-multiple" size="28" />
          <div>
            <h3 class="hero__tile-title">Pay your way</h3>
            <p>Cash on Delivery, GCash, Maya or bank transfer.</p>
          </div>
        </div>
        <div class="hero__tile sk-tint-sky">
          <v-icon icon="mdi-package-variant-closed-check" size="28" />
          <div>
            <h3 class="hero__tile-title">Live stock</h3>
            <p>Your cart can never hold more than we have.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================
         CATEGORIES (asymmetric bento)
    ========================================= -->
    <section id="categories" class="sk-section sk-container sk-anchor" aria-labelledby="categories-title">
      <div class="section-head">
        <div>
          <span class="sk-eyebrow">01 · Browse</span>
          <h2 id="categories-title" class="sk-h2 mt-3">Shop by <em>category</em></h2>
        </div>
        <p class="sk-muted section-head__note">
          Seven focused departments. Pick one to filter the shop below.
        </p>
      </div>

      <div class="cat-grid">
        <button
          v-for="tile in categoryTiles"
          :key="tile.name"
          type="button"
          class="cat sk-focus"
          :class="[`cat--${tile.tone}`, `cat--${tile.size}`, { 'is-selected': selectedCategory === tile.name }]"
          @click="selectCategory(tile.name, true)"
        >
          <span class="cat__top">
            <span class="cat__icon"><v-icon :icon="tile.icon" :size="tile.size === 'xl' ? 30 : 22" /></span>
            <span class="cat__count sk-num">{{ tile.count }} {{ tile.count === 1 ? 'item' : 'items' }}</span>
          </span>
          <span class="cat__bottom">
            <span>
              <span class="cat__name">{{ tile.name }}</span>
              <span class="cat__blurb">{{ tile.blurb }}</span>
            </span>
            <v-icon icon="mdi-arrow-top-right" class="cat__arrow" />
          </span>
        </button>
      </div>
    </section>

    <!-- ========================================
         SHOP: search, category filter, product grid
    ========================================= -->
    <section id="shop" class="shop sk-anchor" aria-labelledby="shop-title">
      <div class="sk-container sk-section">
        <div class="section-head">
          <div>
            <span class="sk-eyebrow">02 · The shop</span>
            <h2 id="shop-title" class="sk-h2 mt-3">Everything <em>in stock</em></h2>
          </div>
          <p class="sk-muted section-head__note">
            Search by name, description or category.
          </p>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
          <v-text-field
            v-model="search"
            placeholder="Search products, e.g. headphones"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="toolbar__search"
            aria-label="Search products"
          />
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            item-title="label"
            item-value="value"
            hide-details
            class="toolbar__sort"
            aria-label="Sort products"
            prepend-inner-icon="mdi-sort"
          />
        </div>

        <!-- Category filter chips -->
        <div class="chips" role="group" aria-label="Filter by category">
          <button
            v-for="name in ['All Categories', ...CATEGORY_NAMES]"
            :key="name"
            type="button"
            class="chip sk-focus"
            :class="{ 'is-on': selectedCategory === name }"
            :aria-pressed="selectedCategory === name"
            @click="selectCategory(name)"
          >
            {{ name }}
            <span class="chip__count sk-num">{{ name === 'All Categories' ? products.length : categoryCounts[name] || 0 }}</span>
          </button>
        </div>

        <div class="result-line">
          <span class="sk-muted">
            Showing <strong class="sk-num">{{ filteredProducts.length }}</strong>
            {{ filteredProducts.length === 1 ? 'product' : 'products' }}
            <template v-if="selectedCategory !== 'All Categories'"> in <strong>{{ selectedCategory }}</strong></template>
            <template v-if="search"> for “<strong>{{ search }}</strong>”</template>
          </span>
          <button v-if="hasFilters" type="button" class="sk-link sk-focus" @click="clearFilters">Clear filters</button>
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
        <div v-else-if="error" class="state sk-surface">
          <v-icon icon="mdi-cloud-alert-outline" size="44" color="error" />
          <h3 class="sk-h3 mt-3">The shop is unreachable</h3>
          <p class="sk-muted mt-2">{{ error }}</p>
          <v-btn color="primary" class="mt-5" prepend-icon="mdi-refresh" @click="loadProducts">Try again</v-btn>
        </div>

        <!-- No products at all -->
        <div v-else-if="products.length === 0" class="state sk-surface">
          <v-icon icon="mdi-package-variant" size="44" class="sk-subtle" />
          <h3 class="sk-h3 mt-3">No products yet</h3>
          <p class="sk-muted mt-2">Active products added in Manage Products will appear here.</p>
          <v-btn to="/products" color="primary" class="mt-5" prepend-icon="mdi-plus">Add products</v-btn>
        </div>

        <!-- No match for the filters -->
        <div v-else-if="filteredProducts.length === 0" class="state sk-surface">
          <v-icon icon="mdi-magnify-close" size="44" class="sk-subtle" />
          <h3 class="sk-h3 mt-3">Nothing matches that</h3>
          <p class="sk-muted mt-2">Try a different word, or go back to All Categories.</p>
          <v-btn color="primary" variant="outlined" class="mt-5" @click="clearFilters">Show all products</v-btn>
        </div>

        <!-- Product grid -->
        <div v-else class="grid">
          <ProductCard v-for="product in filteredProducts" :key="product.documentId" :product="product" />
        </div>
      </div>
    </section>

    <!-- ========================================
         PROMOTIONS (color-blocked editorial tiles)
    ========================================= -->
    <section id="promotions" class="sk-section sk-container sk-anchor" aria-labelledby="promo-title">
      <span class="sk-eyebrow">03 · Edits</span>
      <div class="promo-grid mt-6">
        <article class="promo promo--main sk-tint-teal">
          <div class="promo__copy">
            <span class="promo__kicker">The audio edit</span>
            <h2 id="promo-title" class="promo__title">Sound that<br><em>travels</em> with you.</h2>
            <p>
              Headphones, speakers and small gadgets picked for commutes,
              desks and long trips.
            </p>
            <v-btn color="secondary" size="large" append-icon="mdi-arrow-right" @click="selectCategory('Electronics', true)">
              Shop Electronics
            </v-btn>
          </div>
          <div class="promo__visual">
            <div class="promo__disc" />
            <img v-if="promoImage" :src="promoImage" alt="" class="promo__img">
            <v-icon v-else icon="mdi-headphones" size="140" class="promo__icon" />
          </div>
        </article>

        <article class="promo promo--side sk-tint-sky">
          <!-- Visual: a real Bags product photo, or an icon when none has an image -->
          <div class="side__visual">
            <img v-if="bagsImage" :src="bagsImage" alt="" class="side__img">
            <v-icon v-else icon="mdi-bag-personal-outline" size="120" class="side__icon" />
          </div>

          <div class="side__copy">
            <span class="promo__kicker">Carry better</span>
            <h2 class="promo__title promo__title--sm">Pack light.<br><em>Move more.</em></h2>
            <p>Bags and everyday carry built for the commute.</p>
            <v-btn color="primary" append-icon="mdi-arrow-right" @click="selectCategory('Bags', true)">
              Shop Bags
            </v-btn>
          </div>
        </article>
      </div>
    </section>

    <!-- ========================================
         NEWSLETTER (Spring Meadow block)
    ========================================= -->
    <section class="newsletter sk-tint-meadow" aria-labelledby="newsletter-title">
      <div class="sk-container newsletter__inner">
        <div>
          <span class="sk-eyebrow">Newsletter</span>
          <h2 id="newsletter-title" class="sk-h1 mt-4">Letters from<br><em>the shop floor.</em></h2>
          <p class="newsletter__lede">
            New arrivals and restocks, once a month. No spam, unsubscribe any time.
          </p>
        </div>

        <v-form ref="newsletterForm" class="newsletter__form" @submit.prevent="subscribe">
          <template v-if="!subscribed">
            <label for="newsletter-email" class="newsletter__label">Email address</label>
            <div class="newsletter__row">
              <v-text-field
                id="newsletter-email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                bg-color="white"
                :rules="emailRules"
                validate-on="submit"
                class="newsletter__field"
              />
              <v-btn type="submit" color="primary" size="x-large" :loading="subscribing">Subscribe</v-btn>
            </div>
          </template>
          <div v-else class="newsletter__done" role="status">
            <v-icon icon="mdi-email-check-outline" size="32" />
            <div>
              <strong>You're on the list.</strong>
              <div>We'll write to {{ subscribedEmail }} when something new lands.</div>
            </div>
          </div>
        </v-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

useHead({ title: 'ShopKart | Good things, well chosen' })

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
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price-asc' },
  { label: 'Price: high to low', value: 'price-desc' },
  { label: 'Name: A to Z', value: 'name' },
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
   CATEGORY TILES (counts come from Strapi data)
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

// Tone + size give the bento its rhythm. Only three accent colors are used.
const tileStyle = {
  Electronics: { tone: 'sky', size: 'xl' },
  Fashion: { tone: 'meadow', size: 'sm' },
  Sports: { tone: 'white', size: 'sm' },
  Bags: { tone: 'white', size: 'sm' },
  Beauty: { tone: 'white', size: 'sm' },
  'Home & Living': { tone: 'teal', size: 'wide' },
  Toys: { tone: 'white', size: 'sm' },
}

const categoryTiles = computed(() => [
  ...CATEGORIES.map((category) => ({
    ...category,
    ...tileStyle[category.name],
    count: categoryCounts.value[category.name] || 0,
  })),
  {
    name: 'All Categories',
    icon: 'mdi-view-grid-outline',
    blurb: 'See the full catalog',
    tone: 'mist',
    size: 'sm',
    count: products.value.length,
  },
])

/* ========================================
   FEATURED + PROMO IMAGERY (from real products)
========================================= */
const featured = computed(() => {
  const inStock = products.value.filter((product) => Number(product.stock) > 0)
  return inStock.find((product) => product.image) || inStock[0] || null
})

const promoImage = computed(() => {
  const audio = products.value.find((product) => product.category === 'Electronics' && product.image)
  const fallback = products.value.find((product) => product.image)
  return getImageUrl((audio || fallback)?.image)
})

// Only a real Bags product photo is used here (no fallback to other categories)
const bagsImage = computed(() => {
  const bag = products.value.find((product) => product.category === 'Bags' && product.image)
  return getImageUrl(bag?.image)
})

function addFeatured() {
  if (!featured.value) return
  const result = cart.addToCart(featured.value)
  notify(result.message, result.ok ? 'success' : 'warning')
}

/* ========================================
   NEWSLETTER (front-end only)
========================================= */
const newsletterForm = ref(null)
const email = ref('')
const subscribing = ref(false)
const subscribed = ref(false)
const subscribedEmail = ref('')

const emailRules = [
  (value) => !!value || 'Enter your email address',
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address',
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
  notify('Thanks for subscribing!', 'success')
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

/* ---------- Hero ---------- */
.hero {
  padding-top: 40px;
  padding-bottom: 24px;
}

.hero__grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-areas:
    'copy copy'
    'feature feature'
    'meadow sky';
}

@media (min-width: 960px) {
  .hero {
    padding-top: 56px;
  }

  .hero__grid {
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto auto;
    grid-template-areas:
      'copy copy copy copy copy copy copy feature feature feature feature feature'
      'meadow meadow meadow meadow sky sky sky feature feature feature feature feature';
    gap: 20px;
  }
}

.hero__copy {
  grid-area: copy;
  padding: 8px 0 32px;
}

@media (min-width: 960px) {
  .hero__copy {
    padding: 24px 32px 24px 0;
  }
}

.hero__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  margin-top: 48px;
  padding-top: 20px;
  border-top: 1px solid var(--sk-line-strong);
  max-width: 520px;
}

.hero__facts dt {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sk-ink-3);
}

.hero__facts dd {
  font-family: var(--sk-font-display);
  font-size: 2rem;
  font-weight: 500;
  margin-top: 2px;
}

.hero__feature {
  grid-area: feature;
  border-radius: var(--sk-r-xl);
  padding: 22px;
  display: flex;
  flex-direction: column;
  min-height: 460px;
}

.hero__tag {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--sk-meadow);
  color: var(--sk-teal);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero__tag--ghost {
  background: var(--sk-teal-deep);
  color: var(--sk-on-teal);
}

.hero__plinth {
  flex: 1;
  margin: 18px 0;
  border-radius: var(--sk-r-lg);
  background: var(--sk-sky);
  display: grid;
  place-items: center;
  min-height: 240px;
  overflow: hidden;
  color: var(--sk-teal);
}

.hero__plinth img {
  width: 100%;
  height: 100%;
  max-height: 340px;
  object-fit: contain;
  padding: 8%;
}

.hero__feature-info {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.hero__price {
  margin-top: 6px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--sk-meadow);
}

.hero__feature-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  color: var(--sk-on-teal-2);
}

.hero__feature-empty .sk-h3 {
  color: var(--sk-on-teal);
}

.hero__feature-empty .v-progress-circular {
  margin: auto;
}

.hero__tile {
  border-radius: var(--sk-r-lg);
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 28px;
  min-height: 170px;
}

.hero__tile.sk-tint-meadow {
  grid-area: meadow;
}

.hero__tile.sk-tint-sky {
  grid-area: sky;
}

.hero__tile-title {
  font-family: var(--sk-font-display);
  font-size: 1.35rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.hero__tile p {
  margin: 4px 0 0;
  font-size: 0.9rem;
  line-height: 1.45;
}

/* ---------- Section heading ---------- */
.section-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 32px;
  margin-bottom: 32px;
}

.section-head__note {
  max-width: 34ch;
  margin: 0;
}

/* ---------- Category bento ---------- */
.cat-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 960px) {
  .cat-grid {
    gap: 16px;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: 180px;
  }
}

.cat {
  text-align: left;
  border-radius: var(--sk-r-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  min-height: 150px;
  border: 1px solid transparent;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.cat:hover {
  transform: translateY(-3px);
  box-shadow: var(--sk-shadow-md);
}

.cat--xl {
  grid-column: span 2;
}

.cat--wide {
  grid-column: span 2;
}

@media (min-width: 960px) {
  .cat--xl {
    grid-row: span 2;
    padding: 28px;
  }
}

.cat--white {
  background: var(--sk-white);
  border-color: var(--sk-line);
}
.cat--mist {
  background: var(--sk-mist-deep);
  border-color: var(--sk-line-strong);
}
.cat--sky {
  background: var(--sk-sky);
  color: var(--sk-teal);
}
.cat--meadow {
  background: var(--sk-meadow);
  color: var(--sk-teal);
}
.cat--teal {
  background: var(--sk-teal);
  color: var(--sk-on-teal);
}

.cat.is-selected {
  outline: 2px solid var(--sk-teal);
  outline-offset: 3px;
}

.cat__top,
.cat__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cat__bottom {
  align-items: flex-end;
}

.cat__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--sk-mist);
  color: var(--sk-teal);
}

.cat--xl .cat__icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: var(--sk-white);
}

.cat--meadow .cat__icon,
.cat--sky .cat__icon {
  background: var(--sk-white);
}

.cat--teal .cat__icon {
  background: var(--sk-teal-deep);
  color: var(--sk-meadow);
}

.cat__count {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.8;
}

.cat__name {
  display: block;
  font-family: var(--sk-font-display);
  font-size: 1.3rem;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.1;
}

.cat--xl .cat__name {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
}

.cat__blurb {
  display: block;
  margin-top: 4px;
  font-size: 0.85rem;
  opacity: 0.8;
}

.cat__arrow {
  transition: transform 0.2s ease;
}

.cat:hover .cat__arrow {
  transform: translate(2px, -2px);
}

/* ---------- Shop ---------- */
.shop {
  background: var(--sk-white);
  border-top: 1px solid var(--sk-line);
  border-bottom: 1px solid var(--sk-line);
}

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
  background: var(--sk-mist);
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

/* Desktop: chips wrap instead of scrolling */
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
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--sk-line-strong);
  background: var(--sk-white);
  color: var(--sk-ink-2);
  font-size: 0.9rem;
  font-weight: 700;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.chip:hover {
  border-color: var(--sk-teal);
  color: var(--sk-teal);
}

.chip.is-on {
  background: var(--sk-teal);
  border-color: var(--sk-teal);
  color: var(--sk-white);
}

.chip__count {
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 11px;
  background: var(--sk-mist-deep);
  color: var(--sk-ink-2);
}

.chip.is-on .chip__count {
  background: var(--sk-meadow);
  color: var(--sk-teal);
}

.result-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin: 24px 0 20px;
  font-size: 0.95rem;
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

.state {
  text-align: center;
  padding: 56px 24px;
  background: var(--sk-mist);
}

.state p {
  max-width: 46ch;
  margin-left: auto;
  margin-right: auto;
}

.skeleton {
  border: 1px solid var(--sk-line);
  border-radius: var(--sk-r-lg);
  padding-bottom: 18px;
  overflow: hidden;
}

.skeleton__img {
  aspect-ratio: 1 / 1;
  background: var(--sk-mist-deep);
  margin-bottom: 16px;
}

.skeleton__line {
  height: 12px;
  border-radius: 6px;
  background: var(--sk-mist-deep);
  margin: 10px 18px 0;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton__img {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}

/* ---------- Promotions ---------- */
.promo-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 960px) {
  .promo-grid {
    gap: 20px;
    grid-template-columns: 7fr 5fr;
  }
}

.promo {
  position: relative;
  border-radius: var(--sk-r-xl);
  overflow: hidden;
}

.promo--main {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 420px;
}

@media (min-width: 700px) {
  .promo--main {
    grid-template-columns: 1.1fr 1fr;
  }
}

.promo__copy {
  padding: 36px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.promo__copy p,
.promo--side p {
  max-width: 34ch;
  line-height: 1.55;
  margin: 0 0 8px;
}

.promo--main .promo__copy p {
  color: var(--sk-on-teal-2);
}

.promo__kicker {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.promo--main .promo__kicker {
  color: var(--sk-meadow);
}

.promo__title {
  font-family: var(--sk-font-display);
  font-weight: 500;
  font-size: clamp(2.2rem, 4.4vw, 3.6rem);
  line-height: 1;
  letter-spacing: -0.03em;
  margin: 0;
}

.promo__title em {
  font-style: italic;
  font-weight: 400;
}

.promo--main .promo__title em {
  color: var(--sk-meadow);
}

.promo__title--sm {
  font-size: clamp(2rem, 3.4vw, 2.8rem);
}

.promo__visual {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 260px;
}

.promo__disc {
  position: absolute;
  width: 78%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--sk-teal-deep);
}

.promo__img {
  position: relative;
  width: 80%;
  max-height: 340px;
  object-fit: contain;
}

.promo__icon {
  position: relative;
  color: var(--sk-sky);
}

/* Side tile: visual on top, copy anchored at the bottom */
.promo--side {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* The visual takes all the space above the copy; the photo fills it
   without ever making the tile taller than the audio tile beside it. */
.side__visual {
  position: relative;
  flex: 1;
  display: grid;
  place-items: center;
  min-height: 220px;
}

.side__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Line the photo up with the left edge of the copy, resting just above it */
  object-position: left bottom;
}

.side__icon {
  color: var(--sk-teal);
}

.side__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.promo--side .promo__title--sm {
  font-size: clamp(1.9rem, 2.6vw, 2.4rem);
}

/* Narrow-but-not-phone widths: copy beside the visual */
@media (min-width: 600px) and (max-width: 959px) {
  .promo--side {
    flex-direction: row-reverse;
    align-items: center;
  }

  .side__visual {
    flex: 0 0 40%;
    align-self: stretch;
  }
}

/* ---------- Newsletter ---------- */
.newsletter {
  padding: 80px 0;
}

.newsletter__inner {
  display: grid;
  gap: 40px;
  align-items: end;
}

@media (min-width: 960px) {
  .newsletter__inner {
    grid-template-columns: 1.1fr 1fr;
  }
}

.newsletter .sk-eyebrow {
  color: var(--sk-teal);
}

.newsletter__lede {
  margin: 20px 0 0;
  max-width: 42ch;
  line-height: 1.6;
}

.newsletter__label {
  display: block;
  font-weight: 800;
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
  line-height: 1.5;
}
</style>
