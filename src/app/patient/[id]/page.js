"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRecords } from '@/context/RecordContext';
import MainLayout from '@/components/MainLayout';

// React Icons
import { FiUser, FiChevronDown, FiSearch } from 'react-icons/fi';
import { MdExpandLess, MdAdd, MdOutlineLocalActivity } from 'react-icons/md';
import { 
  HiOutlineDocumentText, 
  HiOutlineDocumentDuplicate, 
  HiOutlineMail
} from 'react-icons/hi';
import { 
  BsFileText, 
  BsThermometer, 
  BsChatSquare, 
  BsArrowLeft
} from 'react-icons/bs';
import { RiMedicineBottleLine } from 'react-icons/ri';
import { IoDocumentTextOutline, IoPrintOutline } from 'react-icons/io5';
import { TbReportMedical, TbSend } from 'react-icons/tb';
import { FaRegEnvelope, FaRegFileImage, FaCog } from 'react-icons/fa';
import { GrDocumentText } from 'react-icons/gr';
import { CgMoreO } from 'react-icons/cg';
import { BiPlus } from 'react-icons/bi';

export default function PatientDashboard({ params }) {
  const id = React.use(params).id;
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { fetchRecordsByPatientId, patientRecords, loading: recordsLoading } = useRecords();
  
  const [activeTab, setActiveTab] = useState('Visit Note');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecord, setExpandedRecord] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
    
    if (isAuthenticated && user && (user.role !== 'DOCTOR' && user.role !== 'ADMIN' && user.role !== 'NURSE')) {
      router.push('/dashboard');
    }
    
    if (isAuthenticated && id) {
      fetchRecordsByPatientId(id);
    }
  }, [authLoading, isAuthenticated, id, router, user, fetchRecordsByPatientId]);

  const patientData = {
    name: "Jane White",
    dob: "10/02/1989",
    age: 35,
    months: 4,
    gender: "Woman",
    phone: "222-222-2222",
    phoneType: "Cell Phone",
    insurance: "Cigna",
    todayAppointment: "8:00 am",
    lastVisit: "Wed, May 15, 2024 at 8:48 am",
    allergies: ["Ciprofloxacin = Hives"],
    drugIntolerances: ["Armodafinil = Hives"],
    problemList: [
      {
        year: 2023,
        condition: "Urinary tract infection without hematuria, site unspecified",
        code: "N39.0"
      },
      {
        year: 2020,
        condition: "High cholesterol",
        code: "E78.00"
      },
      {
        year: 2018,
        condition: "Vitamin D deficiency",
        code: "E55.9",
        note: "03/27/2018: 30 day dosage provided"
      },
      {
        year: 2023,
        condition: "Bunion",
        code: "M25.476",
        status: "resolved",
        resolvedDate: "06/14/2023"
      },
      {
        year: 2022,
        condition: "Abdominal pain",
        code: "R10.9",
        status: "resolved",
        resolvedDate: "11/10/2022"
      }
    ],
    chronologicalRecord: [
      {
        date: "Apr 30",
        year: "2024",
        type: "Consult",
        title: "Consult",
        reviewedDate: "02/18/2025",
        reviewedTime: "8:58 am"
      },
      {
        date: "Jul 3",
        year: "2023",
        type: "Office Visit",
        title: "Office Visit Note 07/03/2023 Mon 11:00 am",
        reason: "Established Patient – UTI symptoms",
        assessment: "Urinary Tract Infection [N39.0]",
        plan: [
          "Start antibiotic therapy as prescribed.",
          "Increase fluid intake.",
          "Return if symptoms worsen or persist beyond 72 hours."
        ],
        orders: [
          "Urinalysis with culture if indicated",
          "Prescription sent to patient's pharmacy"
        ]
      },
      {
        date: "Jul 3",
        year: "2023",
        type: "PHQ",
        title: "PHQ-2 & PHQ-9",
        reviewedDate: "07/03/2023",
        reviewedTime: "10:33 am"
      },
      {
        date: "Jun 28",
        year: "2023",
        type: "Consult",
        title: "Consult",
        reviewedDate: "06/30/2023",
        reviewedTime: "7:58 am"
      }
    ]
  };

  const tabs = [
    { name: 'Visit Note', icon: BsFileText },
    { name: 'Notes', icon: HiOutlineDocumentText },
    { name: 'Msg', icon: BsChatSquare },
    { name: 'Rx', icon: RiMedicineBottleLine },
    { name: 'Orders', icon: IoDocumentTextOutline },
    { name: 'Meds Hx', icon: BsThermometer },
    { name: 'Reports', icon: TbReportMedical },
    { name: 'Referral', icon: TbSend },
    { name: 'Letter', icon: FaRegEnvelope },
    { name: 'Forms', icon: FaRegFileImage },
    { name: 'Templates', icon: GrDocumentText },
    { name: 'More', icon: CgMoreO }
  ];

  const getRecordIcon = (type) => {
    switch (type) {
      case 'Consult':
        return <MdOutlineLocalActivity className="w-4 h-4 text-green-600" />;
      case 'Office Visit':
        return <BsFileText className="w-4 h-4 text-blue-600" />;
      case 'PHQ':
        return <MdOutlineLocalActivity className="w-4 h-4 text-green-600" />;
      default:
        return <BsFileText className="w-4 h-4 text-gray-600" />;
    }
  };

  if (authLoading || recordsLoading) {
    return (
      <MainLayout title="Patient Dashboard">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      {/* Main Content Container */}
      <div className="flex flex-col h-screen">
        {/* Top Navigation Bar with Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-center px-4 py-2">
            {/* Patient Info */}
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <FiUser className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h1 className="text-lg font-medium">{patientData.name}</h1>
                <p className="text-sm text-gray-500">
                  {patientData.dob} ({patientData.age} yrs, {patientData.months} mo)
                </p>
                <p className="text-sm text-gray-500">{patientData.gender}</p>
              </div>
              <div className="ml-6 flex space-x-2">
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  1 ALLERGY
                </span>
                <span className="bg-orange-400 text-white px-2 py-1 rounded text-xs font-semibold">
                  RISK 0.40
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.name}
                  className={`flex flex-col items-center px-4 py-3 text-xs min-w-[80px] border-r border-gray-200
                    ${activeTab === tab.name ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab(tab.name)}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-grow overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            {/* Patient Details */}
            <div className="p-4 space-y-2 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <FiUser className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{patientData.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">♀</span>
                <span className="text-sm">Female</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-blue-600">{patientData.phone}</span>
                <span className="text-xs text-gray-500">({patientData.phoneType})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{patientData.insurance}</span>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-blue-600 font-medium">Today's Appointment: {patientData.todayAppointment}</p>
              <p className="text-sm text-gray-600">Last Visit: {patientData.lastVisit}</p>
              <div className="flex space-x-2 mt-2">
                <button className="text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded">Print/Fax</button>
                <button className="text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded">Collapse</button>
                <button className="text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded">Outside Care</button>
              </div>
            </div>

            {/* Allergies */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">▼ Allergies</h3>
                <button className="text-xs text-gray-500 flex items-center">
                  <FaCog className="w-3 h-3 mr-1" />
                  Actions ▼
                </button>
              </div>
              <div className="mt-2">
                {patientData.allergies.map((allergy, index) => (
                  <p key={index} className="text-sm text-gray-700">{allergy}</p>
                ))}
                <button className="text-xs text-blue-600 mt-2 flex items-center">
                  <BiPlus className="w-3 h-3 mr-1" />
                  Add Allergy
                </button>
              </div>
            </div>

            {/* Drug Intolerances */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">▼ Drug Intolerances</h3>
                <button className="text-xs text-gray-500 flex items-center">
                  <FaCog className="w-3 h-3 mr-1" />
                  Actions ▼
                </button>
              </div>
              <div className="mt-2">
                {patientData.drugIntolerances.map((intolerance, index) => (
                  <p key={index} className="text-sm text-gray-700">{intolerance}</p>
                ))}
                <button className="text-xs text-blue-600 mt-2 flex items-center">
                  <BiPlus className="w-3 h-3 mr-1" />
                  Add Drug Intolerance
                </button>
              </div>
            </div>

            {/* Problem List */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">▼ Problem List</h3>
                <button className="text-xs text-gray-500 flex items-center">
                  <FaCog className="w-3 h-3 mr-1" />
                  Actions ▼
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {patientData.problemList.map((problem, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-gray-600 font-medium">{problem.year}</span>
                      <div className="flex-1">
                        <span className={`${problem.status === 'resolved' ? 'line-through text-gray-500' : 'text-blue-600'}`}>
                          {problem.condition}
                        </span>
                        <span className="text-gray-500 ml-1">[{problem.code}]</span>
                        {problem.status === 'resolved' && (
                          <span className="text-gray-500 text-xs ml-2">-- resolved on {problem.resolvedDate}</span>
                        )}
                        {problem.note && (
                          <div className="text-gray-500 text-xs italic mt-1">{problem.note}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Timeline Chart */}
            <div className="p-4 border-b border-gray-200">
              <div className="bg-yellow-50 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Timeline Chart</span>
                  <button className="text-blue-600 text-sm flex items-center">
                    <BsArrowLeft className="mr-1" /> Back to Top
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Today</span>
                  <span>07/2022</span>
                  <span>12/2019</span>
                  <span>05/2017</span>
                  <span>11/2014</span>
                  <span>04/2012</span>
                </div>
                <div className="w-full h-2 bg-yellow-200 rounded mt-2"></div>
              </div>
            </div>

            {/* Chronological Record */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Chronological Record</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Ordering By: 
                    <span className="text-blue-600 ml-1">Patient Event Dates ▼</span>
                  </span>
                  <button className="text-blue-600 text-sm">Refresh</button>
                </div>
              </div>

              <div className="space-y-4">
                {patientData.chronologicalRecord.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{record.date}</div>
                          <div className="text-xs text-gray-500">{record.year}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRecordIcon(record.type)}
                          <div>
                            <h3 className="text-sm font-medium text-blue-600">{record.title}</h3>
                            {record.reason && (
                              <p className="text-xs text-gray-600">CC/Reason: {record.reason}</p>
                            )}
                            {record.reviewedDate && (
                              <p className="text-xs text-gray-500">Reviewed {record.reviewedDate} {record.reviewedTime}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {record.assessment && (
                          <button
                            onClick={() => setExpandedRecord(expandedRecord === index ? null : index)}
                            className="text-blue-600 text-sm"
                          >
                            {expandedRecord === index ? "Collapse" : "Expand"}
                          </button>
                        )}
                        <button className="text-gray-400">
                          <span className="text-sm">Actions ▼</span>
                        </button>
                      </div>
                    </div>
                    
                    {expandedRecord === index && record.assessment && (
                      <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                        <div className="mt-4 space-y-3">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">Assessment:</h4>
                            <p className="text-sm text-gray-700 ml-4">{record.assessment}</p>
                          </div>
                          
                          {record.plan && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">Plan:</h4>
                              <ul className="text-sm text-gray-700 ml-4 space-y-1">
                                {record.plan.map((item, planIndex) => (
                                  <li key={planIndex}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {record.orders && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">Orders:</h4>
                              <ul className="text-sm text-gray-700 ml-4 space-y-1">
                                {record.orders.map((order, orderIndex) => (
                                  <li key={orderIndex}>› {order}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Scribe Button */}
      <button className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <span className="text-sm">🎤 Scribe</span>
      </button>
    </div>
  );
}