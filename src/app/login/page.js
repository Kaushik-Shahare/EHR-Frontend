'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/AuthLayout';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, error: authError, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  useEffect(() => {
      if(typeof window !== "undefined") {
          // Check if the user is logged in
          const token = localStorage.getItem("accesstoken");
          if (token) {
              // Redirect to login page if not logged in
              window.location.href = "/admin/dashboard";
          }
      }
    }
    , []);

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your EHR account"
      linkText="Don't have an account?"
      linkUrl="/signup"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{authError}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="name@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 4,
                message: 'Password must be at least 6 characters'
              }
            })}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              {...register('remember')}
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <a href="#" className="text-sm text-blue-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
