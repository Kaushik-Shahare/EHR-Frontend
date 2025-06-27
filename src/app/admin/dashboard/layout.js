"use client";
import { ChevronDown, Search, User } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        // Add logout logic here
        console.log('Logging out...');
    };

    const handleProfile = () => {
        // Add profile navigation logic here
        console.log('Navigating to profile...');
    };

    return (
        
            <main className="flex-1 overflow-y-auto  bg-gray-50">
                {children}
            </main>
            
    );
}