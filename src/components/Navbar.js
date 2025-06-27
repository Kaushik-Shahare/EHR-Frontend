'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import { usePathname } from 'next/navigation';

const Navbar = ({ title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated, hasProfile, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  // Check if we're on the landing page
  const isLandingPage = pathname === '/';
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownRef]);

  // Function to handle navigation based on auth status
  const navigateToDashboard = () => {
    if (isAuthenticated) {
      // If the user is authenticated, redirect to dashboard or profile
      if (hasProfile && user.user_type === 'PATIENT') {
        router.push('/dashboard');
      } else {
        router.push('/profile');
      }
    } else {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  };

  return (
    <header className={`bg-white ${isLandingPage ? 'shadow-sm' : 'shadow'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href={user ? "/dashboard" : "/"}>
              <Logo />
            </Link>
            {title && !isLandingPage && (
              <h1 className="hidden sm:block text-xl md:text-3xl font-bold tracking-tight text-gray-900 ml-4 border-l border-gray-300 pl-4">
                {title}
              </h1>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isLandingPage ? (
              // Landing page links
              <>
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link href="#features" className="text-gray-700 hover:text-blue-600 font-medium">
                  Features
                </Link>
                <Link href="#about" className="text-gray-700 hover:text-blue-600 font-medium">
                  About Us
                </Link>
                <Link href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">
                  Contact
                </Link>
              </>
            ) : user ? (
              // Logged in user links
              <>
                <Link href="/dashboard">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors">Dashboard</span>
                </Link>
                <Link href="/records">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors">Records</span>
                </Link>
                {user.user_type === 'DOCTOR' && (
                  <Link href="/patients">
                    <span className="text-gray-600 hover:text-blue-600 transition-colors">Patients</span>
                  </Link>
                )}
              </>
            ) : null}
          </nav>
          
          {/* Authentication Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center focus:outline-none"
                  aria-label="Toggle profile menu"
                  title="Click to open profile menu"
                >
                  <div className="w-10 h-10 bg-blue-600 text-black rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md">
                    <span className="font-medium text-sm">
                      {user.name ? user.name.charAt(0).toUpperCase() : (
                        user.email ? user.email.charAt(0).toUpperCase() : 'U'
                      )}
                    </span>
                  </div>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl py-1 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                      {user.user_type && (
                        <p className="text-xs text-blue-600 mt-1">
                          {user.user_type === 'DOCTOR' ? 'Healthcare Provider' : 'Patient'} 
                        </p>
                      )}
                    </div>
                    
                    <Link href="/profile">
                      <div className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {hasProfile ? 'Profile' : 'Complete Profile'}
                        </div>
                      </div>
                    </Link>
                    
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-black font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden shadow-md mt-2">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isLandingPage ? (
                // Landing page mobile links
                <>
                  <Link href="/" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Home
                  </Link>
                  <Link href="#features" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Features
                  </Link>
                  <Link href="#about" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    About Us
                  </Link>
                  <Link href="#contact" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Contact
                  </Link>
                </>
              ) : user ? (
                // Logged in user mobile links
                <>
                  <Link href="/dashboard" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Dashboard
                  </Link>
                  <Link href="/records" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Records
                  </Link>
                  {user.user_type === 'DOCTOR' && (
                    <Link href="/patients" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                      Patients
                    </Link>
                  )}
                  <Link href="/profile" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    {hasProfile ? 'Edit Profile' : 'Complete Profile'}
                  </Link>
                  <button 
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Authentication mobile links
                <>
                  <Link href="/login" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Login
                  </Link>
                  <Link href="/signup" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
