export type MaterialType = 'Clay' | 'Concrete' | 'Glass' | 'Special';
export type BrickSize = 'Small' | 'Standard' | 'Large';

export interface BrickDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Brick {
  id: string;
  name: string;
  dimensions: BrickDimensions;
  type: MaterialType;
  size: BrickSize;
  color: string;
  price: number;
  stock: number;
  manufacturer: string;
  sku: string;
  minStockThreshold: number;
  storageLocation: string;
  image: string;
  description: string;
  featured: boolean;
}

export type BrickFormData = Omit<Brick, 'id'>; 