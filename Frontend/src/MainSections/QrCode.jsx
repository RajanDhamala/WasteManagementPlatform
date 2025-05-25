import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, AlertCircle, CheckCircle, RefreshCw, Trash2, Send } from 'lucide-react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';

const QrCode = () => {
  const [scannedData, setScannedData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const verifyQrMutation = useMutation({
    mutationFn: async () => {
      if (!scannedData) throw new Error("QR code not available");
      
      const hashedQR = typeof scannedData === 'object' && scannedData.encryptedData 
        ? scannedData.encryptedData 
        : scannedData;
        
      console.log("Sending verification with hashed QR data:", hashedQR);
      
      const response = await axios.post(
        "http://localhost:8000/participate/verify",
        { hashedQR },
        { withCredentials: true }
      );
      
      console.log(response);
      return response.data;
    },
    onError: (error) => {
      console.error("Verification error:", error);
      setError(error.response?.data?.message || "Failed to verify QR code");
    }
  });

  useEffect(() => {
    startScanner();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanner = () => {
    // Create a new code reader instance each time
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    
    codeReaderRef.current = new BrowserMultiFormatReader();
    setIsScanning(true);
    setError(null);

    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          setCameraPermission(true);
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          codeReaderRef.current
            .decodeFromVideoDevice(null, videoRef.current, (result) => {
              if (result) {
                handleScan(result.getText());
              }
            })
            .catch((error) => {
              setError("Unable to detect QR code. Please ensure it's clearly visible.");
            });
        })
        .catch((err) => {
          setCameraPermission(false);
          setIsScanning(false);
          setError("Camera access denied. Please allow camera permissions.");
        });
    }
  };

  const handleScan = (scannedText) => {
    if (hasScanned) return;

    try {
      // Try to parse the scanned data as JSON
      const parsedData = JSON.parse(scannedText);
      setScannedData(parsedData);
    } catch (e) {
      // If not valid JSON, store as string
      setScannedData({ encryptedData: scannedText });
    }
    
    captureScreenshot();
    setHasScanned(true);
    stopScanning();
  };

  const captureScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    setScreenshot(dataUrl);
  };

  const stopScanning = () => {
    // Make sure to reset the code reader
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach(track => track.stop());

      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const clearScanData = () => {
    // Stop current scanning and reset everything
    stopScanning();
    
    // Reset all states
    setScannedData(null);
    setScreenshot(null);
    setHasScanned(false);
    verifyQrMutation.reset();
    setError(null);
    
    // Automatically restart scanner after a short delay
    setTimeout(() => {
      startScanner();
    }, 300);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="w-full text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">QR Code Scanner</h2>
        <p className="text-gray-600 text-sm">Position QR code within the frame</p>
      </div>

      <div className="relative w-full aspect-square mb-4 bg-black rounded-lg overflow-hidden">
        {!scannedData && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            {isScanning && (
              <>
                <div className="absolute inset-0 border-2 border-blue-400 rounded pointer-events-none">
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                </div>
                <div className="absolute left-0 right-0 h-1 bg-blue-500 opacity-80" 
                     style={{
                       animation: 'scanLine 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                     }} />
                <style>
                  {`
                    @keyframes scanLine {
                      0% { top: 0; }
                      50% { top: calc(100% - 4px); }
                      100% { top: 0; }
                    }
                  `}
                </style>
              </>
            )}
          </>
        )}

        {screenshot && (
          <div className="relative w-full h-full">
            <img
              src={screenshot}
              alt="Scanned QR Code"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full">
              <CheckCircle size={24} />
            </div>
          </div>
        )}

        {cameraPermission === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 text-white p-4 text-center">
            <div>
              <AlertCircle size={48} className="mx-auto mb-2 text-red-400" />
              <p>Camera access denied</p>
              <p className="text-sm mt-2">Please enable camera permissions in your browser settings</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="w-full p-3 mb-4 bg-red-100 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {verifyQrMutation.isSuccess && (
        <div className="w-full p-3 mb-4 bg-green-100 border border-green-200 rounded-md text-green-700 flex items-center">
          <CheckCircle size={20} className="mr-2 flex-shrink-0" />
          <p className="text-sm">QR code verified successfully!</p>
        </div>
      )}

      {isScanning && !error && (
        <div className="w-full p-3 mb-4 bg-blue-100 border border-blue-200 rounded-md text-blue-700 flex items-center">
          <div className="mr-2 animate-spin">
            <RefreshCw size={20} />
          </div>
          <p className="text-sm">Scanning for QR codes...</p>
        </div>
      )}

      {verifyQrMutation.isPending && (
        <div className="w-full p-3 mb-4 bg-blue-100 border border-blue-200 rounded-md text-blue-700 flex items-center">
          <div className="mr-2 animate-spin">
            <RefreshCw size={20} />
          </div>
          <p className="text-sm">Verifying QR code...</p>
        </div>
      )}

      {scannedData && (
        <div className="w-full bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">QR Code Scanned Successfully</h3>
          <p className="text-gray-700">QR code data has been captured and is ready to be verified.</p>
        </div>
      )}

      {/* Button Row */}
      <div className="w-full flex gap-3 mb-4">
        {!isScanning && !scannedData && (
          <button
            onClick={startScanner}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <Camera size={20} className="mr-2" />
            Scan QR Code
          </button>
        )}

        {isScanning && !scannedData && (
          <button
            onClick={stopScanning}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <AlertCircle size={20} className="mr-2" />
            Stop Scanning
          </button>
        )}

        {scannedData && (
          <>
            <button
              onClick={() => verifyQrMutation.mutate()}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center"
              disabled={verifyQrMutation.isPending || verifyQrMutation.isSuccess}
            >
              <Send size={20} className="mr-2" />
              Verify QR
            </button>

            <button
              onClick={clearScanData}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg flex items-center justify-center"
            >
              <Trash2 size={20} className="mr-2" />
              Clear & Scan Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QrCode;