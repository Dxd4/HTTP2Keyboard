import { Config } from './config';
import { Keyboard } from './keyboard/keyboard';

interface PollingServiceConfig {
  config: Config;
  keyboard: Keyboard;
}

class PollingService {
  private config: Config;
  private keyboard: Keyboard;
  private scannerUrl: string | null = null;
  private isPolling: boolean = false;
  private pollingTask: Promise<void> | null = null;
  private abortController: AbortController | null = null;

  constructor(serviceConfig: PollingServiceConfig) {
    this.config = serviceConfig.config;
    this.keyboard = serviceConfig.keyboard;
  }

  public async start(scannerUrl: string | null) {
    if (this.isPolling) throw new Error('Polling is already active');
    this.isPolling = true;
    this.scannerUrl = scannerUrl;
    this.pollingTask = this.pollAndType();
  }

  public async stop() {
    if (!this.isPolling) return;
    this.isPolling = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.pollingTask) {
      await this.pollingTask;
      this.pollingTask = null;
    }
  }

  public getIsPolling() {
    return this.isPolling;
  }

  private async pollAndType() {
    while (this.isPolling) {
      try {
        const urlString = this.scannerUrl;
        if (!urlString) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        const url = new URL(urlString);
        url.searchParams.set('timeout', String(this.config.pollTimeout));
        url.searchParams.set('lockState', 'daemon');

        this.abortController = new AbortController();
        const response = await fetch(url.toString(), {
          signal: this.abortController.signal,
        });

        if (!response.ok) {
          console.warn(
            `Polling request failed with status: ${response.status}`,
          );
          continue;
        }

        const result = (await response.json()) as {
          status: string;
          data?: string;
        };

        if (result.status === 'success' && result.data) {
          this.keyboard.type(result.data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Normal abort, do nothing
        } else if (
          error instanceof TypeError &&
          error.message.includes('fetch failed')
        ) {
          console.warn('Scanner connection lost or unreachable (fetch failed)');
        } else {
          console.error('Error during polling:', error);
        }
      } finally {
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }
}

export default PollingService;
