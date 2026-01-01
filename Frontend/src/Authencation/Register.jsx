import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, Loader2 } from "lucide-react";
import Confetti from 'react-confetti';
import axios from "axios"
import useStore from "@/ZustandStore/UserStore";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const setAlert=useStore((state)=>state.setAlert)
  
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required.");
      setAlert({
        title: "Registration Failed",
        message: "All fields are required.",
        type: "error",
      })
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setAlert({
        title: "Registration Failed",
        message: "Passwords do not match.",
        type: "error",
      })
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:8000/user/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      },{ withCredentials: true });
      console.log(response.data);

      if(response.data.statusCode == 200) {
        setAlert({
          title: "Registration Successful",
          message: response.data.message,
          type: "success",
        })
        setShowConfetti(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      }else{
        setAlert({
          title: "Registration Failed",
          message: response.data.message,
          type: "error",})
      }
      
    } catch (err) {
      setError("Failed to register. Please try again.");
      setAlert({
        title: "Registration Failed",
        message: "Failed to register. Please try again.",
        type: "error",
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F7F4] to-[#E8F5E9] p-4"
    >
      {showConfetti && <Confetti />}
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-green-100"
      >
        <motion.div
          className="text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Leaf className="mx-auto h-12 w-12 text-[#8FBC8F]" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-[#2C5530] font-montserrat">
            Join Our Community
          </h2>
          <p className="mt-2 text-sm text-[#4A6D4A] font-inter">
            Start your eco-friendly journey today
          </p>
        </motion.div>

        <motion.form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
              <input
                autoComplete="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl
                         focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                         placeholder-[#4A6D4A]/50 font-inter"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
              <input
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl
                         focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                         placeholder-[#4A6D4A]/50 font-inter"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
              <input
              autoComplete="new-password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl
                         focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                         placeholder-[#4A6D4A]/50 font-inter"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
              <input
              autoComplete="new-password"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl
                         focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                         placeholder-[#4A6D4A]/50 font-inter"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-inter">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent
                     rounded-xl text-white bg-[#8FBC8F] hover:bg-[#228B22] focus:outline-none
                     focus:ring-2 focus:ring-offset-2 focus:ring-[#9DC88D] transition-all
                     duration-300 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              'Create Account'
            )}
          </motion.button>

          <div className="text-center">
            <Link
              to="/login"
              className="font-inter text-sm text-[#4A6D4A] hover:text-[#228B22]
                       transition-colors duration-300"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
};

export default Register;
