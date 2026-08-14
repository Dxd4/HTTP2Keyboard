import { defineStore } from 'pinia'
import { ref } from 'vue'
import { activateScanner, fetchPollingStatus, setHttp2KeyboardBaseUrl, startPolling, stopPolling } from '@/api/http2keyboard'

export const useHttp2KeyboardStore = defineStore('http2keyboard', () => {
  const http2keyboardServerUrl = ref<string>(
    import.meta.env.VITE_HTTP2KEYBOARD_SERVER_URL || 'http://localhost:55110',
  )
  setHttp2KeyboardBaseUrl(http2keyboardServerUrl.value)

  const activeScannerId = ref<string>()
  const isServiceActive = ref<boolean>()

  async function loadPollingInfo () {
    const { actualScannerId, running } = await fetchPollingStatus()
    activeScannerId.value = actualScannerId
    isServiceActive.value = running
  }

  async function setActiveScanner (id: string) {
    activateScanner(id)
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
