"use client";

import { use, useEffect, useState } from "react";

import PatientCheckIn from "@/components/PatientCheckIn";
import SuccessModal from "@/components/SuccessModal";
import { type } from "os";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/context/AuthContext";
import { createVisit, getDoctors, NfcTap } from "@/services/apiService";
import adminService from "@/services/adminService";


export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("register");
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { patient, card_id, sessionToken, updateSessionToken } = useUser();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectDoctor, setSelectDoctor] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredPatientData, setRegisteredPatientData] = useState(null);
  const [cardInputMode, setCardInputMode] = useState("manual"); // "manual" or "nfc"
  const [fetchingPatientData, setFetchingPatientData] = useState(false);
  const [patientDataFound, setPatientDataFound] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [currentSessionToken, setCurrentSessionToken] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    location: "",
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    maritalStatus: "",

    // Address Information
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    country: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",

    // Insurance
    insuranceProvider: "",
    policyNumber: "",

    // Card Information
    cardId: "",

    // Appointment Information
    appointmentDate: "",
    appointmentTime: "",
    doctor: "",
    reason: "",
  });
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Auto-calculate age when date of birth changes
      if (name === "dateOfBirth" && value) {
        const today = new Date();
        const birthDate = new Date(value);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        newData.age = age.toString();
      }

      return newData;
    });
  };

  // Prefill form when patient data is available
  useEffect(() => {
    // console.log("Patient data received:=============================", patient);
    if (patient && patient.profile) {
      const profile = patient.profile;
      setFormData((prev) => ({
        ...prev,
        // Basic Information
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone_number || "",
        dateOfBirth: profile.date_of_birth || "",
        age: profile.age?.toString() || "",
        gender: profile.gender || "",
        location: profile.location || "",
        bloodGroup: profile.blood_group || "",
        heightCm: profile.height_cm?.toString() || "",
        weightKg: profile.weight_kg?.toString() || "",
        maritalStatus: profile.marital_status || "",

        // Address Information
        street: profile.address?.street || "",
        area: profile.address?.area || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        pincode: profile.address?.pincode || "",
        country: profile.address?.country || "",

        // Emergency Contact
        emergencyContactName: profile.emergency_contact?.name || "",
        emergencyContactRelation: profile.emergency_contact?.relation || "",
        emergencyContactPhone: profile.emergency_contact?.phone_number || "",

        // Insurance
        insuranceProvider: profile.insurance?.provider ,
        policyNumber: profile.insurance?.policy_number ,
      }));
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log("Form submission with card ID:", formData.cardId);
      console.log("Full form data:", formData);
    
    const newPatient = {
      id: Date.now().toString(),
      ...formData,
    };
    setPatients((prev) => [...prev, newPatient]);
    // setFormData({
    //   // Basic Information
    //   name: "",
    //   email: "",
    //   phone: "",
    //   dateOfBirth: "",
    //   age: "",
    //   gender: "",
    //   location: "",
    //   bloodGroup: "",
    //   heightCm: "",
    //   weightKg: "",
    //   maritalStatus: "",

    //   // Address Information
    //   street: "",
    //   area: "",
    //   city: "",
    //   state: "",
    //   pincode: "",
    //   country: "",

    //   // Emergency Contact
    //   emergencyContactName: "",
    //   emergencyContactRelation: "",
    //   emergencyContactPhone: "",

    //   // Insurance
    //   insuranceProvider: "",
    //   policyNumber: "",

    //   // Appointment Information
    //   appointmentDate: "",
    //   appointmentTime: "",
    //   doctor: "",
    //   reason: "",
    // });
    
      // Determine which patient ID to use - from card lookup or from UserContext
      let patientId = selectedPatientId || patient?.id;
      
      // Ensure patient ID is an integer
      if (patientId) {
        patientId = parseInt(patientId, 10);
      }      // Get session token - prefer UserContext sessionToken over localStorage or currentSessionToken
      const sessionTokenToUse = sessionToken || currentSessionToken || localStorage.getItem("session_token");
      
      // Get selected doctor ID from form and convert to integer (using doctor.id which is the user ID)
      const selectedDoctorId = parseInt(formData.doctor, 10);
    
      // Validate required fields
      if (!patientId || isNaN(patientId)) {
        console.error("Patient information is required. Please scan a card or ensure patient data is loaded.");
        return;
      }      if (!selectedDoctorId || isNaN(selectedDoctorId)) {
        console.error("Please select a valid doctor for the visit.");
        return;
      }      if (!sessionTokenToUse) {
        console.error("Session token is required. Please ensure NFC session is active.");
        return;
      }
      
      console.log("Form Data to be sent:", {
        patient: patientId,
        attending_doctor: selectedDoctorId,
        visit_type: formData.reason,
        reason_for_visit: formData.reason,
        session_token: sessionTokenToUse
      });
      
      const res = await createVisit({
        patient: patientId,
        attending_doctor: selectedDoctorId,
        visit_type: formData.reason,
        reason_for_visit: formData.reason,
        session_token: sessionTokenToUse
      })
      
      if(res){
      console.log("Patient registered successfully!");
      window.location.href = "/admin/dashboard";
    }
  } catch (error) {
    console.error("Error creating visit:", error);
    if (error.response?.data?.message) {
      const errorMsg = typeof error.response.data.message === 'object' 
        ? JSON.stringify(error.response.data.message, null, 2)
        : error.response.data.message;
      console.error(`Error creating visit: ${errorMsg}`);
    } else {
      console.error("Error creating visit. Please check all required fields and try again.");
    }
  }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)
  );

  useEffect(() => {
    // Simulate fetching doctors from an API
    const fetchDoctors = async () => {
      try {
        const res = await getDoctors();
        console.log("Fetched doctors====:", res.data);
        setDoctors(res.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);
  
  const selectedDoctor = doctors?.find((doc) => doc.id.toString() === formData.doctor);

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (authLoading) {
      console.log('Patient Registration - AuthContext still loading...');
      return;
    }
    
    // Check authentication using AuthContext
    if (!isAuthenticated && !user) {
      console.warn('User not authenticated, redirecting to login');
      // Add a small delay to prevent immediate redirect loop
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
      return;
    }
    
    console.log('Patient Registration - User authenticated:', user);
  }, [authLoading, isAuthenticated, user]);

  // Sync NFC scanned card ID with form data and auto-fetch patient info
  useEffect(() => {
    if (card_id && cardInputMode === "nfc") {
      console.log('NFC card scanned, updating form data and fetching patient info:', card_id);
      setFormData(prev => ({
        ...prev,
        cardId: card_id
      }));
      
      // Auto-fetch patient data when NFC scan is successful
      fetchPatientDataByCardId(card_id);
    }
  }, [card_id, cardInputMode]);

  // Function to fetch patient data by card ID and auto-fill form
  const fetchPatientDataByCardId = async (cardId) => {
    if (!cardId.trim()) return;
    
    try {
      setFetchingPatientData(true);
      setPatientDataFound(false);
      
      console.log('Fetching patient data for card ID:', cardId);
      
      // First, perform NFC tap to get session token and patient data
      const tapResponse = await NfcTap(cardId);
      console.log("Tap response:", tapResponse);
      
      if (tapResponse?.data?.session?.session_token) {
        // Store session token in context and localStorage
        const sessionTokenFromTap = tapResponse.data.session.session_token;
        updateSessionToken(sessionTokenFromTap);
        localStorage.setItem("session_token", sessionTokenFromTap);
        setCurrentSessionToken(sessionTokenFromTap);
        setSessionActive(true);
        
        // Store patient data from tap response
        const patientFromTap = tapResponse.data.session.patient;
        if (patientFromTap) {
          setSelectedPatientId(patientFromTap.id);
        }
        
        console.log("Session token and patient data from NFC tap:", {
          sessionToken: sessionTokenFromTap,
          patientId: patientFromTap?.id
        });
      }
      
      // Now get detailed patient information from NFC card details
      const cardDetails = await adminService.getNfcCardDetails(cardId);
      console.log('Card details received:', cardDetails);
      
      if (cardDetails && cardDetails.patient_profile) {
        // Auto-fill form with patient data
        const patientData = cardDetails.patient_profile;
        
        // If we didn't get patient ID from tap response, get it from card details
        if (!selectedPatientId) {
          setSelectedPatientId(cardDetails.patient || patientData.id);
        }
        setFormData(prev => ({
          ...prev,
          cardId: cardId,
          name: patientData.name || patientData.profile?.name || "",
          email: patientData.email || patientData.profile?.email || "",
          phone: patientData.phone_number || patientData.profile?.phone_number || "",
          dateOfBirth: patientData.date_of_birth || patientData.profile?.date_of_birth || "",
          age: patientData.age || patientData.profile?.age || "",
          gender: patientData.gender || patientData.profile?.gender || "",
          bloodGroup: patientData.blood_group || patientData.profile?.blood_group || "",
          heightCm: patientData.height_cm || patientData.profile?.height_cm || "",
          weightKg: patientData.weight_kg || patientData.profile?.weight_kg || "",
          maritalStatus: patientData.marital_status || patientData.profile?.marital_status || "",
          // Address information if available
          street: patientData.address?.street || patientData.profile?.address?.street || "",
          area: patientData.address?.area || patientData.profile?.address?.area || "",
          city: patientData.address?.city || patientData.profile?.address?.city || "",
          state: patientData.address?.state || patientData.profile?.address?.state || "",
          pincode: patientData.address?.pincode || patientData.profile?.address?.pincode || "",
          country: patientData.address?.country || patientData.profile?.address?.country || "",
          // Emergency contact if available
          emergencyContactName: patientData.emergency_contact?.name || patientData.profile?.emergency_contact?.name || "",
          emergencyContactRelation: patientData.emergency_contact?.relation || patientData.profile?.emergency_contact?.relation || "",
          emergencyContactPhone: patientData.emergency_contact?.phone || patientData.profile?.emergency_contact?.phone || "",
          // Insurance if available
          insuranceProvider: patientData.insurance?.provider || patientData.profile?.insurance?.provider || "",
          policyNumber: patientData.insurance?.policy_number || patientData.profile?.insurance?.policy_number || ""
        }));
        
        setPatientDataFound(true);
        console.log('Patient data auto-filled successfully');
      } else {
        console.warn('No patient data found for card ID:', cardId);
        console.log('No patient data found for this card ID. Please verify the card ID or register as a new patient.');
      }
      
    } catch (error) {
      console.error('Error fetching patient data:', error);
      console.log('Error fetching patient data. Please check the card ID and try again.');
    } finally {
      setFetchingPatientData(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-semibold">MediCare Hospital</span>
              </div>
              {/* <nav className="flex space-x-6">
                <button
                  onClick={() => setActiveTab("register")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "register" ? "bg-orange-500 text-white" : "hover:bg-teal-700"
                  }`}
                >
                  Patient Registration
                </button>
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "schedule" ? "bg-orange-500 text-white" : "hover:bg-teal-700"
                  }`}
                >
                  Schedule Management
                </button>
                <button
                  onClick={() => setActiveTab("patients")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    activeTab === "patients" ? "bg-orange-500 text-white" : "hover:bg-teal-700"
                  }`}
                >
                  Patient Records
                </button>
              </nav> */}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Reception Desk</span>
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">R</span>
              </div>
              <button className="text-sm hover:text-teal-200">Logout</button>
            </div>
          </div>
        </div>
      </header>

      {/* <div className="flex"> */}
      {/* Sidebar */}

      <main className=" flex  justify-center p-6  bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="flex flex-col space-y-8 w-2/3 bg-white p-6 rounded-lg border border-blue-200 shadow-lg">
          <div className="max-w-6xl">
            {/* <div className="bg-white rounded-lg shadow-lg p-6"> */}
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Patient Registration
              {formData.age && (
                <span className="ml-4 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  ✓ Form prefilled with patient data
                </span>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="patient@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="29"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option key="gender-default" value="">Select Gender</option>
                      <option key="male" value="Male">Male</option>
                      <option key="female" value="Female">Female</option>
                      <option key="other" value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Mumbai, Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option key="blood-default" value="">Select Blood Group</option>
                      <option key="a-positive" value="A+">A+</option>
                      <option key="a-negative" value="A-">A-</option>
                      <option key="b-positive" value="B+">B+</option>
                      <option key="b-negative" value="B-">B-</option>
                      <option key="ab-positive" value="AB+">AB+</option>
                      <option key="ab-negative" value="AB-">AB-</option>
                      <option key="o-positive" value="O+">O+</option>
                      <option key="o-negative" value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      name="heightCm"
                      value={formData.heightCm}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="172"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weightKg"
                      value={formData.weightKg}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="68"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option key="marital-default" value="">Select Marital Status</option>
                      <option key="single" value="Single">Single</option>
                      <option key="married" value="Married">Married</option>
                      <option key="divorced" value="Divorced">Divorced</option>
                      <option key="widowed" value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="B-201, Sagar Heights"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area
                    </label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Andheri East"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Mumbai"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="400069"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Rajesh Shahare"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relation
                    </label>
                    <input
                      type="text"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Father"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="9823123456"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Information Section */}
                      <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Insurance Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Insurance Provider
                        </label>
                        <input
                          type="text"
                          name="insuranceProvider"
                          value={formData.insuranceProvider}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Star Health Insurance"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Policy Number
                        </label>
                        <input
                          type="text"
                          name="policyNumber"
                          value={formData.policyNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="STH12345678"
                        />
                        </div>
                      </div>
                      </div>

                      <div className="pt-12">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Appointment Scheduling
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Doctor *
                        </label>
                        <select
                          name="doctor"
                      value={formData.doctor}
                      onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option key="doctor-default" value="">Choose a doctor</option>
                          {doctors.map((doctor) => (
                          <option key={doctor.profile.id} value={doctor.id}>
                            {doctor.profile.name} 
                          </option>
                          ))}
                        </select>
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Appointment Date *
                        </label>
                        <input
                          type="date"
                          name="appointmentDate"
                          value={formData.appointmentDate}
                          onChange={handleInputChange}
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visit Type *
                        </label>
                        <select
                          name="reason"
                          value={formData.reason}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        >
                          <option key="default" value="">Select visit type</option>
                          <option key="emergency" value="emergency">Emergency</option>
                          <option key="outpatient" value="outpatient">Outpatient</option>
                          <option key="inpatient" value="inpatient">Inpatient</option>
                          <option key="followup" value="followup">Follow-up</option>
                          <option key="routine_checkup" value="routine_checkup">Routine Checkup</option>
                          <option key="specialist_consultation" value="specialist_consultation">Specialist Consultation</option>
                        </select>
                        </div>
                        </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6">
                        <button
                          type="button"
                          onClick={() =>
                          setFormData({
                      // Basic Information
                      name: "",
                      email: "",
                      phone: "",
                      dateOfBirth: "",
                      age: "",
                      gender: "",
                      location: "",
                      bloodGroup: "",
                      heightCm: "",
                      weightKg: "",
                      maritalStatus: "",

                      // Address Information
                      street: "",
                      area: "",
                      city: "",
                      state: "",
                      pincode: "",
                      country: "",

                      // Emergency Contact
                      emergencyContactName: "",
                      emergencyContactRelation: "",
                      emergencyContactPhone: "",

                      // Insurance
                      insuranceProvider: "",
                      policyNumber: "",

                      // Appointment Information
                      appointmentDate: "",
                      appointmentTime: "",
                      doctor: "",
                      reason: "",
                    })
                  }
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Register Patient
                </button>
              </div>
            </form>
            {/* </div> */}
          </div>
        </div>
        {/* )} */}
        <div className="flex flex-col space-y-8 p-6">
          {/* Card ID Input and NFC Scanner Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Patient Card ID & NFC Scanner
            </h3>
            
            {/* Card Input Mode Toggle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Card ID Input Method
              </label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setCardInputMode("manual")}
                  className={`px-4 py-2 rounded-md border ${
                    cardInputMode === "manual"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Manual Input
                </button>
                <button
                  type="button"
                  onClick={() => setCardInputMode("nfc")}
                  className={`px-4 py-2 rounded-md border ${
                    cardInputMode === "nfc"
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  NFC Scan
                </button>
              </div>
            </div>

            {/* Manual Card ID Input */}
            {cardInputMode === "manual" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Card ID
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={formData.cardId}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardId: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter patient card ID"
                  />
                                    <button
                    type="button"
                    onClick={() => fetchPatientDataByCardId(formData.cardId)}
                    disabled={!formData.cardId.trim() || fetchingPatientData}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {fetchingPatientData ? 'Fetching...' : 'Fetch Patient Data'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enter the patient's card ID to auto-fill patient information
                </p>
                {patientDataFound && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm text-green-600 font-medium">
                        Patient data loaded and form auto-filled successfully!
                      </p>
                    </div>
                  </div>
                )}
                {(sessionActive || sessionToken) && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 text-blue-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-blue-600 font-medium">
                        NFC Session Active - Ready to create visit
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* NFC Scanner Section */}
            {cardInputMode === "nfc" && (
              <div className="mb-6">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
                  card_id && formData.cardId 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}>
                  <div className="flex flex-col items-center">
                    {card_id && formData.cardId ? (
                      <>
                        <svg
                          className="w-12 h-12 text-green-500 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-sm text-green-600 mb-2 font-medium">
                          Card ID Detected: {formData.cardId}
                        </p>
                        <p className="text-xs text-green-500 mb-3">
                          Patient card successfully scanned and data auto-filled
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, cardId: "" }));
                          }}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                        >
                          Clear Card ID
                        </button>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm text-gray-600 mb-2">
                          Use the NFC scanner below to read patient card
                        </p>
                        <p className="text-xs text-gray-500">
                          Patient data will be auto-filled when card is scanned
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                {/* NFC Scanner Component */}
                <PatientCheckIn />
              </div>
            )}
          </div>

          <div className=" bg-white rounded-lg shadow-lg p-6">
            {/* <div className="bg-white rounded-lg shadow-lg p-6"> */}
            {/* <h2 className="text-2xl font-bold text-gray-800 mb-6">Doctor Schedule Management</h2> */}

            <div className="=flex items-center justify-between space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {doctor.profile.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {doctor.profile.gender}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-medium">
                        {doctor.profile.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  </div>

                  {/* <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Available Time Slots
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {doctor.availableSlots.map((slot) => (
                        <div
                          key={slot}
                          className="px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md text-center"
                        >
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div> */}

                  {/* <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Today's Appointments
                    </h4>
                    <div className="space-y-2">
                      {patients
                        .filter(
                          (p) =>
                            p.doctor === doctor.id.toString() &&
                            p.appointmentDate ===
                              new Date().toISOString().split("T")[0]
                        )
                        .map((patient) => (
                          <div
                            key={patient.id}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded"
                          >
                            <span className="text-sm font-medium">
                              {patient.name}
                            </span>
                            <span className="text-sm text-blue-600">
                              {patient.appointmentTime}
                            </span>
                          </div>
                        ))}
                      {patients.filter(
                        (p) =>
                          p.doctor === doctor.id.toString() &&
                          p.appointmentDate ===
                            new Date().toISOString().split("T")[0]
                      ).length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No appointments today
                        </p>
                      )}
                    </div>
                  </div> */}
                </div>
              ))}
            </div>
            {/* </div> */}
          </div>
        </div>
      </main>

      {/* </aside> */}

      {/* Main Content */}

      {/* </div> */}
    </div>
  );
}
