<!-- app/pages/products.vue - Product Management (Strapi CRUD) -->
<template>
  <div class="sk-container page">
    <!-- ========================================
         PAGE HEADER
    ========================================= -->
    <header class="head">
      <div>
        <span class="sk-eyebrow">Store admin</span>
        <h1 class="sk-h1 mt-3">Product <em>management</em></h1>
        <p class="sk-muted mt-3 mb-0">Create, update and track everything in the ShopKart catalog.</p>
      </div>
      <div class="d-flex flex-wrap ga-3">
        <v-btn to="/" variant="outlined" color="primary" size="large" prepend-icon="mdi-storefront-outline" class="head__ghost">
          View storefront
        </v-btn>
        <v-btn color="primary" size="large" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add Product
        </v-btn>
      </div>
    </header>

    <!-- ========================================
         STATS (dashboard bento)
    ========================================= -->
    <section class="stats" aria-label="Inventory overview">
      <div class="stat stat--white">
        <span class="stat__label">Total products</span>
        <span class="stat__value sk-num">{{ products.length }}</span>
        <span class="stat__foot">{{ categoriesUsed }} categories</span>
      </div>
      <div class="stat stat--meadow">
        <span class="stat__label">Active</span>
        <span class="stat__value sk-num">{{ activeCount }}</span>
        <span class="stat__foot">{{ products.length - activeCount }} inactive</span>
      </div>
      <div class="stat stat--sky">
        <span class="stat__label">Needs restock</span>
        <span class="stat__value sk-num">{{ lowStockCount + outOfStockCount }}</span>
        <span class="stat__foot">{{ outOfStockCount }} out · {{ lowStockCount }} low</span>
      </div>
    </section>

    <!-- ========================================
         TOOLBAR: search + status filter
    ========================================= -->
    <div class="toolbar">
      <v-text-field
        v-model="search"
        placeholder="Search by name, description or category"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        bg-color="white"
        class="toolbar__search"
        aria-label="Search product"
      />
      <div class="segments" role="group" aria-label="Filter by status">
        <button
          v-for="option in statusOptions"
          :key="option.value"
          type="button"
          class="segment sk-focus"
          :class="{ 'is-on': statusFilter === option.value }"
          :aria-pressed="statusFilter === option.value"
          @click="statusFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- ========================================
         LOADING / EMPTY STATES
    ========================================= -->
    <div v-if="loading" class="state sk-surface">
      <v-progress-circular indeterminate color="primary" size="44" />
      <div class="mt-4 sk-muted">Loading products...</div>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="state sk-surface">
      <v-icon icon="mdi-package-variant" size="48" class="sk-subtle" />
      <h2 class="sk-h3 mt-4">No products found</h2>
      <p class="sk-muted mt-2">Add your first product or try another search.</p>
      <v-btn color="primary" class="mt-4" prepend-icon="mdi-plus" @click="openCreateDialog">Add Product</v-btn>
    </div>

    <!-- ========================================
         PRODUCT TABLE
    ========================================= -->
    <div v-else class="table-wrap sk-surface">
      <v-table class="table" hover>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th class="text-right">Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="product in filteredProducts" :key="product.documentId">
            <td>
              <div class="cell-product">
                <div class="thumb sk-image-well">
                  <img v-if="product.image" :src="getImageUrl(product.image)" :alt="product.name">
                  <v-icon v-else icon="mdi-image-off-outline" size="22" class="sk-subtle" />
                </div>
                <div class="cell-product__text">
                  <div class="cell-product__name">{{ product.name }}</div>
                  <div class="description-text sk-subtle">{{ product.description || 'No description' }}</div>
                </div>
              </div>
            </td>

            <td>
              <span class="sk-pill sk-pill--sky">
                <v-icon :icon="getCategoryIcon(product.category)" size="14" />
                {{ product.category || 'Uncategorized' }}
              </span>
            </td>

            <td class="text-right font-weight-bold sk-num">{{ formatPrice(product.price) }}</td>

            <td>
              <span class="sk-pill sk-num" :class="`sk-pill--${getStockColor(product.stock)}`">
                {{ product.stock }} {{ Number(product.stock) === 1 ? 'unit' : 'units' }}
              </span>
            </td>

            <td>
              <span class="sk-pill" :class="product.is_active ? 'sk-pill--success' : 'sk-pill--neutral'">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <div class="d-flex justify-end ga-1">
                <v-btn icon="mdi-eye-outline" variant="text" size="small" class="act" aria-label="View product" @click="viewProduct(product)" />
                <v-btn icon="mdi-pencil-outline" variant="text" size="small" class="act" aria-label="Edit product" @click="openEditDialog(product)" />
                <v-btn icon="mdi-trash-can-outline" variant="text" size="small" class="act act--danger" aria-label="Delete product" @click="openDeleteDialog(product)" />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div class="table-foot sk-subtle sk-num">
        Showing {{ filteredProducts.length }} of {{ products.length }} products
      </div>
    </div>

    <!-- ========================================
         CREATE / EDIT PRODUCT DIALOG
    ========================================= -->
    <v-dialog v-model="productDialog" max-width="760" persistent scrollable>
      <v-card class="sk-dialog">
        <div class="dlg-head">
          <div>
            <span class="sk-eyebrow">{{ isEditing ? 'Edit' : 'New product' }}</span>
            <h2 class="sk-h3 mt-2">{{ isEditing ? form.name || 'Edit Product' : 'Add Product' }}</h2>
          </div>
          <v-btn icon="mdi-close" variant="text" aria-label="Close" @click="closeProductDialog" />
        </div>

        <v-card-text class="dlg-body">
          <v-form ref="productForm" @submit.prevent="saveProduct">
            <!-- Image -->
            <div class="form-group">
              <div class="form-group__title">Image</div>
              <div class="image-row">
                <div class="image-preview sk-image-well">
                  <img v-if="imagePreview || currentImage" :src="imagePreview || getImageUrl(currentImage)" alt="Product image preview">
                  <v-icon v-else icon="mdi-image-plus-outline" size="36" class="sk-subtle" />
                </div>
                <v-file-input
                  v-model="selectedFile"
                  label="Select Product Image"
                  accept="image/*"
                  prepend-icon=""
                  prepend-inner-icon="mdi-paperclip"
                  :hint="isEditing && currentImage ? 'Choose a file to replace the current image' : 'PNG or JPG'"
                  persistent-hint
                  class="flex-grow-1"
                  @update:model-value="handleImageChange"
                />
              </div>
            </div>

            <!-- Details -->
            <div class="form-group">
              <div class="form-group__title">Details</div>
              <v-text-field
                v-model="form.name"
                label="Product Name"
                :rules="[(value) => !!value || 'Product name is required']"
              />
              <v-textarea v-model="form.description" label="Description" rows="3" auto-grow />
              <v-select v-model="form.category" :items="categories" label="Category" />
            </div>

            <!-- Pricing & inventory -->
            <div class="form-group">
              <div class="form-group__title">Pricing &amp; inventory</div>
              <v-row density="compact">
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.price"
                    label="Price"
                    type="number"
                    prefix="₱"
                    :rules="priceRules"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model.number="form.stock"
                    label="Stock"
                    type="number"
                    suffix="units"
                    :rules="stockRules"
                  />
                </v-col>
              </v-row>
              <div class="switch-row">
                <div>
                  <div class="font-weight-bold">Active product</div>
                  <div class="sk-subtle text-body-small">Inactive products are hidden from the storefront.</div>
                </div>
                <v-switch v-model="form.is_active" color="primary" inset hide-details aria-label="Active product" />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <div class="dlg-foot">
          <v-btn variant="outlined" @click="closeProductDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveProduct">
            {{ isEditing ? 'Update Product' : 'Save Product' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ========================================
         VIEW PRODUCT DIALOG
    ========================================= -->
    <v-dialog v-model="viewDialog" max-width="760">
      <v-card v-if="selectedProduct" class="sk-dialog view">
        <div class="view__media sk-image-well">
          <img v-if="selectedProduct.image" :src="getImageUrl(selectedProduct.image)" :alt="selectedProduct.name">
          <v-icon v-else icon="mdi-image-off-outline" size="72" class="sk-subtle" />
        </div>

        <div class="view__body">
          <div class="d-flex align-center justify-space-between ga-2">
            <span class="sk-pill sk-pill--sky">{{ selectedProduct.category || 'Uncategorized' }}</span>
            <v-btn icon="mdi-close" variant="text" size="small" aria-label="Close" @click="viewDialog = false" />
          </div>

          <h2 class="sk-h2 mt-4">{{ selectedProduct.name }}</h2>
          <p class="sk-muted mt-3">{{ selectedProduct.description || 'No product description.' }}</p>

          <dl class="view__facts">
            <div>
              <dt>Price</dt>
              <dd class="sk-num">{{ formatPrice(selectedProduct.price) }}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd class="sk-num">{{ selectedProduct.stock }} units</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span class="sk-pill" :class="selectedProduct.is_active ? 'sk-pill--success' : 'sk-pill--neutral'">
                  {{ selectedProduct.is_active ? 'Active' : 'Inactive' }}
                </span>
              </dd>
            </div>
          </dl>

          <div class="d-flex ga-2 mt-6">
            <v-btn color="primary" prepend-icon="mdi-pencil-outline" @click="editFromView">Edit</v-btn>
            <v-btn variant="outlined" @click="viewDialog = false">Close</v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- ========================================
         DELETE CONFIRMATION DIALOG
    ========================================= -->
    <v-dialog v-model="deleteDialog" max-width="440">
      <v-card class="sk-dialog">
        <v-card-text class="pa-7">
          <div class="del-icon"><v-icon icon="mdi-trash-can-outline" size="26" /></div>
          <h2 class="sk-h3 mt-5">Delete product?</h2>
          <p class="sk-muted mt-3 mb-0">
            <strong class="text-high-emphasis">{{ selectedProduct?.name }}</strong> will be permanently removed
            from Strapi. This can't be undone.
          </p>
        </v-card-text>

        <v-card-actions class="px-7 pb-7 pt-0 ga-2">
          <!-- flex-grow-1 (not block) so both buttons share the row in Vuetify 4 -->
          <v-btn variant="outlined" class="flex-grow-1" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" class="flex-grow-1" :loading="deleting" @click="deleteProduct">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

/* ========================================
   PAGE SETTINGS + STRAPI URL
   Uses the shared default layout (header + footer).
========================================= */
useHead({
  title: 'Product Management | ShopKart',
})

const config = useRuntimeConfig()
const STRAPI_URL = config.public.strapiUrl
const { notify } = useToast()

/* ========================================
   STATE
========================================= */
const products = ref([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('all')

const productDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)

const selectedProduct = ref(null)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)

const productForm = ref(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  category: '',
  is_active: true,
})

const selectedFile = ref(null)
const imagePreview = ref(null)
const currentImage = ref(null)

/* ========================================
   CATEGORIES + VALIDATION
   CATEGORY_NAMES comes from app/utils/shop.ts (shared with the storefront)
========================================= */
const categories = CATEGORY_NAMES

const priceRules = [
  (value) => (value !== '' && value !== null) || 'Price is required',
  (value) => value >= 0 || 'Price cannot be negative',
]

const stockRules = [
  (value) => (value !== '' && value !== null) || 'Stock is required',
  (value) => value >= 0 || 'Stock cannot be negative',
  (value) => Number.isInteger(Number(value)) || 'Stock must be a whole number',
]

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Low stock', value: 'low' },
]

