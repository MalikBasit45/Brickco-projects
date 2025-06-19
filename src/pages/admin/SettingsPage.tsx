import React from 'react';
import Button from '../../components/ui/Button';

const SettingsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">General Settings</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="BrickCo"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="info@brickco.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="(555) 123-4567"
                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Email Notifications</h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="ml-2 text-neutral-700">Order confirmations</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="ml-2 text-neutral-700">Shipping updates</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <span className="ml-2 text-neutral-700">Low stock alerts</span>
            </label>
          </div>
        </div>

        <div className="p-6">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;