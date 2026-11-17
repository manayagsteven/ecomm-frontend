<!-- ========================================
     FOOTER
     Solid charcoal block that closes every page, with orange accents.
========================================= -->
<template>
  <footer class="sk-footer">
    <div class="sk-container">
      <div class="sk-footer__grid">
        <div class="sk-footer__brand">
          <div class="sk-footer__logo">
            <img src="/logo.png?v=5" alt="" width="36" height="36">
            <span>ShopKart</span>
          </div>
          <p>
            Phones, fragrances, kitchen gear, toys and more, packed and shipped
            anywhere in the Philippines. Pay cash at your door if you like.
          </p>
        </div>

        <div>
          <h2 class="sk-footer__heading">Departments</h2>
          <ul>
            <li v-for="category in CATEGORIES.slice(0, 5)" :key="category.name">
              <NuxtLink :to="{ path: '/', query: { category: category.name }, hash: '#shop' }">
                {{ category.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h2 class="sk-footer__heading">Quick Links</h2>
          <ul>
            <li><NuxtLink to="/cart">Cart</NuxtLink></li>
            <li><NuxtLink to="/wishlist">Saved items</NuxtLink></li>
            <li><NuxtLink to="/checkout">Place an order</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h2 class="sk-footer__heading">For Staff</h2>
          <ul>
            <li><NuxtLink to="/products">Store Admin</NuxtLink></li>
          </ul>
          <h2 class="sk-footer__heading mt-6">We Accept</h2>
          <p class="sk-footer__small">Cash on Delivery · GCash · Maya · Bank Transfer</p>
        </div>
      </div>

      <div class="sk-footer__base">
        <span>© {{ year }} ShopKart · Student-built online store</span>
        <span>Runs on Nuxt 4, Vuetify 4 and Strapi 5</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.sk-footer {
  background: var(--sk-secondary);
  color: var(--sk-on-secondary);
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
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--sk-font-display);
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.sk-footer__brand p {
  margin-top: 16px;
  max-width: 36ch;
  color: var(--sk-on-secondary-2);
  line-height: 1.65;
}

.sk-footer__heading {
  font-family: var(--sk-font-display);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--sk-white);
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
  color: var(--sk-on-secondary-2);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s ease;
}

.sk-footer a:hover {
  color: var(--sk-primary);
}

.sk-footer__small {
  color: var(--sk-on-secondary-2);
  font-size: 0.9rem;
  line-height: 1.6;
}

.sk-footer__base {
  margin-top: 56px;
  padding-top: 22px;
  border-top: 1px solid #4a4a4a;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--sk-on-secondary-2);
}
</style>