/* ========================================
   DASHBOARD STATS
========================================= */
const activeCount = computed(() => products.value.filter((product) => product.is_active).length)
const outOfStockCount = computed(() => products.value.filter((product) => Number(product.stock) === 0).length)
const lowStockCount = computed(
  () => products.value.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= LOW_STOCK).length
)
const categoriesUsed = computed(() => new Set(products.value.map((product) => product.category).filter(Boolean)).size)

/* ========================================
   SEARCH + STATUS FILTER
========================================= */
const filteredProducts = computed(() => {
  const keyword = (search.value || '').toLowerCase().trim()

  return products.value.filter((product) => {
    if (statusFilter.value === 'active' && !product.is_active) return false
    if (statusFilter.value === 'inactive' && product.is_active) return false
    if (statusFilter.value === 'low' && Number(product.stock) > LOW_STOCK) return false

    if (!keyword) return true

    const name = product.name?.toLowerCase() || ''
    const description = product.description?.toLowerCase() || ''
    const category = product.category?.toLowerCase() || ''

    return name.includes(keyword) || description.includes(keyword) || category.includes(keyword)
  })
})

/* ========================================
   READ: GET /api/products
========================================= */
async function getProducts() {
  loading.value = true

  try {
    const response = await $fetch(`${STRAPI_URL}/api/products`, {
      query: {
        populate: 'image',
        sort: 'createdAt:desc',
        'pagination[pageSize]': 100,
      },
    })

    products.value = response.data || []
  } catch (error) {
    console.error('Error fetching products:', error)
    showSnackbar('Unable to load products.', 'error')
  } finally {
    loading.value = false
  }
}

