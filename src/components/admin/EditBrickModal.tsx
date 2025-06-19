import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { Brick, BrickFormData, MaterialType, BrickSize } from '../../types/brick';
import { brickSchema } from '../../lib/validation';

interface EditBrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brick: Brick) => Promise<void>;
  brick: Brick;
}

const materialTypes: MaterialType[] = ['Clay', 'Concrete', 'Glass', 'Special'];
const brickSizes: BrickSize[] = ['Small', 'Standard', 'Large'];

const EditBrickModal: React.FC<EditBrickModalProps> = ({ isOpen, onClose, onSave, brick }) => {
  const [formData, setFormData] = useState<BrickFormData>({
    name: brick.name,
    dimensions: brick.dimensions,
    type: brick.type,
    size: brick.size,
    color: brick.color,
    price: brick.price,
    stock: brick.stock,
    manufacturer: brick.manufacturer,
    sku: brick.sku,
    minStockThreshold: brick.minStockThreshold,
    storageLocation: brick.storageLocation,
    image: brick.image,
    description: brick.description,
    featured: brick.featured
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: brick.name,
      dimensions: brick.dimensions,
      type: brick.type,
      size: brick.size,
      color: brick.color,
      price: brick.price,
      stock: brick.stock,
      manufacturer: brick.manufacturer,
      sku: brick.sku,
      minStockThreshold: brick.minStockThreshold,
      storageLocation: brick.storageLocation,
      image: brick.image,
      description: brick.description,
      featured: brick.featured
    });
  }, [brick]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: BrickFormData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BrickFormData] as object),
          [child]: value,
        },
      }));
    } else {
      setFormData((prev: BrickFormData) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: BrickFormData) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof BrickFormData] as object),
          [child]: numValue,
        },
      }));
    } else {
      setFormData((prev: BrickFormData) => ({
        ...prev,
        [name]: numValue,
      }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const validatedData = brickSchema.parse(formData);
      await onSave({ ...validatedData, id: brick.id });
      onClose();
      toast.success('Brick updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path.join('.')] = err.message;
          }
        });
        setErrors(newErrors);
      }
      toast.error('Failed to update brick');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-800">Edit Brick</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Brick Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.name ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Material Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.type ? 'border-error-500' : 'border-neutral-300'
                  }`}
                >
                  {materialTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-error-500">{errors.type}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberChange}
                  step="0.01"
                  min="0.01"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.price ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-error-500">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleNumberChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.stock ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-error-500">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Size *
                </label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.size ? 'border-error-500' : 'border-neutral-300'
                  }`}
                >
                  {brickSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {errors.size && (
                  <p className="mt-1 text-sm text-error-500">{errors.size}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.description ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error-500">{errors.description}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 border-neutral-300 rounded"
                />
                <label className="text-sm font-medium text-neutral-700">
                  Featured Product
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.image ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.image && (
                  <p className="mt-1 text-sm text-error-500">{errors.image}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.sku ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-error-500">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Storage Location *
                </label>
                <input
                  type="text"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.storageLocation ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.storageLocation && (
                  <p className="mt-1 text-sm text-error-500">{errors.storageLocation}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBrickModal; 