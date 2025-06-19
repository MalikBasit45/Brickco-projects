import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchCustomerInfo();
  }, [user]);

  const fetchCustomerInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const data = await response.json();
      setCustomerInfo(data);
    } catch (error) {
      console.error('Error fetching customer info:', error);
      toast.error('Failed to fetch customer information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !customerInfo) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/api/customers/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerInfo)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <User className="w-12 h-12 text-neutral-400" />
          <div>
            <h1 className="text-3xl font-bold">My Account</h1>
            <p className="text-neutral-600">Manage your profile and preferences</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={customerInfo?.name || ''}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev!, name: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customerInfo?.email || ''}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev!, email: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerInfo?.phone || ''}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev!, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Delivery Address
              </label>
              <textarea
                value={customerInfo?.address || ''}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev!, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your delivery address"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate('/account/orders')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 