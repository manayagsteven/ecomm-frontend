<!-- ========================================
     FOOTER
     Solid Teal Waters block that closes every page.
========================================= -->
<template>
  <footer class="sk-footer">
    <div class="sk-container">
      <div class="sk-footer__grid">
        <div class="sk-footer__brand">
          <div class="sk-footer__logo">Shop<em>Kart</em></div>
          <p>
            Considered tech, carry and home goods, chosen for everyday use and
            delivered across the Philippines.
          </p>
        </div>

        <div>
          <h2 class="sk-footer__heading">Shop</h2>
          <ul>
            <li v-for="category in CATEGORIES.slice(0, 5)" :key="category.name">
              <NuxtLink :to="{ path: '/', query: { category: category.name }, hash: '#shop' }">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="sk-footer__heading">Your account</h2>
          <ul>
            <li><NuxtLink to="/cart">Shopping cart</NuxtLink></li>
            <li><NuxtLink to="/wishlist">Wishlist</NuxtLink></li>
            <li><NuxtLink to="/checkout">Checkout</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h2 class="sk-footer__heading">Store admin</h2>
          <ul>
            <li><NuxtLink to="/products">Manage Products</NuxtLink></li>
          </ul>
          <h2 class="sk-footer__heading mt-6">Payments</h2>
          <p class="sk-footer__small">Cash on Delivery · GCash · Maya · Bank Transfer</p>
        </div>
      </div>

      <div class="sk-footer__base">
        <span>© {{ year }} ShopKart. A Web Systems and Technologies project.</span>
        <span>Built with Nuxt 4, Vuetify 4 and Strapi 5</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.sk-footer {
  background: var(--sk-teal);
  color: var(--sk-on-teal);
  padding: 64px 0 28px;
}

.sk-footer__grid {
  display: grid;
  gap: 40px;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .sk-footer__grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 960px) {
  .sk-footer__grid {
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
  }
}

.sk-footer__logo {
  font-family: var(--sk-font-display);
  font-size: 2.4rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1;
}

.sk-footer__logo em {
  font-weight: 400;
  color: var(--sk-meadow);
}

.sk-footer__brand p {
  margin-top: 16px;
  max-width: 34ch;
  color: var(--sk-on-teal-2);
  line-height: 1.6;
}

.sk-footer__heading {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--sk-meadow);
  margin-bottom: 14px;
}

.sk-footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.sk-footer a {
  color: var(--sk-on-teal);
  text-decoration: none;
  font-weight: 500;
}

.sk-footer a:hover {
  color: var(--sk-meadow);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.sk-footer__small {
  color: var(--sk-on-teal-2);
  font-size: 0.9rem;
  line-height: 1.6;
}

.sk-footer__base {
  margin-top: 56px;
  padding-top: 22px;
  border-top: 1px solid #36606e;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--sk-on-teal-2);
}
</style>
