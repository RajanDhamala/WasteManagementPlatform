import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

function QrGetter() {
  const socketRef = useRef(null);
  const [qrData, setQrData] = useState(null);
  const [qrCodeFetched, setQrCodeFetched] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [qrCode,setqrCode]=useState()

  const verifyQr = useMutation({
    mutationFn: async () => {
      if (!qrData) throw new Error("QR code not available");
      console.log("Sending verification with hashed QR data:", qrData.encryptedData);
      const response = await axios.post(
        "http://localhost:8000/participate/verify",
        { hashedQR: qrData.encryptedData },
        { withCredentials: true }
      );
      console.log(response)
      return response.data;
    },
    onSuccess: (result) => {
      console.log("Verification Successful:", result);
      alert("QR Code Verified Successfully!");
    },
    onError: (err) => {
      console.error("Verification Failed:", err);
      alert("QR Code Verification Failed!");
    },
  });

  useEffect(() => {
    const socket = io("http://localhost:8000", {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('Connected');
      setError(null);
    });

    socket.on('connection-status', (data) => {
      console.log('Connection status:', data);
      setConnectionStatus(`Connected (${data.socketId})`);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection Error:', error);
      setConnectionStatus('Connection Failed');
      setError(error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      setConnectionStatus('Disconnected');
    });

    socket.on("qr-data", ({ data, encryptedData, QrData }) => {
      console.log("Received QR Data:", { data, encryptedData, QrData });
      setQrData({ data, encryptedData, QrData });
      setQrCodeFetched(true);
      setqrCode(data)
  });

    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('connection-status');
        socket.off('connect_error');
        socket.off('disconnect');
        socket.off('qr-data');
        socket.close();
      }
    };
  }, []);


  const handleFetchQr = async () => {
    try {
      if (!socketRef.current?.connected) {
        throw new Error('Socket not connected');
      }

      socketRef.current.emit('request-qr');

      const response = await axios.get("http://localhost:8000/participate/qr", {
        withCredentials: true,
      });
      console.log(response.data)
      
      setQrData(response.data.data);
      setQrCodeFetched(true);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center flex-col mt-5">
      <h2 className="text-3xl">Your QR Code</h2>

      {/* Connection Status */}
      <div className={`mb-2 ${error ? 'text-red-500' : 'text-gray-500'}`}>
        {connectionStatus}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <button
        className={`bg-blue-400 hover:bg-blue-600 rounded-md text-white px-4 py-2 mt-2
          disabled:bg-gray-400 disabled:cursor-not-allowed`}
        onClick={handleFetchQr}
        disabled={!socketRef.current?.connected}
      >
        Fetch QR Code
      </button>

      {qrCodeFetched && qrData ? (
        <div className="mt-4 flex flex-col items-center">
          <img 
            src={qrCode} 
            alt="QR Code"
            className="max-w-[200px] border rounded-lg shadow-md" 
          />
          <button
            className="bg-green-500 hover:bg-green-600 rounded-md text-white px-4 py-2 mt-4"
            onClick={() => verifyQr.mutate()}
          >
            Verify QR
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No QR code available</p>
      )}
    </div>
  );
}

export default QrGetter;
