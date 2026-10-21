import { z } from 'zod';

export const AvailableScannerSchema = z.object({
  id: z.uuid({ version: 'v5' }),
  path: z.string().optional(),
  vendorId: z.string().optional(),
  productId: z.string().optional(),
});

export const AvailableScannersResponseSchema = z.array(z.unknown());

export type AvailableScanner = z.infer<typeof AvailableScannerSchema>;
export type AvailableScanners = AvailableScanner[];
