/* ========================================
   GLOBAL FEEDBACK (snackbar)
   Any page calls: const { notify } = useToast(); notify('Saved', 'success')
   The snackbar itself is rendered once in app.vue.
========================================= */
type ToastTone = 'success' | 'error' | 'warning' | 'info'

export function useToast() {
  const toast = useState('toast', () => ({
    show: false,
    message: '',
    tone: 'success' as ToastTone,
  }))

  function notify(message: string, tone: ToastTone = 'success') {
    toast.value = { show: true, message, tone }
  }

  return { toast, notify }
}
