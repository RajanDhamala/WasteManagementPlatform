import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, AlertCircle, CheckCircle, RefreshCw, Copy, Trash2, History } from 'lucide-react';

const QrCode = () => {
  const [scannedData, setScannedData] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const videoRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [hasScanned, setHasScanned] = useState(false); // Track if scan is completed

  useEffect(() => {
    startScanner();

    return () => {
      stopScanning();
    };
  }, []);

  const startScanner = () => {
    if (hasScanned) return; // Prevent starting scanner if already scanned

    setScannedData(null);
    setScreenshot(null);
    setError(null);
    setIsCopied(false);

    const codeReader = new BrowserMultiFormatReader();

    if (videoRef.current) {
      setIsScanning(true);

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          setCameraPermission(true);
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          codeReader
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
    if (hasScanned) return; // Don't allow scanning after one scan

    setScannedData(scannedText);
    captureScreenshot();

    // Add to scan history with timestamp
    const newScan = {
      data: scannedText,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now()
    };

    setScanHistory(prevHistory => [newScan, ...prevHistory]);
    setHasScanned(true); // Mark as scanned
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
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream?.getTracks();
      tracks?.forEach(track => track.stop());

      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text || scannedData)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        setError("Failed to copy text");
      });
  };

  const clearScanData = () => {
    setScannedData(null);
    setScreenshot(null);
    setHasScanned(false); 
    startScanner(); 
  };

  const clearHistory = () => {
    setScanHistory([]);
    setShowHistory(false);
  };

  const deleteScanItem = (id) => {
    setScanHistory(prevHistory => prevHistory.filter(item => item.id !== id));
  };

  const viewHistoryItem = (item) => {
    setScannedData(item.data);
    setShowHistory(false);
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

      {isScanning && !error && (
        <div className="w-full p-3 mb-4 bg-blue-100 border border-blue-200 rounded-md text-blue-700 flex items-center">
          <div className="mr-2 animate-spin">
            <RefreshCw size={20} />
          </div>
          <p className="text-sm">Scanning for QR codes...</p>
        </div>
      )}

      {scannedData && (
        <div className="w-full bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">Scanned Result</h3>
          <div className="relative">
            <div className="bg-gray-100 p-3 rounded-md break-all max-h-32 overflow-y-auto text-gray-800">
              {scannedData}
            </div>
            <button 
              onClick={() => copyToClipboard()}
              className="absolute top-2 right-2 text-gray-500 hover:text-blue-500 p-1 rounded-md hover:bg-gray-200"
              aria-label="Copy to clipboard"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
          </div>
          {isCopied && (
            <p className="text-green-600 text-xs mt-1 flex items-center">
              <CheckCircle size={14} className="mr-1" />
              Copied to clipboard
            </p>
          )}
        </div>
      )}

      {/* Button Row */}
      <div className="w-full flex gap-3 mb-4">
        {!isScanning && (
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
            Stop Scanner
          </button>
        )}

        {scannedData && (
          <button
            onClick={clearScanData}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <Trash2 size={20} className="mr-2" />
            Clear Result
          </button>
        )}

        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`py-3 px-4 ${showHistory ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'} text-white font-medium rounded-lg flex items-center justify-center`}
          title="Scan History"
        >
          <History size={20} />
        </button>
      </div>

      {/* Scan History Section */}
      {showHistory && (
        <div className="w-full bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Scan History</h3>
            {scanHistory.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center"
              >
                <Trash2 size={14} className="mr-1" />
                Clear All
              </button>
            )}
          </div>

          {scanHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No scan history yet</p>
          ) : (
            <div className="max-h-56 overflow-y-auto">
              {scanHistory.map((item) => (
                <div key={item.id} className="border-b border-gray-100 py-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.data}</p>
                      <p className="text-xs text-gray-500">{item.timestamp}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => copyToClipboard(item.data)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                      <button 
                        onClick={() => viewHistoryItem(item)}
                        className="p-1 text-gray-400 hover:text-green-500"
                        title="View"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => deleteScanItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QrCode;
