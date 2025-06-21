"use client";

import React from 'react';

export default function DoctorProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Doctor Profile</h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 max-w-xl">
        <div className="flex items-start gap-6 mb-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
            DR
          </div>
          <div>
            <h2 className="text-xl font-bold">Dr. Sarah Reynolds</h2>
            <p className="text-gray-600">Cardiologist</p>
            <p className="mt-2 text-gray-500">ID: MED39205</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
            <p className="text-gray-600">Email: sarah.reynolds@medtrackr.com</p>
            <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Department</h3>
            <p className="text-gray-600">Cardiology</p>
            <p className="text-gray-600">Hours: Mon-Fri, 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
