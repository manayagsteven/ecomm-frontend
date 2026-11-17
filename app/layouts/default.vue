<!-- Shared shell for every page: sticky header, cart drawer, page content, footer -->
<template>
  <div class="sk-shell">
    <AppHeader />
    <CartDrawer />
    <v-main class="sk-main">
      <slot />
    </v-main>
    <AppFooter />
  </div>
</template>

<style scoped>
.sk-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--sk-white);
}

.sk-main {
  flex: 1 0 auto;
}
</style>
