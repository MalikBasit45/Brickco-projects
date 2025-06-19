import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { BrickFormData, MaterialType, BrickSize } from '../../types/brick';
import { brickSchema } from '../../lib/validation';

interface AddBrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (brick: BrickFormData) => void;
}

const materialTypes: MaterialType[] = ['Clay', 'Concrete', 'Glass', 'Special'];
const brickSizes: BrickSize[] = ['Small', 'Standard', 'Large'];

const AddBrickModal: React.FC<AddBrickModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<BrickFormData>({
    name: '',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
    },
    type: 'Clay',
    size: 'Standard',
    color: '#e74c3c',
    price: 0,
    stock: 0,
    manufacturer: '',
    sku: '',
    minStockThreshold: 100,
    storageLocation: '',
    image: '',
    description: '',
    featured: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [draftTimeout, setDraftTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load draft from localStorage
    const savedDraft = localStorage.getItem('brickDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  useEffect(() => {
    // Auto-save draft
    if (draftTimeout) {
      clearTimeout(draftTimeout);
    }
    
    const timeout = setTimeout(() => {
      localStorage.setItem('brickDraft', JSON.stringify(formData));
      toast.success('Draft saved', { id: 'draft-save' });
    }, 2000);
    
    setDraftTimeout(timeout);
    
    return () => {
      if (draftTimeout) {
        clearTimeout(draftTimeout);
      }
    };
  }, [formData]);

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
      await onAdd(validatedData);
      localStorage.removeItem('brickDraft');
      onClose();
      toast.success('Brick added successfully');
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
      toast.error('Failed to add brick');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-800">Add New Brick</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
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
                  Color *
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="h-10 w-20"
                  />
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className={`flex-1 px-3 py-2 border rounded-md ${
                      errors.color ? 'border-error-500' : 'border-neutral-300'
                    }`}
                  />
                </div>
                {errors.color && (
                  <p className="mt-1 text-sm text-error-500">{errors.color}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Unit Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleNumberChange}
                  step="0.01"
                  min="0"
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
                  Initial Stock Quantity *
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
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Dimensions (mm) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <input
                      type="number"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleNumberChange}
                      placeholder="Length"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors['dimensions.length'] ? 'border-error-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors['dimensions.length'] && (
                      <p className="mt-1 text-sm text-error-500">{errors['dimensions.length']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleNumberChange}
                      placeholder="Width"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors['dimensions.width'] ? 'border-error-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors['dimensions.width'] && (
                      <p className="mt-1 text-sm text-error-500">{errors['dimensions.width']}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="number"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleNumberChange}
                      placeholder="Height"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors['dimensions.height'] ? 'border-error-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors['dimensions.height'] && (
                      <p className="mt-1 text-sm text-error-500">{errors['dimensions.height']}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Manufacturer *
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.manufacturer ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.manufacturer && (
                  <p className="mt-1 text-sm text-error-500">{errors.manufacturer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  SKU/Product Code *
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
                  Minimum Stock Threshold *
                </label>
                <input
                  type="number"
                  name="minStockThreshold"
                  value={formData.minStockThreshold}
                  onChange={handleNumberChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.minStockThreshold ? 'border-error-500' : 'border-neutral-300'
                  }`}
                />
                {errors.minStockThreshold && (
                  <p className="mt-1 text-sm text-error-500">{errors.minStockThreshold}</p>
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

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
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
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              icon={<Save size={18} />}
            >
              Save Brick
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBrickModal;