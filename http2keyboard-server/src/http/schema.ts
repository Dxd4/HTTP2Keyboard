import z from 'zod';

export const ScannerResponseSchema = z.object({
  scannerId: z.string(),
  activatedAt: z.coerce.date(),
});

export const ScannersResponseSchema = z.array(ScannerResponseSchema);

export const ActiveScannerParamsSchema = z.object({
  id: z.uuid({ version: 'v5' }),
});

export const PollingStatusResponseSchema = z.object({
  running: z.boolean(),
  actualScannerId: z.uuid({ version: 'v5' }).optional(),
});
