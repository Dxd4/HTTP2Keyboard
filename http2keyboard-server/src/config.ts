import dotenv from 'dotenv';
import { z } from 'zod';

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: envFile });

const configSchema = z.object({
  host: z
    .string()
    .min(1)
    .regex(/localhost/),
  port: z.number().int().min(1).max(65535),
  s2hHost: z
    .string()
    .min(1)
    .regex(/localhost/),
  s2hPort: z.number().int().min(1).max(65535),
  pollTimeout: z.coerce.number().int().min(1500).max(30000),
});

type Config = z.infer<typeof configSchema>;

function loadConfig(): Config {
  const rawConfig = {
    host: process.env.APP_HOST,
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : undefined,
    s2hHost: process.env.SCANNER2HTTP_HOST,
    s2hPort: process.env.SCANNER2HTTP_PORT
      ? parseInt(process.env.SCANNER2HTTP_PORT, 10)
      : undefined,
    pollTimeout: process.env.POLL_TIMEOUT,
  };

  const config = configSchema.parse(rawConfig);
  return config;
}

export const config = loadConfig();
export type { Config };
