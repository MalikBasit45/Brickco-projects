import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';

const signupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear();
    return age >= 18;
  }, 'You must be at least 18 years old'),
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate form data
      signupSchema.parse(formData);
      
      console.log('Starting signup process...');
      
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: 'customer'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('No user data returned');
        throw new Error('No user data returned');
      }

      console.log('Auth successful, creating customer record...');

      // Insert customer data
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: authData.user.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          date_of_birth: formData.dateOfBirth,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country
        });

      if (customerError) {
        console.error('Customer data error:', customerError);
        throw customerError;
      }
        
      console.log('Signup successful!');
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login', { 
        state: { 
          email: formData.email,
          showWelcome: true 
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please check the form for errors');
      } else {
        console.error('Signup error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-2xl font-bold text-neutral-800 mb-6">Create an Account</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.firstName ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-error-500">{errors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.lastName ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-error-500">{errors.lastName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.email ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-error-500">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.phone ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-error-500">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.dateOfBirth ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.dateOfBirth && (
                        <p className="mt-1 text-sm text-error-500">{errors.dateOfBirth}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Password</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.password ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-error-500">{errors.password}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.confirmPassword ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-error-500">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-semibold text-neutral-800 mb-4">Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.street ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-error-500">{errors.street}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.city ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-error-500">{errors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        State/Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.state ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-error-500">{errors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.postalCode ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-error-500">{errors.postalCode}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Country *
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md ${
                          errors.country ? 'border-error-500' : 'border-neutral-300'
                        }`}
                        required
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-error-500">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-3 text-lg"
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;