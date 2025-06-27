// src/context/UserContext.tsx or .jsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';



const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [card_id, setCardId] = useState(null); 
  const [sessionToken, setSessionToken] = useState(null); // Optional: if you want to manage session tokens
  const [patient, setPatient] = useState({}); // Optional: if you want to manage patient data

  const updateCardId = (id) => {
    setCardId(id);
  };
  const updateSessionToken = (token) => {
    setSessionToken(token);
  };
const updatePatient = (patientData) => {
    setPatient(patientData);
};
  
  return (
    <UserContext.Provider value={{ updateCardId, card_id, updateSessionToken, sessionToken, updatePatient, patient }}>
      {children}
    </UserContext.Provider>
  );
};

// custom hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
