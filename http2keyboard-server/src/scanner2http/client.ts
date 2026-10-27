import { Config } from '../config';
import { logger } from '../logger';
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
        logger.error(
          `Failed to fetch available scanners: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const raw = AvailableScannersResponseSchema.safeParse(
        await response.json(),
      );
      if (!raw.success) {
        logger.error(
          { err: raw.error },
          'Unexpected response from scanner2http',
        );
        return [];
      }

      const scanners: AvailableScanner[] = [];
      for (const item of raw.data) {
        const result = AvailableScannerSchema.safeParse(item);
        if (!result.success) {
          logger.warn(
            { err: result.error },
            'Skipping malformed scanner entry',
          );
          continue;
        }
        scanners.push(result.data);
      }

      return scanners;
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch available scanners');
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
      logger.error(
        { err: error },
        `Failed to check if scanner ${scannerId} is alive`,
      );
      return false;
    }
  }
}

export default Scanner2HttpClient;
