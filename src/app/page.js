'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import Box from '@/components/Box';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading, hasProfile } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to handle navigation based on auth status
  const navigateToDashboard = () => {
    if (isAuthenticated) {
      // If the user is authenticated, redirect to dashboard or profile
      if (hasProfile) {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">HealthRecord</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
              {isAuthenticated ? (
                <button 
                  onClick={navigateToDashboard}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Dashboard
                </button>
              ) : (
                <div className="flex space-x-4">
                  <Link 
                    href="/login" 
                    className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>

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
          <div className="md:hidden shadow-md">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
              {isAuthenticated ? (
                <button 
                  onClick={navigateToDashboard}
                  className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-blue-100"
                >
                  Dashboard
                </button>
              ) : (
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
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Modern Healthcare Records at Your Fingertips
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Our Electronic Health Record system makes it easy to manage your medical information securely and access it whenever you need it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                  onClick={() => router.push('/signup')}
                  className="px-6 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors text-lg"
                >
                  Get Started
                </button>
                <button 
                  onClick={() => router.push('#features')}
                  className="px-6 py-3 rounded-md border border-gray-300 hover:border-gray-400 text-gray-700 font-medium transition-colors text-lg"
                >
                  Learn More
                </button>
              </div>
              <p className="text-sm text-gray-600">
                HIPAA compliant and secure. Your data is protected with the latest encryption standards.
              </p>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500&q=80" 
                alt="Healthcare Professional" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our EHR system is designed with patients and healthcare providers in mind, offering a range of features to manage health records efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Secure Health Profiles',
                description: 'Safely store your medical information including allergies, medications, and past treatments.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: 'Medical History',
                description: 'Keep track of your complete medical history in one place, easily accessible when needed.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                )
              },
              {
                title: 'Health Metrics',
                description: 'Record and monitor important health metrics like blood pressure, sugar levels, and more.',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-8 w-8 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
            ].map((feature, index) => (
              <Box key={index} className="flex flex-col items-center text-center p-8">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Box>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About HealthRecord</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're on a mission to make healthcare information more accessible, secure, and useful for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-lg text-gray-600 mb-6">
                HealthRecord was founded with the belief that patients should have easy access to their complete medical records in a secure environment.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We work with healthcare providers to ensure seamless integration and data accuracy while maintaining the highest standards of privacy and security.
              </p>
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">Trusted by healthcare professionals nationwide</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src="https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Healthcare Team" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Have questions about our EHR system? We're here to help. Reach out to our support team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <Box className="p-8">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-blue-600 mr-3 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-blue-600 mr-3 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">support@healthrecord.com</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-blue-600 mr-3 mt-1">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">123 Healthcare Avenue, Medical District<br/>City, State 12345</p>
                  </div>
                </div>
              </div>
            </Box>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">HealthRecord</h3>
              <p className="text-gray-400">
                Secure, accessible, and comprehensive electronic health records for everyone.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
                </li>
                <li>
                  <Link href="#features" className="text-gray-400 hover:text-white">Features</Link>
                </li>
                <li>
                  <Link href="#about" className="text-gray-400 hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="#contact" className="text-gray-400 hover:text-white">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white">HIPAA Compliance</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} HealthRecord. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
