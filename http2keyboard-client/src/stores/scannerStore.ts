import type { Scanner2HttpDevice } from '@/api/scanner2http'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  activateScanner,
  fetchPollingStatus,
  type PollingStatus,
  setHttp2KeyboardBaseUrl,
  startPolling,
  stopPolling,
} from '@/api/http2keyboard'

export const useScannerStore = defineStore('scanner', () => {
  const http2keyboardServerUrl = ref<string>(
    import.meta.env.VITE_HTTP2KEYBOARD_SERVER_URL || 'http://localhost:55110',
  )
  const pollingStatus = ref<PollingStatus>({ running: false, actualScannerId: '' })

  const isPollingRunning = computed(() => pollingStatus.value.running)
  const currentScannerId = computed(() => pollingStatus.value.actualScannerId)

  async function loadPollingStatus () {
    pollingStatus.value = await fetchPollingStatus()
  }

  async function activateScannerById (id: string) {
    await activateScanner(id)
    await loadPollingStatus()
  }

  async function startPollingService () {
    await startPolling()
    await loadPollingStatus()
  }

  async function stopPollingService () {
    await stopPolling()
    await loadPollingStatus()
  }

  async function init () {
    setHttp2KeyboardBaseUrl(http2keyboardServerUrl.value)
    await loadPollingStatus()
  }

  return {
    pollingStatus,
    isPollingRunning,
    currentScannerId,
    loadPollingStatus,
    activateScannerById,
    startPollingService,
    stopPollingService,
    init,
  }
})
