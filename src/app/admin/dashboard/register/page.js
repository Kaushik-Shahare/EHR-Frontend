"use client";

import { use, useEffect, useState } from "react";

import PatientCheckIn from "@/components/PatientCheckIn";
import SuccessModal from "@/components/SuccessModal";
import { type } from "os";
import { useUser } from "@/context/UserContext";
import { createVisit, getDoctors } from "@/services/apiService";


export default function HospitalDashboard() {
  const [activeTab, setActiveTab] = useState("register");
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { patient } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredPatientData, setRegisteredPatientData] = useState(null);
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
        insuranceProvider: profile.insurance?.provider || "",
        policyNumber: profile.insurance?.policy_number || "",
      }));
    }
  }, [patient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPatient = {
      id: Date.now().toString(),
      ...formData,
    };
    setPatients((prev) => [...prev, newPatient]);
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
    });
    const token = localStorage.getItem("session_token");
    if(token ){
      console.log("Token found:", token);
    }
    const res = createVisit({
      patient: patient.id,
      attending_doctor: formData.doctor.id,
      visit_type: formData.reason,
      reason_for_visit: formData.reason,
      session_token: token
    })
    
    if(res){

      alert("Patient registered successfully!");
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
  const selectedDoctor = doctors?.find((doc) => doc.id === parseInt(formData.doctor));

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if the user is logged in
      const token = localStorage.getItem("accesstoken");
      if (!token) {
        // Redirect to login page if not logged in
        window.location.href = "/login";
      }
    }
  }, []);

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
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
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
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
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
                      <option value="">Select Marital Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
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
                      <option value="">Choose a doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.profile.id} value={doctor.profile.id}>
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
                      <option value="">Select visit type</option>
                      <option value="emergency">Emergency</option>
                      <option value="outpatient">Outpatient</option>
                      <option value="inpatient">Inpatient</option>
                      <option value="followup">Follow-up</option>
                      <option value="routine_checkup">Routine Checkup</option>
                      <option value="specialist_consultation">Specialist Consultation</option>
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
        <div className="flex flex-col space-y-8  p-6 ">
          <PatientCheckIn />

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
