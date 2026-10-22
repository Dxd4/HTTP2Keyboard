import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activateScanner, fetchPollingStatus, startPolling, stopPolling } from '@/api/http2keyboard'

export const useHttp2KeyboardStore = defineStore('http2keyboard', () => {
  const activeScannerId = ref<string>()
  const isServiceActive = ref<boolean>()

  async function loadPollingInfo () {
    const { actualScannerId, running } = await fetchPollingStatus()
    activeScannerId.value = actualScannerId
    isServiceActive.value = running
  }

  async function setActiveScanner (id: string) {
    await activateScanner(id)
  }

  async function togglePolling () {
    if (isServiceActive.value) {
      stopPolling()
    } else {
      startPolling()
    }
  }

  async function init () {
    setInterval(() => {
      void loadPollingInfo()
    }, 2000)
    await loadPollingInfo()
  }

  return { init, isServiceActive, activeScannerId, setActiveScanner, togglePolling }
})