/* ========================================
   DIALOG OPENERS
========================================= */
function openCreateDialog() {
  resetForm()
  isEditing.value = false
  selectedProduct.value = null
  productDialog.value = true
}

function openEditDialog(product) {
  selectedProduct.value = product
  isEditing.value = true

  form.name = product.name || ''
  form.description = product.description || ''
  form.price = Number(product.price) || 0
  form.stock = Number(product.stock) || 0
  form.category = product.category || ''
  form.is_active = product.is_active ?? true

  currentImage.value = product.image || null
  selectedFile.value = null
  imagePreview.value = null
  productDialog.value = true
}

function viewProduct(product) {
  selectedProduct.value = product
  viewDialog.value = true
}

function editFromView() {
  viewDialog.value = false
  openEditDialog(selectedProduct.value)
}

function openDeleteDialog(product) {
  selectedProduct.value = product
  deleteDialog.value = true
}

/* ========================================
   SAVE: decides between CREATE and UPDATE
========================================= */
async function saveProduct() {
  const validation = await productForm.value?.validate()
  if (validation && !validation.valid) return

  saving.value = true

  try {
    if (isEditing.value) {
      await updateProduct()
    } else {
      await createProduct()
    }

    closeProductDialog()
    await getProducts()
  } catch (error) {
    console.error('Error saving product:', error)
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    saving.value = false
  }
}

