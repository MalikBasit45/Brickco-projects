import { z } from 'zod';
import { MaterialType, BrickSize } from '../types/brick';

export const brickSchema = z.object({
  name: z.string().min(1, 'Brick name is required'),
  dimensions: z.object({
    length: z.number().min(1, 'Length must be greater than 0'),
    width: z.number().min(1, 'Width must be greater than 0'),
    height: z.number().min(1, 'Height must be greater than 0'),
  }),
  type: z.enum(['Clay', 'Concrete', 'Glass', 'Special'] as const satisfies readonly MaterialType[]),
  size: z.enum(['Small', 'Standard', 'Large'] as const satisfies readonly BrickSize[]),
  color: z.string().min(1, 'Color is required'),
  price: z.number().min(0.01, 'Price must be greater than 0').multipleOf(0.01),
  stock: z.number().int().min(0, 'Stock must be a positive number'),
  manufacturer: z.string().min(1, 'Manufacturer is required'),
  sku: z.string().min(1, 'SKU is required'),
  minStockThreshold: z.number().int().min(1, 'Minimum stock threshold must be greater than 0'),
  storageLocation: z.string().min(1, 'Storage location is required'),
  image: z.string().url('Invalid image URL'),
  description: z.string().min(1, 'Description is required'),
  featured: z.boolean()
}); 