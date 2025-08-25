'use client';

import Image from 'next/image';
import React from 'react';

const Logo = ({ size = 'normal', className = '' }) => {
  // Define text size based on the size prop
  const textSizeClass = size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-2xl';
  const iconSizeClass = size === 'small' ? 'text-xl' : size === 'large' ? 'text-4xl' : 'text-3xl';
  
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="EHR Logo"
        width={170}
        height={50}
        className={`mr-2 ${iconSizeClass}`}
      />
    </div>
  );
};

export default Logo;
