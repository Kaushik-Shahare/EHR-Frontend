'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Logo from './Logo';

const Navbar = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Logo />
          </Link>
          {title && (
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 ml-4 border-l border-gray-300 pl-4">
              {title}
            </h1>
          )}
        </div>
        
        {user && (
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard">
              <span className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</span>
            </Link>
            <Link href="/records">
              <span className="text-gray-600 hover:text-blue-600 transition-colors">Records</span>
            </Link>
            {(user.role === 'DOCTOR' || user.role === 'ADMIN') && (
              <Link href="/patients">
                <span className="text-gray-600 hover:text-blue-600 transition-colors">Patients</span>
              </Link>
            )}
            {/* Add more navigation links as needed */}
          </nav>
        )}
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <Link href="/profile">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors">
                  {user?.hasProfile ? 'Profile' : 'Complete Profile'}
                </button>
              </Link>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
