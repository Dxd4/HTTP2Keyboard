import { config } from './config';
import HTTPServer from './http/server';
import { Keyboard } from './keyboard/keyboard';
import Manager from './manager';
import { loadSettings } from './settings';
import PollingService from './polling-service';

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

  const manager = new Manager(config, keyboard, settings, pollingService);
  const server = new HTTPServer(config, manager);
  await server.start();
}

void main();
