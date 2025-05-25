import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ShieldCheck, BadgeCheck, UserCircle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useStore from '@/ZustandStore/UserStore';

function VerifyUser() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [stage, setStage] = useState('request');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();

 const setAlert=useStore((state)=>state.setAlert)

  const requestOtp = async () => {
    setError('');
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}user/verifyUser`, { withCredentials: true });
      console.log(response.data);
      if (response.data.success) {
        setStage('verification');
        setAlert({
          type: 'success',
          message: response.data.message,
          title: 'Success'
        })
      } else {
        setError(response.data.message || 'Failed to request OTP');
        setAlert({
          type: 'error',
          message: response.data.message || 'Failed to request OTP',
          title: 'Error'
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Network error');
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Network error',
        title: 'Error'
      })
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}user/verifyVerificationOtp`, 
        { otp: otpCode }, 
        { withCredentials: true }
      );
      
      if (response.data.statusCode === 200) {
        setAlert({
          type: 'success',
          message: response.data.message,
          title: 'Success'
        })
        setIsVerified(true);
        setStage('success');
        setTimeout(() => navigate('/profile'), 3000);
      } else {
        setError(response.data.message || 'Invalid verification');
        setAlert({
          type: 'error',
          message: response.data.message || 'Invalid verification',
          title: 'Error'
        })
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Verification failed',
        title: 'Error'
      })
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {stage === 'request' && (
          <div className="p-8 space-y-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <UserCircle className="text-green-600" size={56} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800">
              Request Verification OTP
            </h2>
            
            <p className="text-gray-600 mb-4">
              Click below to receive a verification code
            </p>
            
            {error && (
              <div className="text-red-600 mb-4">
                {error}
              </div>
            )}
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={requestOtp}
              className="w-full bg-green-600 text-white py-3 rounded-xl 
                hover:bg-green-700 transition duration-300 
                flex items-center justify-center space-x-2"
            >
              <Send size={20} />
              <span>Send OTP</span>
            </motion.button>
          </div>
        )}

        {stage === 'verification' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="text-green-600" size={56} />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-800">
              Enter Verification Code
            </h2>
            
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-full text-center py-3 border-2 border-green-300 rounded-xl 
                      focus:outline-none focus:ring-2 focus:ring-green-500 
                      text-xl font-bold tracking-wider"
                  />
                ))}
              </div>
              
              {error && (
                <div className="text-red-600 text-center">
                  {error}
                </div>
              )}
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-xl 
                  hover:bg-green-700 transition duration-300 
                  flex items-center justify-center space-x-2"
              >
                <ShieldCheck size={20} />
                <span>Verify OTP</span>
              </motion.button>
            </form>
          </div>
        )}
        
        {stage === 'success' && (
          <div className="p-8 text-center bg-green-50">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <BadgeCheck className="text-green-500" size={72} />
              <h2 className="text-2xl font-bold text-gray-800">
                Verification Successful!
              </h2>
              <div className="flex items-center space-x-2">
                <UserCircle className="text-green-600" size={32} />
                <p className="text-gray-600">Redirecting to Dashboard...</p>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default VerifyUser;