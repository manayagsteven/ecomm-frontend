<template>
  <v-app>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- ========================================
         GLOBAL SNACKBAR (success / error feedback)
         Triggered from any page with useToast().notify()
    ========================================= -->
    <v-snackbar
      v-model="toast.show"
      :timeout="3200"
      location="bottom center"
      class="sk-toast"
      :class="`sk-toast--${toast.tone}`"
    >
      <div class="d-flex align-center ga-3">
        <v-icon :icon="toastIcon" size="20" />
        <span>{{ toast.message }}</span>
      </div>
      <template #actions>
        <v-btn icon="mdi-close" variant="text" size="small" aria-label="Dismiss" @click="toast.show = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
const { toast } = useToast()

const toastIcon = computed(() => {
  switch (toast.value.tone) {
    case 'error':
      return 'mdi-alert-circle-outline'
    case 'warning':
      return 'mdi-alert-outline'
    case 'info':
      return 'mdi-information-outline'
    default:
      return 'mdi-check-circle-outline'
  }
})
</script>

<style>
/* Solid snackbar surfaces: teal for success/info, deep red for errors */
.sk-toast .v-snackbar__wrapper {
  background: var(--sk-teal) !important;
  color: var(--sk-on-teal) !important;
  border-radius: var(--sk-r-md) !important;
  box-shadow: var(--sk-shadow-md) !important;
  font-weight: 600;
}

.sk-toast--success .v-icon,
.sk-toast--info .v-icon {
  color: var(--sk-meadow);
}

.sk-toast--error .v-snackbar__wrapper {
  background: #7d241c !important;
}

.sk-toast--warning .v-snackbar__wrapper {
  background: #6e4309 !important;
}
</style>
