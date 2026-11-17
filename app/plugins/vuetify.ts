import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'

/* ========================================
   SHOPKART THEME (Orange palette)
   Orange is the brand / buy color and always carries dark text.
   Charcoal is used for the footer, dark banners and secondary actions.
========================================= */
const shopkartTheme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-variant': '#FFE7D0', // promo banners, badges
    'on-surface-variant': '#1B1B1B',
    primary: '#FC6E20', // brand, buy buttons
    'on-primary': '#1B1B1B', // dark text on orange (passes contrast)
    secondary: '#323232', // header, footer, secondary text
    'on-secondary': '#FFFFFF',
    'on-background': '#1B1B1B',
    'on-surface': '#1B1B1B',
    error: '#DC2626', // sale prices, errors
    success: '#16A34A', // in stock, order placed
    warning: '#F59E0B', // star ratings
    info: '#323232',
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
      VCard: { rounded: 'lg', flat: true },
      VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VTextarea: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VFileInput: { variant: 'outlined', density: 'comfortable', color: 'primary', rounded: 'lg' },
      VChip: { rounded: 'lg' },
      VDialog: { scrim: '#1B1B1B' },
      VSnackbar: { rounded: 'lg' },
    },
  })
  app.vueApp.use(vuetify)
})
