import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAvailableScanners, type Scanner2HttpDevice, setScanner2HttpBaseUrl } from '@/api/scanner2http'

export const useScanner2HttpStore = defineStore('scanner2http', () => {
  const scanner2httpUrl = ref<string>(
    import.meta.env.VITE_SCANNER2HTTP_URL || 'http://localhost:55100',
  )
  const intervalId = setInterval(() => {
    void loadAvailableScanners()
  }, 2000)

  const availableScanners = ref<Scanner2HttpDevice[]>([])

  async function loadAvailableScanners () {
    availableScanners.value = await fetchAvailableScanners()
  }

  async function init () {
    setScanner2HttpBaseUrl(scanner2httpUrl.value)
    await loadAvailableScanners()
  }

  return { init, scanner2httpUrl, loadAvailableScanners, availableScanners }
})
