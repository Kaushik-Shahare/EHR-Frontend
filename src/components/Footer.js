'use client';

import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-black py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <Logo size="small" className="mb-4 justify-start" />
            <p className="text-gray-400 mt-2">
              Secure, accessible, and comprehensive electronic health records for everyone.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-black">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-black">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-black">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-black">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-black">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-black">
                  HIPAA Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} MedAudit. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
