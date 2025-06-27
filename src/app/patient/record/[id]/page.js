"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../../components/MainLayout";
import ehrService from "../../../../services/ehrService";
import nfcService from "../../../../services/nfcService";

// Helper function for formatting dates consistently
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date)
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : dateString;
};

export default function PatientRecordDetail({ params }) {
  const router = useRouter();
  const visitId = use(params).id;

  const [visitData, setVisitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);

  // Fetch the visit data using the visitId
  const fetchVisitData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Since we don't know the patientId from this screen initially, we'll try to get the
      // session token from localStorage by iterating through stored tokens
      const storedTokens = JSON.parse(
        localStorage.getItem("sessionTokens") || "{}"
      );
      let token = null;

      // Use the first valid session token we find
      for (const patientId in storedTokens) {
        const sessionData = storedTokens[patientId];
        if (sessionData && sessionData.token) {
          token = sessionData.token;
          setSessionToken(token);
          break;
        }
      }

      if (!token) {
        throw new Error(
          "No valid session token found. Please return to the patient page and try again."
        );
      }

      const response = await ehrService.getPatientVisitById(token, visitId);
      console.log("Visit data fetched:", response.data);
      setVisitData(response.data);
    } catch (error) {
      console.error("Error fetching visit data:", error);
      setError(error.message || "Failed to fetch visit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitData();
  }, [visitId]);

  // Function to go back to the previous page
  const handleBackClick = () => {
    router.back();
  };

  return (
    <MainLayout title={`Visit Details ${visitId}`}>
      <div className="min-h-screen bg-gray-100">
        <div className="px-4 py-6 md:px-6 lg:px-8 max-w-8xl mx-auto">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className="mb-6 flex items-center text-gray-700 hover:text-doctorTeal transition-colors font-medium"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Patient
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-doctorTeal mb-4"></div>
                <p className="text-gray-600 font-medium">Loading visit details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-200">
              <div className="bg-red-50 px-6 py-4 border-b border-red-100">
                <h2 className="text-lg font-bold text-red-700 flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Error Loading Visit Data
                </h2>
              </div>
              <div className="p-6">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={() => fetchVisitData()}
                  className="mt-4 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          ) : visitData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Visit Details */}
              <div className="lg:col-span-3 space-y-6">
                {/* Visit header info */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow sticky top-6">
                  <div className="bg-blue-500 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-xl font-bold text-white">
                        Visit Info
                      </h1>
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full ${
                          visitData.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : visitData.status === "checked_in"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {visitData.status
                          ?.split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ") || "Unknown Status"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Patient Information</h3>
                      <p className="flex items-center text-gray-800 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-doctorTeal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium text-sm">Patient: </span>
                        <span className="ml-1 text-sm">{visitData.patient?.profile?.name || "Unknown"}</span>
                      </p>
                      <p className="flex items-center text-gray-800 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-sm">Doctor: </span>
                        <span className="ml-1 text-sm">{visitData.attending_doctor?.profile?.name || "Unknown"}</span>
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Visit Type</h3>
                      <p className="flex items-center text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <span className="text-sm">{visitData.visit_type
                          ?.replace(/_/g, " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ") || "Unknown"}</span>
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Reason for Visit</h3>
                      <p className="text-sm text-gray-800 pl-6">
                        {visitData.reason_for_visit || "Not specified"}
                      </p>
                    </div>
                    
                    <div className="border-b border-gray-100 pb-3">
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">Visit Timeline</h3>
                      <p className="flex items-center text-gray-800 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium text-sm">Check-in: </span>
                        <span className="ml-1 text-sm">{formatDate(visitData.check_in_time)}</span>
                      </p>
                      <p className="flex items-center text-gray-800 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-sm">Check-out: </span>
                        <span className="ml-1 text-sm">{visitData.check_out_time
                          ? formatDate(visitData.check_out_time)
                          : "Not checked out"}</span>
                      </p>
                      <p className="flex items-center text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-sm">Duration: </span>
                        <span className="ml-1 text-sm">{visitData.duration ||
                          (visitData.check_out_time
                            ? `${Math.round(
                                (new Date(visitData.check_out_time) -
                                  new Date(visitData.check_in_time)) /
                                  (1000 * 60)
                              )} minutes`
                            : "In progress")}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6 space-y-6">
              {/* Diagnoses */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r bg-blue-500 from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">Diagnoses</h2>
                </div>
                <div className="p-4">
                  {visitData.diagnoses && visitData.diagnoses.length > 0 ? (
                    <div className="space-y-4">
                      {visitData.diagnoses.map((diagnosis, idx) => (
                        <div
                          key={diagnosis.id}
                          className={
                            idx !== visitData.diagnoses.length - 1
                              ? "pb-3 border-b border-gray-200"
                              : ""
                          }
                        >
                          <h3 className="font-medium text-gray-900">
                            {diagnosis.condition_name}
                          </h3>
                          <p className="text-sm">
                            <span className="text-gray-600">Severity: </span>
                            <span className="capitalize">
                              {diagnosis.severity || "Not specified"}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Status: </span>
                            <span className="capitalize">
                              {diagnosis.status || "Not specified"}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-600">Date: </span>
                            {diagnosis.diagnosis_date || "Not specified"}
                          </p>
                          {diagnosis.notes && (
                            <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                              {diagnosis.notes}
                            </p>
                          )}
                          {diagnosis.treatment_plan && (
                            <div className="mt-1">
                              <span className="text-sm text-gray-600">
                                Treatment Plan:{" "}
                              </span>
                              <p className="text-sm bg-gray-50 p-2 rounded">
                                {diagnosis.treatment_plan}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No diagnoses recorded for this visit
                    </p>
                  )}
                </div>
              </div>

              {/* Vitals */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r bg-blue-500 from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h2 className="text-lg font-bold text-black">Vital Signs</h2>
                </div>
                <div className="p-4">
                  {visitData.vitals && visitData.vitals.length > 0 ? (
                    <div className="space-y-4">
                      {visitData.vitals.map((vital, idx) => (
                        <div key={vital.id}>
                          <p className="text-gray-700 mb-2">
                            Recorded at: {formatDate(vital.recorded_at)}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {vital.temperature && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Temperature
                                </span>
                                <span className="font-medium">
                                  {vital.temperature} °
                                  {vital.temperature_unit === "celsius"
                                    ? "C"
                                    : "F"}
                                </span>
                              </div>
                            )}

                            {(vital.blood_pressure_systolic ||
                              vital.blood_pressure_diastolic) && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Blood Pressure
                                </span>
                                <span className="font-medium">
                                  {vital.blood_pressure_systolic || "?"}/
                                  {vital.blood_pressure_diastolic || "?"} mmHg
                                </span>
                              </div>
                            )}

                            {vital.heart_rate && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Heart Rate
                                </span>
                                <span className="font-medium">
                                  {vital.heart_rate} bpm
                                </span>
                              </div>
                            )}

                            {vital.respiratory_rate && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Respiratory Rate
                                </span>
                                <span className="font-medium">
                                  {vital.respiratory_rate} breaths/min
                                </span>
                              </div>
                            )}

                            {vital.oxygen_saturation && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  O₂ Saturation
                                </span>
                                <span className="font-medium">
                                  {vital.oxygen_saturation}%
                                </span>
                              </div>
                            )}

                            {vital.height && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Height
                                </span>
                                <span className="font-medium">
                                  {vital.height} {vital.height_unit}
                                </span>
                              </div>
                            )}

                            {vital.weight && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  Weight
                                </span>
                                <span className="font-medium">
                                  {vital.weight} {vital.weight_unit}
                                </span>
                              </div>
                            )}

                            {vital.bmi && (
                              <div className="bg-gray-50 p-2 rounded">
                                <span className="text-xs text-gray-500 block">
                                  BMI
                                </span>
                                <span className="font-medium">{vital.bmi}</span>
                              </div>
                            )}
                          </div>

                          {vital.notes && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 block">
                                Notes
                              </span>
                              <p className="text-sm">{vital.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No vital signs recorded for this visit
                    </p>
                  )}
                </div>
              </div>

              {/* Prescriptions */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r bg-blue-500 from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h2 className="text-lg font-bold text-black">
                    Prescriptions
                  </h2>
                </div>
                <div className="p-4">
                  {visitData.prescriptions &&
                  visitData.prescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Medication
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dosage
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Frequency
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Instructions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visitData.prescriptions.map((prescription) => (
                            <tr key={prescription.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {prescription.medication_name}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {prescription.dosage}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {prescription.frequency}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {prescription.duration}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                {prescription.start_date}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-700">
                                {prescription.instructions || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No prescriptions recorded for this visit
                    </p>
                  )}
                </div>
              </div>

              {/* Charges */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r bg-blue-500 from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h2 className="text-lg font-bold text-black">Charges</h2>
                </div>
                <div className="p-4">
                  {visitData.charges && visitData.charges.length > 0 ? (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Added
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Insurance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {visitData.charges.map((charge) => (
                              <tr key={charge.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {charge.description}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 capitalize">
                                  {charge.charge_type?.replace(/_/g, " ") ||
                                    "-"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                  ${charge.amount}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {formatDate(charge.date_added).split(",")[0]}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {charge.insurance_covered
                                    ? "Covered"
                                    : "Not covered"}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td
                                className="px-3 py-2 text-sm font-medium text-gray-900"
                                colSpan="2"
                              >
                                Total
                              </td>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                ${visitData.total_amount}
                              </td>
                              <td
                                className="px-3 py-2 text-sm text-gray-700"
                                colSpan="2"
                              >
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    visitData.payment_status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {visitData.payment_status}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-4 text-sm text-gray-700">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span>Total Amount:</span>
                          <span className="font-medium">
                            ${visitData.total_amount}
                          </span>
                        </div>
                        <div className="flex justify-between p-2">
                          <span>Insurance Coverage:</span>
                          <span className="font-medium">
                            ${visitData.insurance_coverage || "0.00"}
                          </span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded font-medium">
                          <span>Patient Responsibility:</span>
                          <span>
                            $
                            {(
                              parseFloat(visitData.total_amount) -
                              parseFloat(visitData.insurance_coverage || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No charges recorded for this visit
                    </p>
                  )}
                </div>
              </div>
                  </div>

            <div className="lg:col-span-3">
              {/* Lab Results */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r bg-blue-500 from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h2 className="text-lg font-bold text-black">Lab Results</h2>
                </div>
                <div className="p-4">
                  {visitData.lab_results && visitData.lab_results.length > 0 ? (
                    <div className="space-y-4">
                      {visitData.lab_results.map((labResult, idx) => (
                        <div
                          key={labResult.id}
                          className={
                            idx !== visitData.lab_results.length - 1
                              ? "pb-3 border-b border-gray-200"
                              : ""
                          }
                        >
                          <h3 className="font-medium text-gray-900">
                            {labResult.test_name}
                          </h3>
                          <div className="grid grid-cols-2 gap-x-4 mt-1">
                            <div>
                              <p className="text-sm">
                                <span className="text-gray-600">
                                  Test Date:{" "}
                                </span>
                                {formatDate(labResult.test_date).split(",")[0]}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Result: </span>
                                {labResult.result || "Not available"}
                                {labResult.units ? ` ${labResult.units}` : ""}
                              </p>
                            </div>
                            <div>
                              {labResult.normal_range && (
                                <p className="text-sm">
                                  <span className="text-gray-600">
                                    Normal Range:{" "}
                                  </span>
                                  {labResult.normal_range}
                                </p>
                              )}
                              {labResult.interpretation && (
                                <p className="text-sm">
                                  <span className="text-gray-600">
                                    Interpretation:{" "}
                                  </span>
                                  {labResult.interpretation}
                                </p>
                              )}
                            </div>
                          </div>
                          {labResult.performed_by && (
                            <p className="text-sm mt-2">
                              <span className="text-gray-600">
                                Performed By:{" "}
                              </span>
                              {labResult.performed_by}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No lab results recorded for this visit
                    </p>
                  )}
                </div>
              </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6">
              <p className="text-gray-600 text-center">
                No record found with ID {visitId}
              </p>
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleBackClick}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  Return to Patient
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
