import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

/* ========================================
   SHOPKART THEME (Spring Meadow palette)
   Solid, opaque surfaces only. Depth comes from
   tonal contrast between these colors.
========================================= */
const shopkartTheme = {
  dark: false,
  colors: {
    background: '#F7F9E1', // Morning Mist  - page environment
    surface: '#FFFFFF', // Pure White    - content surfaces
    primary: '#204654', // Teal Waters   - primary actions
    secondary: '#CAFFA6', // Spring Meadow - highlights
    accent: '#A9E0F1', // Glacial Sky   - feature surfaces
    'on-secondary': '#204654',
    'on-accent': '#204654',
    success: '#2F7A4D',
    warning: '#A86411',
    error: '#B4372C',
    info: '#2C6E82',
  },
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'shopkart',
      themes: { shopkart: shopkartTheme },
    },

    // Component defaults keep every page visually consistent
    defaults: {
      VBtn: { rounded: 'lg', elevation: 0, class: 'text-none' },
      VCard: { rounded: 'xl', flat: true },
      VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VFileInput: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VChip: { rounded: 'lg' },
      VDialog: { scrim: '#0E2129' },
      VSnackbar: { rounded: 'lg' },
    },
  })
  app.vueApp.use(vuetify)
})
