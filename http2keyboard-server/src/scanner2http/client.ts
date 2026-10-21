import { Config } from '../config';
import {
  AvailableScanner,
  AvailableScannerSchema,
  AvailableScannersResponseSchema,
} from './schema';

class Scanner2HttpClient {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return `http://${this.config.s2hHost}:${this.config.s2hPort}`;
  }

  getPollUrl(scannerId: string): string {
    return `${this.getBaseUrl()}/scanners/${encodeURIComponent(scannerId)}/poll`;
  }

  async fetchAvailableScanners(): Promise<AvailableScanner[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/scanners`);
      if (!response.ok) {
        console.error(
          `Failed to fetch available scanners: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const raw = AvailableScannersResponseSchema.safeParse(
        await response.json(),
      );
      if (!raw.success) {
        console.error('Unexpected response from scanner2http:', raw.error);
        return [];
      }

      const scanners: AvailableScanner[] = [];
      for (const item of raw.data) {
        const result = AvailableScannerSchema.safeParse(item);
        if (!result.success) {
          console.warn('Skipping malformed scanner entry:', result.error);
          continue;
        }
        scanners.push(result.data);
      }

      return scanners;
    } catch (error) {
      console.error('Failed to fetch available scanners:', error);
      return [];
    }
  }

  async isScannerAlive(scannerId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.getBaseUrl()}/scanners/${encodeURIComponent(scannerId)}/isAlive`,
      );
      return response.ok;
    } catch (error) {
      console.error(`Failed to check if scanner ${scannerId} is alive:`, error);
      return false;
    }
  }
}

export default Scanner2HttpClient;
