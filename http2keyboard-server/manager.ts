import AsyncLock from 'async-lock';
import { Keyboard } from './keyboard/keyboard';
import PollingService from './polling-service';
import Scanner2HttpClient from './scanner2http/client';
import { loadSettings, saveSettings, Settings } from './settings';

class Manager {
  private keyboard: Keyboard;
  private settings: Settings;
  private pollingService: PollingService;
  private scanner2http: Scanner2HttpClient;
  private lock = new AsyncLock();

  constructor(
    keyboard: Keyboard,
    settings: Settings,
    pollingService: PollingService,
    scanner2http: Scanner2HttpClient,
  ) {
    this.keyboard = keyboard;
    this.settings = settings;
    this.pollingService = pollingService;
    this.scanner2http = scanner2http;
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
      return this.scanner2http.getPollUrl(scanner.scannerId);
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
    return this.scanner2http.isScannerAlive(scannerId);
  }

  async selectFirstAvailableScanner(): Promise<boolean> {
    if (this.settings.connections.length > 0) {
      return false;
    }

    const scanners = await this.scanner2http.fetchAvailableScanners();
    if (scanners.length < 1) {
      console.warn('No available scanners found');
      return false;
    }

    for (const scanner of scanners) {
      const isAlive = await this.isScannerAlive(scanner.id);
      if (!isAlive) continue;

      try {
        await this.activateScanner(scanner.id);
        console.log(`Selected first available scanner: ${scanner.id}`);
        return true;
      } catch (error) {
        console.error(
          `Failed to activate scanner ${scanner.id}, next try:`,
          error,
        );
      }
    }

    console.warn('No alive scanners found');
    return false;
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
    if (this.getIsPolling()) {
      return;
    }
    this.pollingService.start(this.getScannerUrl()).catch(console.error);
  }

  async stopPolling() {
    await this.pollingService.stop();
  }
}

export default Manager;
