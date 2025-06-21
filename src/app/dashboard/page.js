// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext';
// import { useRecords } from '@/context/RecordContext';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import Link from 'next/link';
// import MainLayout from '@/components/MainLayout';
// import RecordList from '@/components/records/RecordList';

// export default function Dashboard() {
//   const { user, loading, isAuthenticated, hasProfile } = useAuth();
//   const router = useRouter();
//   const [profile, setProfile] = useState(null);
//   const [loadingProfile, setLoadingProfile] = useState(false);
  
//   const { fetchRecords, records, loading: recordsLoading } = useRecords();

//   useEffect(() => {
//     if (!loading && !isAuthenticated) {
//       router.push('/login');
//     } else if (isAuthenticated && !hasProfile) {
//       // Redirect to profile page if user doesn't have a profile
//       router.push('/profile');
//     } else if (isAuthenticated && hasProfile) {
//       fetchProfile();
//       // Fetch recent records
//       fetchRecords(1, 5, { status: 'ACTIVE' });
//     }
//   }, [loading, isAuthenticated, hasProfile, router]);

//   const fetchProfile = async () => {
//     try {
//       setLoadingProfile(true);
//       const token = Cookies.get('token');
//       const res = await axios.get(`${process.env.BACKEND_URL}/profile`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setProfile(res.data.profile);
//     } catch (error) {
//       console.error('Failed to fetch profile:', error);
//     } finally {
//       setLoadingProfile(false);
//     }
//   };

//   if (loading || loadingProfile) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-700">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return null; // Will redirect in useEffect
//   }

//   return (
//     <MainLayout title="Dashboard">
//       <div className="bg-gray-50 min-h-full py-6">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="bg-white shadow sm:rounded-lg p-6">
//             <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName || 'User'}!</h2>
            
//             <div className="mb-6">
//               <p className="text-gray-600">
//                 Your account details:
//               </p>
//               <div className="mt-4 p-4 bg-gray-50 rounded-md">
//                 <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
//                 <p><strong>Email:</strong> {user?.email}</p>
//                 <p><strong>Role:</strong> {user?.role}</p>
//               </div>
//             </div>

//             {profile && (
//               <div className="mt-8">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Your Health Profile</h3>
                
//                 <div className="bg-gray-50 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {profile.bloodGroup && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Blood Group</p>
//                       <p>{profile.bloodGroup}</p>
//                     </div>
//                   )}
                  
//                   {profile.age && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Age</p>
//                       <p>{profile.age} years</p>
//                     </div>
//                   )}
                  
//                   {profile.weight && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Weight</p>
//                       <p>{profile.weight} kg</p>
//                     </div>
//                   )}
                  
//                   {profile.height && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Height</p>
//                       <p>{profile.height} cm</p>
//                     </div>
//                   )}
                  
//                   {profile.bloodPressure && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Blood Pressure</p>
//                       <p>{profile.bloodPressure}</p>
//                     </div>
//                   )}
                  
//                   {profile.sugarLevel && (
//                     <div>
//                       <p className="font-medium text-sm text-gray-500">Sugar Level</p>
//                       <p>{profile.sugarLevel} mg/dL</p>
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4 text-right">
//                   <Link href="/profile">
//                     <button className="text-blue-600 hover:text-blue-800 font-medium">
//                       View/Edit Complete Profile
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             )}
            
//             {!profile && hasProfile === false && (
//               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mt-4">
//                 <p>Please complete your health profile for better healthcare service.</p>
//                 <Link href="/profile">
//                   <button className="mt-2 text-sm text-blue-600 font-medium hover:text-blue-800">
//                     Complete Profile
//                   </button>
//                 </Link>
//               </div>
//             )}
            
//             {/* Recent Records */}
//             <div className="mt-8">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-medium text-gray-900">Recent Records</h3>
//                 <Link href="/records">
//                   <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
//                     View All Records →
//                   </button>
//                 </Link>
//               </div>
              
//               <div className="bg-white shadow overflow-hidden sm:rounded-md">
//                 {records && records.length > 0 ? (
//                   <RecordList records={records} isLoading={recordsLoading} />
//                 ) : recordsLoading ? (
//                   <div className="px-4 py-5 sm:px-6 text-center">
//                     <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mx-auto mb-2"></div>
//                     <p className="text-sm text-gray-500">Loading records...</p>
//                   </div>
//                 ) : (
//                   <div className="px-4 py-5 sm:px-6 text-center">
//                     <p className="text-sm text-gray-500">No records found</p>
//                     {(user?.role === 'DOCTOR' || user?.role === 'NURSE' || user?.role === 'ADMIN') && (
//                       <Link href="/records/new">
//                         <button className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
//                           Create First Record
//                         </button>
//                       </Link>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }


import React from 'react'

export default function page() {
  return (
    <div>page</div>
  )
}
