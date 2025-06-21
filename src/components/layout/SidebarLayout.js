"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
  FaHome, 
  FaUserInjured, 
  FaCalendarAlt, 
  FaQuestionCircle,
  FaBell, 
  FaCog, 
  FaChevronRight
} from 'react-icons/fa';

export const SidebarLayout = ({ children }) => {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  // Navigation links configuration
  const navigationLinks = [
    { name: 'Dashboard', href: '/doctor', icon: <FaHome size={18} /> },
    { name: 'Patients', href: '/doctor/patients', icon: <FaUserInjured size={18} /> },
    // { name: 'Messages', href: '/doctor/messages', icon: <FaCommentDots size={18} /> },
    { name: 'Schedule', href: '/doctor/schedule', icon: <FaCalendarAlt size={18} /> },
    // { name: 'Teams', href: '/doctor/teams', icon: <FaUsers size={18} /> },
    // { name: 'Medical Records', href: '/doctor/records', icon: <FaFileMedical size={18} /> },
    // { name: 'Reports', href: '/doctor/reports', icon: <FaChartBar size={18} /> },
    // { name: 'Billing & Payments', href: '/doctor/billing', icon: <FaFileInvoiceDollar size={18} /> },
  ];

  // Utility links at the bottom
  const utilityLinks = [
    { name: 'Help', href: '/doctor/help', icon: <FaQuestionCircle size={18} /> },
    { name: 'Notifications', href: '/doctor/notifications', icon: <FaBell size={18} /> },
    { name: 'Settings', href: '/doctor/settings', icon: <FaCog size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-doctorTeal w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
      >
        {isMobileSidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      
      {/* Sidebar */}
      <aside className={`w-64 h-full fixed left-0 top-0 bg-white border-r border-gray-200 shadow-sm z-10 flex flex-col 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo/Brand section */}
        <div className="h-16 flex items-center justify-start px-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-doctorTeal rounded-md flex items-center justify-center">
              <span className=" font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-xl text-gray-800">MedTrackr</span>
          </div>
        </div>
        
        {/* Navigation section */}
        <nav className="flex-grow py-5 overflow-y-auto">
          <ul className="space-y-1 px-4">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;
              
              return (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-100 border-2 border-blue-200 text-patientBlue border-patientBlue' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className={`${isActive ? 'text-patientBlue' : 'text-gray-500 group-hover:text-gray-700'}`}>
                      {link.icon}
                    </span>
                    <span className={`font-medium ${isActive ? 'text-patientBlue' : ''}`}>{link.name}</span>
                    {isActive && (
                      <span className="ml-auto text-patientBlue">
                        <FaChevronRight size={12} />
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Bottom utility section */}
        <div className="border-t border-gray-200 py-4 px-4">
          <ul className="space-y-1">
            {utilityLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <span className="text-gray-500">{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* User profile section */}
        <div className="border-t border-gray-200 p-4">
          <Link href="/doctor/profile">
            <div className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="font-medium text-gray-600">DR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">Dr. Sarah Reynolds</p>
                <p className="text-xs text-gray-500 truncate">Cardiologist</p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-0"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
