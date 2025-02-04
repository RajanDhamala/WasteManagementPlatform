import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, ArrowLeft, Shield} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '@/UserContext/AlertContext';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [stage, setStage] = useState('email');
  const [verificationStatus, setVerificationStatus] = useState(null);
  const otpInputRefs = useRef([]);

  const navigate = useNavigate();
  
  const { setAlert } = useAlert();

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
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

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BASE_URL}user/forgotpassword`, { email });
  
      if (data.success) {
        setAlert({ type: 'success', message: 'OTP sent to your email', title: 'Success' });
        setStage('otp');
      } else {
        setAlert({ type: 'error', message: 'Failed to send OTP', title: 'Error' });
      }
    } catch (err) {
      const message = err.response?.status === 429 
        ? 'You have exceeded the maximum number of attempts. Please try again later.' 
        : 'Failed to send OTP';
  
      setAlert({ type: 'error', message, title: 'Error' });
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    setVerificationStatus(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}user/verifyPasswordOtp`, { 
        email, 
        otp: otpCode 
      },{ withCredentials: true });
      console.log(response.data);
      
      if (response.data.success) {
        setAlert({
          type: 'success',
          message: 'OTP verified successfully',
          title: 'Success'
        })
        setVerificationStatus('success');
        setTimeout(() => {

        }, 2000);
      } else {
        setAlert({
          type: 'error',
          message: response.data.message || 'Invalid OTP. Please try again.',
          title: 'Error'
        })
        setVerificationStatus('error');
      }
    } catch (err) {
      setVerificationStatus('error');
      setAlert({
        type: 'error',
        message: 'Failed to verify OTP',
        title: 'Error'
      })
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-200 p-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl space-y-6"
      >
        <AnimatePresence mode="wait">
          {stage === 'email' ? (
            <motion.form 
              key="email-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onSubmit={handleEmailSubmit} 
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="text-center">
                <Mail className="mx-auto text-green-500 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
                <p className="text-gray-600 mt-2">Enter your email to reset password</p>
              </motion.div>
              
              
              <motion.div variants={itemVariants} className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  className="w-full px-4 py-3 pl-10 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Mail className="absolute left-3 top-3.5 text-green-400" size={20} />
              </motion.div>
              
              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition duration-300 flex items-center justify-center"
              >
                <Shield className="mr-2" size={20} />
                Send OTP
              </motion.button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onSubmit={handleOtpVerification} 
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="text-center">
                <KeyRound className="mx-auto text-green-500 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-gray-800">Verify OTP</h2>
                <p className="text-gray-600 mt-2">Enter 6-digit code sent to {email}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="grid grid-cols-6 gap-2">
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    variants={itemVariants}
                    type="text"
                    ref={(el) => otpInputRefs.current[index] = el}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    pattern="\d*"
                    inputMode="numeric"
                    className="w-full text-center py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    whileFocus={{ 
                      scale: 1.1,
                      borderColor: 'rgb(34 197 94)' 
                    }}
                  />
                ))}
              </motion.div>
              
              <motion.div variants={itemVariants} className="flex justify-between items-center mt-6">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setStage('email')}
                  className="text-green-500 hover:underline flex items-center"
                >
                  <ArrowLeft className="mr-2" size={20} />
                  Change Email
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit" 
                  className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 transition duration-300 flex items-center"
                >
                  <KeyRound className="mr-2" size={20} />
                  Verify OTP
                </motion.button>
              </motion.div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;