import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface LoginFormProps {
  initialEmail?: string;
}

// Define role type to ensure consistency
type UserRole = "admin" | "customer";

const LoginForm: React.FC<LoginFormProps> = ({ initialEmail = '' }) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      
      const success = await login(email, password, role);

      if (success) {
        toast.success('Login successful!');
        // Navigate based on role
        navigate(role === "admin" ? '/admin' : '/');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Role Toggle */}
      <div className="flex rounded-md overflow-hidden border border-neutral-300 mb-6">
        <button
          type="button"
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            role === "customer"
              ? 'bg-[#e74c3c] text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-50'
          }`}
          onClick={() => setRole("customer")}
        >
          Customer
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            role === "admin"
              ? 'bg-[#e74c3c] text-white'
              : 'bg-white text-neutral-600 hover:bg-neutral-50'
          }`}
          onClick={() => setRole("admin")}
        >
          Admin
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={18} className="text-neutral-500" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-[#e74c3c] focus:border-[#e74c3c]"
              placeholder="Email Address"
            />
          </div>
        </div>

        <div>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className="text-neutral-500" />
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-[#e74c3c] focus:border-[#e74c3c]"
              placeholder="Password"
            />
          </div>
        </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={isLoading}
            className="bg-[#e74c3c] hover:bg-[#c0392b] text-white font-medium py-3 text-lg"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
      </form>
    </div>
  );
};

export default LoginForm;