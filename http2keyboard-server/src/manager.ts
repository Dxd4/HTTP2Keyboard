import AsyncLock from 'async-lock';
import { Config } from './config';
import { Keyboard } from './keyboard/keyboard';
import { saveSettings, loadSettings, Settings } from './settings';
import PollingService from './polling-service';

class Manager {
  private config: Config;
  private keyboard: Keyboard;
  private settings: Settings;
  private pollingService: PollingService;
  private lock = new AsyncLock();

  constructor(
    config: Config,
    keyboard: Keyboard,
    settings: Settings,
    pollingService: PollingService,
  ) {
    this.config = config;
    this.keyboard = keyboard;
    this.settings = settings;
    this.pollingService = pollingService;
  }

  getCurrentScanner() {
    const scanners = this.connections;
    if (scanners.length < 1) return null;
    let currentScanner = scanners[0]!;
    for (const scanner of scanners) {
      if (currentScanner.activatedAt < scanner.activatedAt) {
        currentScanner = scanner;
      }
    }
    return currentScanner;
  }

  getScannerUrl() {
    try {
      const scanner = this.getCurrentScanner();
      if (!scanner) return null;
      return `http://${this.config.s2hHost}:${this.config.s2hPort}/scanners/${scanner.scannerId}/poll`;
    } catch {
      return null;
    }
  }

  async saveSettingsConfig() {
    await saveSettings(this.settings);
  }

  async loadSettingsConfig() {
    this.settings = await loadSettings();
  }

  async isScannerAlive(scannerId: string): Promise<boolean> {
    try {
      const url = new URL(
        `http://${this.config.s2hHost}:${this.config.s2hPort}/scanners/${scannerId}/isAlive`,
      );
      const response = await fetch(url.toString());
      return response.ok;
    } catch (error) {
      console.error(`Failed to check if scanner ${scannerId} is alive:`, error);
      return false;
    }
  }

  public async activateScanner(scannerId: string): Promise<void> {
    await this.lock.acquire('activation', async () => {
      const isAlive = await this.isScannerAlive(scannerId);
      if (!isAlive) throw new Error('Scanner is not available');

      await this.pollingService.stop();

      const now = new Date();
      const existing = this.settings.connections.find(
        (s) => s.scannerId === scannerId,
      );
      if (existing) {
        existing.activatedAt = now;
      } else {
        this.settings.connections.push({ scannerId, activatedAt: now });
      }
      await this.saveSettingsConfig();
      await this.pollingService.start(this.getScannerUrl());
    });
  }

  get connections() {
    return this.settings.connections;
  }

  getIsPolling() {
    return this.pollingService.getIsPolling();
  }

  startPolling() {
    this.pollingService.start(this.getScannerUrl()).catch(console.error);
  }

  async stopPolling() {
    await this.pollingService.stop();
  }
}

export default Manager;