/* ========================================
   CREATE: POST /api/products
========================================= */
async function createProduct() {
  const response = await $fetch(`${STRAPI_URL}/api/products`, {
    method: 'POST',
    body: {
      data: {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        is_active: form.is_active,
      },
    },
  })

  if (getSelectedFile() && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product created successfully.', 'success')
}

/* ========================================
   UPDATE: PUT /api/products/:documentId
========================================= */
async function updateProduct() {
  if (!selectedProduct.value) return

  const response = await $fetch(
    `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
    {
      method: 'PUT',
      body: {
        data: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          stock: Number(form.stock),
          category: form.category,
          is_active: form.is_active,
        },
      },
    }
  )

  if (getSelectedFile() && response.data) {
    await uploadProductImage(response.data.id)
  }

  showSnackbar('Product updated successfully.', 'success')
}

/* ========================================
   DELETE: DELETE /api/products/:documentId
========================================= */
async function deleteProduct() {
  if (!selectedProduct.value) return

  deleting.value = true

  try {
    await $fetch(
      `${STRAPI_URL}/api/products/${selectedProduct.value.documentId}`,
      { method: 'DELETE' }
    )

    deleteDialog.value = false
    showSnackbar('Product deleted successfully.', 'success')
    await getProducts()
  } catch (error) {
    showSnackbar(getErrorMessage(error), 'error')
  } finally {
    deleting.value = false
  }
}

/* ========================================
   IMAGE UPLOAD: POST /api/upload (FormData)
========================================= */
async function uploadProductImage(productId) {
  const file = getSelectedFile()
  if (!file) return

  const formData = new FormData()
  formData.append('files', file)
  formData.append('ref', 'api::product.product')
  formData.append('refId', String(productId))
  formData.append('field', 'image')

  // Do not set Content-Type manually: the browser adds the multipart boundary.
  await $fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  })
}

/* ========================================
   IMAGE PREVIEW HELPERS
========================================= */
function handleImageChange(value) {
  const file = getFileFromValue(value)

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = file ? URL.createObjectURL(file) : null
}

function getSelectedFile() {
  return getFileFromValue(selectedFile.value)
}

function getFileFromValue(value) {
  if (!value) return null
  if (value instanceof File) return value
  if (Array.isArray(value) && value.length > 0) return value[0]
  return null
}

/* ========================================
   DISPLAY HELPERS
   formatPrice / getErrorMessage / getCategoryIcon come from app/utils/shop.ts
========================================= */
function getImageUrl(image) {
  if (!image?.url) return ''

  if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
    return image.url
  }

  return `${STRAPI_URL}${image.url}`
}

function getStockColor(stock) {
  if (Number(stock) === 0) return 'error'
  if (Number(stock) <= LOW_STOCK) return 'warning'
  return 'success'
}

/* ========================================
   FEEDBACK (global snackbar from app.vue)
========================================= */
function showSnackbar(message, color = 'success') {
  notify(message, color)
}

/* ========================================
   RESET + CLOSE FORM
========================================= */
function resetForm() {
  form.name = ''
  form.description = ''
  form.price = 0
  form.stock = 0
  form.category = ''
  form.is_active = true

  selectedFile.value = null
  currentImage.value = null

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  imagePreview.value = null
}

function closeProductDialog() {
  productDialog.value = false
  resetForm()
}

onMounted(() => {
  getProducts()
})
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
  gap: 24px;
  margin-bottom: 32px;
}

.head__ghost {
  border-color: var(--sk-line-strong) !important;
  background: var(--sk-white);
}

/* ---------- Stats bento ---------- */
.stats {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-bottom: 28px;
}

@media (min-width: 960px) {
  .stats {
    gap: 16px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.stat {
  border-radius: var(--sk-r-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 132px;
}

.stat--white {
  background: var(--sk-white);
  border: 1px solid var(--sk-line);
}
.stat--meadow {
  background: var(--sk-meadow);
  color: var(--sk-teal);
}
.stat--sky {
  background: var(--sk-sky);
  color: var(--sk-teal);
}
.stat__label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.8;
}

.stat__value {
  font-family: var(--sk-font-display);
  font-size: 2.6rem;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.02em;
  margin-top: auto;
}

.stat__foot {
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Phones: two tiles per row, the third spans the full width */
@media (max-width: 599px) {
  .stat--sky {
    grid-column: span 2;
  }
}

/* ---------- Toolbar ---------- */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar__search {
  flex: 1 1 320px;
}

.segments {
  display: inline-flex;
  padding: 4px;
  border-radius: var(--sk-r-md);
  background: var(--sk-mist-deep);
  border: 1px solid var(--sk-line);
  overflow-x: auto;
  max-width: 100%;
}

.segment {
  height: 38px;
  padding: 0 14px;
  border-radius: var(--sk-r-sm);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--sk-ink-2);
  white-space: nowrap;
}

.segment:hover {
  color: var(--sk-ink);
}

.segment.is-on {
  background: var(--sk-white);
  color: var(--sk-teal);
  box-shadow: var(--sk-shadow-sm);
}

/* ---------- Table ---------- */
.table-wrap {
  overflow: hidden;
}

.table {
  background: transparent !important;
  overflow-x: auto;
}

.table :deep(table) {
  min-width: 760px;
}

.table :deep(thead th) {
  background: var(--sk-mist) !important;
  color: var(--sk-ink-3) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  height: 48px !important;
  border-bottom: 1px solid var(--sk-line) !important;
}

.table :deep(tbody td) {
  border-bottom: 1px solid var(--sk-line-white) !important;
  height: 76px !important;
}

.table :deep(tbody tr:hover > td) {
  background: #fbfcf2;
}

.cell-product {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 220px;
}

.thumb {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 12px;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8%;
}

.cell-product__name {
  font-weight: 800;
}

.description-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.act {
  color: var(--sk-ink-2) !important;
}

.act:hover {
  color: var(--sk-teal) !important;
  background: var(--sk-mist-deep);
}

.act--danger:hover {
  color: var(--sk-error) !important;
  background: #fbe5e1;
}

.table-foot {
  padding: 14px 20px;
  font-size: 0.85rem;
  border-top: 1px solid var(--sk-line);
}

.state {
  text-align: center;
  padding: 64px 24px;
}

/* ---------- Dialogs ---------- */
.dlg-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 18px;
  border-bottom: 1px solid var(--sk-line-white);
}

.dlg-body {
  padding: 8px 24px !important;
}

.dlg-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--sk-line-white);
  background: var(--sk-white);
}

.form-group {
  padding: 18px 0 6px;
  border-bottom: 1px solid var(--sk-line-white);
}

.form-group:last-child {
  border-bottom: 0;
}

.form-group__title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--sk-ink-3);
  margin-bottom: 14px;
}

.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.image-preview {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  border-radius: var(--sk-r-md);
  border: 1px solid var(--sk-line);
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 6%;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-bottom: 14px;
  border-radius: var(--sk-r-md);
  background: var(--sk-mist);
}

.view {
  display: grid !important;
  grid-template-columns: 1fr;
}

@media (min-width: 700px) {
  .view {
    grid-template-columns: 1fr 1.1fr;
  }
}

.view__media {
  min-height: 260px;
}

.view__media img {
  width: 100%;
  height: 100%;
  max-height: 420px;
  object-fit: contain;
  padding: 10%;
}

.view__body {
  padding: 22px 26px 26px;
}

.view__facts {
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: start;
  gap: 24px;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--sk-line-white);
}

.view__facts dt {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--sk-ink-3);
}

.view__facts dd {
  margin-top: 4px;
  font-weight: 800;
  font-size: 1.05rem;
}

.del-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #fbe5e1;
  color: var(--sk-error);
}
</style>
