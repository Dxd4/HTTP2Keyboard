import { config } from './config';
import HTTPServer from './http/server';
import { Keyboard } from './keyboard/keyboard';
import Manager from './manager';
import PollingService from './polling-service';
import Scanner2HttpClient from './scanner2http/client';
import { loadSettings } from './settings';

async function main() {
  const settings = await loadSettings();
  const keyboard = new Keyboard(
    settings.prefixes,
    settings.suffixes,
    settings.replacements,
  );

  const pollingService = new PollingService({
    config,
    keyboard,
  });

  const scanner2http = new Scanner2HttpClient(config);

  const manager = new Manager(keyboard, settings, pollingService, scanner2http);

  await manager
    .selectFirstAvailableScanner()
    .catch((error) =>
      console.error('Failed to select first available scanner:', error),
    );

  const server = new HTTPServer(config, manager);
  await server.start();
  console.info(
    `HTTP2Scanner server started on http://${config.host}:${config.port}`,
  );
}

void main();
