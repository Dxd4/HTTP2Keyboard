import type { AxiosInstance } from 'axios'
import axios from 'axios'

export interface Scanner2HttpDevice {
  id: string
  path: string
  vendorId: string
  productId: string
}

let scanner2httpClient: AxiosInstance

export function setScanner2HttpBaseUrl (baseUrl: string) {
  scanner2httpClient = axios.create({ baseURL: baseUrl })
}

export async function fetchAvailableScanners (): Promise<Scanner2HttpDevice[]> {
  const response = await scanner2httpClient.get<Scanner2HttpDevice[]>('/scanners')
  return response.data
}

export async function isScannerAlive (id: string): Promise<boolean> {
  try {
    await scanner2httpClient.get(`/scanners/${id}/isAlive`)
    return true
  } catch {
    return false
  }
}
