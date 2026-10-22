import { api } from './client'

export interface ActiveScanner {
  scannerId: string
  activatedAt: string
}

export interface PollingStatus {
  running: boolean
  actualScannerId: string
}

export async function fetchActiveScanners (): Promise<ActiveScanner[]> {
  const response = await api.get<ActiveScanner[]>('/scanners')
  return response.data
}

export async function activateScanner (id: string): Promise<void> {
  await api.post(`/scanners/${id}/activate`)
}

export async function startPolling (): Promise<void> {
  await api.post('/polling/start')
}

export async function stopPolling (): Promise<void> {
  await api.post('/polling/stop')
}

export async function fetchPollingStatus (): Promise<PollingStatus> {
  const response = await api.get<PollingStatus>('/polling/status')
  return response.data
}
