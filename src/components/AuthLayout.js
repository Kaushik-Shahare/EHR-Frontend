'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AuthLayout = ({ children, title, subtitle, linkText, linkUrl }) => {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 relative">
        <div className="absolute inset-0">
          <Image 
            src="/health-banner.jpg" 
            alt="Healthcare professionals" 
            fill 
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-40 flex flex-col justify-end p-12">
            <h2 className="text-4xl font-bold text-white mb-4">EHR System</h2>
            <p className="text-xl text-white mb-8">Advanced electronic health record management for healthcare professionals</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          {children}
          
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {linkText} <Link href={linkUrl} className="text-blue-600 hover:underline font-medium">
                {linkUrl === '/login' ? 'Login here' : 'Sign up here'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
