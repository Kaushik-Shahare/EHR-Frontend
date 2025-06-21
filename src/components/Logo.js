'use client';

import React from 'react';
import { BsHeartPulse } from 'react-icons/bs';

const Logo = ({ size = 'normal', className = '' }) => {
  // Define text size based on the size prop
  const textSizeClass = size === 'small' ? 'text-lg' : size === 'large' ? 'text-3xl' : 'text-2xl';
  const iconSizeClass = size === 'small' ? 'text-xl' : size === 'large' ? 'text-4xl' : 'text-3xl';
  
  return (
    <div className={`flex items-center ${className}`}>
      <BsHeartPulse className={`${iconSizeClass} text-blue-500 mr-2`} />
      <h1 className={`${textSizeClass} font-bold text-blue-500`}>
        MedAudit
      </h1>
    </div>
  );
};

export default Logo;
