import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAvailableScanners, type Scanner2HttpDevice } from '@/api/scanner2http'

export const useScanner2HttpStore = defineStore('scanner2http', () => {
  const intervalId = setInterval(() => {
    void loadAvailableScanners()
  }, 2000)

  const availableScanners = ref<Scanner2HttpDevice[]>([])

  async function loadAvailableScanners () {
    availableScanners.value = await fetchAvailableScanners()
  }

  async function init () {
    await loadAvailableScanners()
  }

  return { init, loadAvailableScanners, availableScanners }
})
