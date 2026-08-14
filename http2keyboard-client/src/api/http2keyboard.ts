import axios, { type AxiosInstance } from 'axios'

export interface ActiveScanner {
  scannerId: string
  activatedAt: string
}

export interface PollingStatus {
  running: boolean
  actualScannerId: string
}

let http2keyboardClient: AxiosInstance

export function setHttp2KeyboardBaseUrl (baseUrl: string) {
  http2keyboardClient = axios.create({ baseURL: baseUrl })
}

export async function fetchActiveScanners (): Promise<ActiveScanner[]> {
  const response = await http2keyboardClient.get<ActiveScanner[]>('/scanners')
  return response.data
}

export async function activateScanner (id: string): Promise<void> {
  await http2keyboardClient.post(`/scanners/${id}/activate`)
}

export async function startPolling (): Promise<void> {
  await http2keyboardClient.post('/polling/start')
}

export async function stopPolling (): Promise<void> {
  await http2keyboardClient.post('/polling/stop')
}

export async function fetchPollingStatus (): Promise<PollingStatus> {
  const response = await http2keyboardClient.get<PollingStatus>('/polling/status')
  return response.data
}
