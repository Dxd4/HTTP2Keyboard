import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setScanner2HttpBaseUrl } from '@/api/scanner2http'

export const useSettingsStore = defineStore('settings', () => {
  const scanner2httpUrl = ref<string>(
    import.meta.env.VITE_SCANNER2HTTP_URL || 'http://localhost:55100',
  )

  function setScanner2HttpUrl (url: string) {
    scanner2httpUrl.value = url
    setScanner2HttpBaseUrl(url)
    localStorage.setItem('scanner2httpUrl', url)
  }

  const saved = localStorage.getItem('scanner2httpUrl')
  if (saved) {
    scanner2httpUrl.value = saved
    setScanner2HttpBaseUrl(saved)
  } else {
    setScanner2HttpBaseUrl(scanner2httpUrl.value)
  }

  return { scanner2httpUrl, setScanner2HttpUrl }
})
