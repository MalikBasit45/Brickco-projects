import React, { useState } from 'react';
import { Plus, MapPin, Edit2, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

const ShippingAddressPage: React.FC = () => {
  const [addresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home',
      street: '123 Main St',
      city: 'Brickville',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true,
    },
    {
      id: '2',
      name: 'Office',
      street: '456 Business Ave',
      city: 'Brickville',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
      isDefault: false,
    },
  ]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-neutral-800">Shipping Addresses</h2>
        <Button icon={<Plus size={18} />}>Add New Address</Button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`border rounded-lg p-4 ${
              address.isDefault ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <MapPin size={18} className="text-primary-600 mr-2" />
                <h3 className="font-medium text-neutral-800">
                  {address.name}
                  {address.isDefault && (
                    <span className="ml-2 text-sm text-primary-600">(Default)</span>
                  )}
                </h3>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit2 size={16} />}
                  className="text-neutral-600 hover:text-primary-600"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={16} />}
                  className="text-neutral-600 hover:text-error-600"
                />
              </div>
            </div>
            
            <div className="text-neutral-600">
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.zipCode}</p>
              <p>{address.country}</p>
            </div>
            
            {!address.isDefault && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
              >
                Set as Default
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingAddressPage;