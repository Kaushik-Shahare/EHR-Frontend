import React from "react";

export default function PatientInfoLeftColumn({user}) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3">
          <h3 className="text-lg font-bold text-black">Patient Profile</h3>
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-black flex items-center justify-center mb-2 text-2xl font-bold">
              {user?.session?.patient?.profile?.name?.charAt(0) || "P"}
            </div>
            <h4 className="font-medium">
              {user?.session?.patient?.profile?.name}
            </h4>
            <p className="text-sm text-gray-600">
              {user?.session?.patient?.profile?.email}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Basic Information
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.gender || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Blood Type:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.blood_group || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.phone_number || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Vital Signs
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.height_cm || "N/A"} cm
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.weight_kg || "N/A"} kg
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.age || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Medical
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Allergies:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user?.session?.patient?.profile?.allergies?.map(
                      (allergy, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full"
                        >
                          {allergy}
                        </span>
                      )
                    ) || <span className="text-gray-500">No recorded</span>}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Chronic Conditions:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user?.session?.patient?.profile?.chronic_conditions?.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {condition}
                        </span>
                      )
                    ) || <span className="text-gray-500">No recorded</span>}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Current Medications
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                {user?.session?.patient?.profile?.current_medications?.map(
                  (condition, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {condition}
                    </span>
                  )
                ) || <span className="text-gray-500">No recorded</span>}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Insurance
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Provider:</span>
                  <div className="font-medium">
                    {user?.session?.patient?.profile?.insurance?.provider ||
                      "N/A"}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Policy No:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.insurance
                      ?.policy_number || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.insurance?.valid_till ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency contacts */}
            <div>
              <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">
                Emergency Contacts
              </h5>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <div className="font-medium">
                    {user?.session?.patient?.profile?.emergency_contact?.name ||
                      "N/A"}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">relation:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.emergency_contact
                      ?.relation || "N/A"}
                  </span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-gray-600">Phone No.:</span>
                  <span className="font-medium">
                    {user?.session?.patient?.profile?.emergency_contact
                      ?.phone_number || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
