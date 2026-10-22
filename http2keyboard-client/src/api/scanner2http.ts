import { api } from './client'

export interface Scanner2HttpDevice {
  id: string
  path: string
  vendorId: string
  productId: string
}

export async function fetchAvailableScanners (): Promise<Scanner2HttpDevice[]> {
  const response = await api.get<Scanner2HttpDevice[]>('/scanner2http/scanners')
  return response.data
}

export async function isScannerAlive (id: string): Promise<boolean> {
  try {
    await api.get(`/scanner2http/scanners/${id}/isAlive`)
    return true
  } catch {
    return false
  }
}
