"use client"

import { useState, useEffect } from "react"
import { Smartphone, CheckCircle, AlertTriangle, Heart, Calendar, FileText, Shield, Clock, User } from "lucide-react"
import { NfcTap } from "@/services/apiService"
import { useUser } from "@/context/UserContext"
import { io } from 'socket.io-client';


const  PatientCheckIn =() => {
  const [isScanning, setIsScanning] = useState(false)
  const [scanningPhase, setScanningPhase] = useState('idle') // 'idle', 'waiting', 'processing'
  const [patient, setPatient] = useState(null)
  const [show, setShow] = useState(null)
  const [sessionTime, setSessionTime] = useState(240)
  const [cardId, setCardId] = useState(null);
  const { updateCardId , updateSessionToken, updatePatient} = useUser();
  // const { messages } = useWebSocket('ws://:3000');
  

  const handleNFCScan = async() => {
    setIsScanning(true)
    setScanningPhase('waiting')
    
    // Wait for card_id from socket
    console.log("🔍 Waiting for NFC card scan...");
    
    // Create a promise that resolves when we receive a card_id from socket
    const waitForCardId = new Promise((resolve, reject) => {
      const socket = io('https://trialdev.amanadhikari.me');
      
      // Set timeout for scanning
      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('NFC scan timeout'));
      }, 30000); // 30 seconds timeout
      

      // socket.send('nfc-scan-request', { message: 'Requesting NFC scan' });
      socket.on('nfc-scan', (data) => {
        clearTimeout(timeout);
        console.log("📡 Received card_id from socket:===", data.card_id);
        setCardId(data.card_id);
        socket.disconnect();
        resolve(data.card_id);
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(err);
      });
    });

    try {
      // Wait for card_id from socket
      const receivedCardId = await waitForCardId;
      console.log("Received card_id:", receivedCardId);
      if(receivedCardId) {
        setScanningPhase('processing')
        updateCardId(receivedCardId);
        console.log("Card ID updated in context:", cardId);
        setPatient(receivedCardId);
        
        // Now proceed with API call using the received card_id
        const TapResponse = await NfcTap(receivedCardId);
        setShow(true);
        setTimeout(() => {
          setShow(false);
        }, 5000);
        
        console.log("TapResponse================", TapResponse.data.session.session_token);
        if( TapResponse.data.session.session_token) {
          localStorage.setItem("session_token", TapResponse.data.session.session_token);
          updateSessionToken(TapResponse.data.session.session_token);
          updatePatient(TapResponse.data.session.patient);
          console.log("Session token updated in context:", TapResponse.data.session.session_token);
        }
      }
    } catch (error) {
      console.error("❌ Error during NFC scan:", error);
      // Handle error - maybe show an error message
      alert("NFC scan failed or timed out. Please try again.");
    } finally {
      setIsScanning(false);
      setScanningPhase('idle');
    }
  }

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  return (
    <div className=" bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      {/* <header className="bg-white shadow-sm border-b border-blue-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-900">MedAudit</span>
            </Link>
            {patient && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-sm border border-blue-600 text-blue-600">
                <Clock className="w-4 h-4 mr-1" />
                Session: {formatTime(sessionTime)}
              </div>
            )}
          </div>
        </div>
      </header> */}

      <div className="max-w-4xl mx-auto px-4">
        {
            show &&(
              <div className="space-y-6 animate-in fade-in duration-500">
                {/* Welcome Card */}
                <div className="p-6 bg-green-50 border border-green-200 rounded-lg transform transition-all duration-300 hover:shadow-md animate-in slide-in-from-top-2">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="w-8 h-8 text-green-600 transition-transform duration-300 hover:scale-110" />
                    <div>
                      <h2 className="text-xl font-semibold text-green-900">Check-in Successful!</h2>
                      <p className="text-green-700">Welcome back, {patient}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Profile */}
                <div className="bg-white border border-blue-200 rounded-lg transform transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-2">
                  {/* Continue converting the rest of the components similarly... */}
                </div>
              </div>

            )
          }
          {/* /* NFC Scan Interface */}
          <div className="text-center animate-in fade-in duration-700">
            <div className="max-w-md mx-auto bg-white rounded-lg border border-blue-200 shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl  animate-in slide-in-from-bottom-4">
              <div className="pb-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:bg-blue-200 hover:scale-105">
                  <Smartphone className="w-10 h-10 text-blue-600 transition-colors duration-300" />
                </div>
                <h2 className="text-2xl font-semibold text-blue-900 transition-colors duration-300">Patient Check-In</h2>
                <p className="text-blue-600 mt-1 transition-colors duration-300">Tap your NFC card to access your medical records</p>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <div
                    className={`w-32 h-32 mx-auto rounded-full border-4 border-dashed border-blue-300 flex items-center justify-center transition-all duration-500 ${
                      isScanning 
                        ? "animate-pulse border-blue-500 bg-blue-50 scale-105" 
                        : "hover:border-blue-400 hover:bg-blue-25 hover:scale-105"
                    }`}
                  >
                    <div className="text-center">
                      <Smartphone className={`w-8 h-8 text-blue-500 mx-auto mb-2 transition-all duration-300 ${
                        isScanning ? "animate-bounce" : "hover:scale-110"
                      }`} />
                      <p className="text-sm text-blue-600 transition-colors duration-300">
                        {scanningPhase === 'waiting' && "Please tap your NFC card..."}
                        {scanningPhase === 'processing' && "Processing card data..."}
                        {scanningPhase === 'idle' && "Tap Card"}
                      </p>
                    </div>
                  </div>
                  {isScanning && (
                    <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></div>
                  )}
                </div>

                <button
                  onClick={handleNFCScan}
                  disabled={isScanning}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  {scanningPhase === 'waiting' && "Waiting for NFC card..."}
                  {scanningPhase === 'processing' && "Processing..."}
                  {scanningPhase === 'idle' && "Start NFC Scan"}
                </button>

                <div className="flex p-4 bg-blue-50 border border-blue-200 rounded-lg transform transition-all duration-300 hover:bg-blue-75 hover:shadow-sm">
                  <Shield className="h-4 w-4 text-blue-600 mr-2 transition-transform duration-300 hover:scale-110" />
                  <p className="text-blue-800 text-sm transition-colors duration-300">
                    {scanningPhase === 'waiting' 
                      ? "Please tap your NFC card within 30 seconds. Your medical information is encrypted and secure."
                      : "Your medical information is encrypted and secure. Session expires in 4 hours for your privacy."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        
          
        
      </div>
    </div>
  )
}


export default PatientCheckIn;