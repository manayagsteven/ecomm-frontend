<!-- ========================================
     PRODUCT IMAGE
     An <img> that shows the product photo with its empty margins
     trimmed (see utils/trimImage.ts), so every product fills its
     frame the same way. Fades in once the trimmed copy is ready.
     Size it from the parent with width/height + object-fit: contain.
========================================= -->
<template>
  <img
    :src="displaySrc || undefined"
    class="product-image"
    :class="{ 'is-ready': !!displaySrc }"
  >
</template>

<script setup lang="ts">
const props = defineProps<{ src: string }>()

const displaySrc = ref('')

watch(
  () => props.src,
  async (src) => {
    displaySrc.value = ''
    if (!src) return
    const trimmed = await trimImage(src)
    // Ignore a result for a src that has since changed
    if (src === props.src) displaySrc.value = trimmed
  },
  { immediate: true }
)
</script>

<style scoped>
.product-image {
  opacity: 0;
  transition: opacity 0.25s ease;
}

.product-image.is-ready {
  opacity: 1;
}
</style>
