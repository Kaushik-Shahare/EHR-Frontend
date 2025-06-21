'use client';

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children, title, hideFooter = false }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar title={title} />
      
      <main className="flex-grow">
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
