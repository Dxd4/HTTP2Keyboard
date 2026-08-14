import { readFile, writeFile } from 'node:fs/promises';
import { z } from 'zod';

const ScannerConnectionSchema = z.object({
  scannerId: z.uuid({ version: 'v5' }),
  activatedAt: z.coerce.date(),
});

const SettingSchema = z.object({
  connections: z.array(ScannerConnectionSchema).default([]),
  prefixes: z.array(z.string()).default([]),
  suffixes: z.array(z.string()).default(['key:enter']),
  replacements: z.record(z.string(), z.string()).default({}),
});

type Scanner = z.infer<typeof ScannerConnectionSchema>;
type Settings = z.infer<typeof SettingSchema>;

export async function loadSettings(
  filePath: string = 'settings.json',
): Promise<Settings> {
  const rawData = readFile(filePath, 'utf-8');
  const result = SettingSchema.parse(JSON.parse(await rawData));
  return result;
}

export async function saveSettings(
  settings: Settings,
  filePath: string = 'settings.json',
) {
  const json = JSON.stringify(settings, null, 2);
  await writeFile(filePath, json, 'utf-8');
}

export type { Settings, Scanner };
