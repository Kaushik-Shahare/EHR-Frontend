'use client';

import React from 'react';

/**
 * A simple box component with rounded corners, shadow, and a slight border
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped by the box
 * @param {string} props.className - Additional classes to apply to the box
 * @param {string} props.padding - Override default padding (p-6)
 * @param {string} props.width - Override default width (w-full)
 * @param {string} props.height - Specify a height (default: auto)
 * @param {Object} props.rest - Any other props to pass to the div
 */

const Box = ({ 
  children, 
  className = '', 
  padding = 'p-6', 
  width = 'w-full',
  height = '',
  ...rest
}) => {
  return (
    <div 
      className={`
        ${width} 
        ${height} 
        ${padding} 
        bg-white 
        rounded-lg 
        shadow-md 
        border 
        border-gray-200 
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Box;