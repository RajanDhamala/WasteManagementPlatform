import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";
import Confetti from 'react-confetti';
import axios from "axios";
import useStore from "@/ZustandStore/UserStore";
import Cookies from 'js-cookie';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

  const setAlert=useStore((state)=>state.setAlert)

    const navigate = useNavigate();

    // Get setCurrentUser from Zustand store
    const setCurrentUser = useStore((state) => state.setCurrentUser);

    useEffect(() => {
        const user = Cookies.get("CurrentUser");
        if (user) {
            console.log("User:", user);
        } else {
            console.log("No user found in cookies");
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/user/login", { email, password }, { withCredentials: true });
            console.log(response.data);
            
            if (response.data.statusCode == '200') {
                console.log("Login Successful:", response.data);
                
                // Set the current user in Zustand store
                setCurrentUser(response.data.data);
                
                // Store user data in cookies for persistence
                Cookies.set("CurrentUser", JSON.stringify(response.data.data), { expires: 7 });
                
                setShowConfetti(true);
                setAlert({
                    title: "Login Successful",
                    message: "You are now logged in.",
                    type: "success",
                });

                // Navigate after a short delay to show confetti
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(response.data.message || "Login failed");
                setAlert({
                    title: "Login Failed",
                    message: response.data.message || "Login failed",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMessage = error.response?.data?.message || "Invalid email or password.";
            setError(errorMessage);
            setAlert({
                title: "Login Failed",
                message: errorMessage,
                type: "error",
            });
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
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-[#4A6D4A] font-inter">
                        Sign in to continue your eco-journey
                    </p>
                </motion.div>

                <motion.form 
                    className="mt-8 space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
                                <input
                                    autoComplete="username"
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl 
                                             focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                                             placeholder-[#4A6D4A]/50 font-inter"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#8FBC8F]" />
                                <input
                                    autoComplete="current-password"
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-12 pr-4 py-3 bg-green-50/50 border border-green-100 rounded-xl
                                             focus:ring-2 focus:ring-[#9DC88D] focus:border-transparent transition-all duration-300
                                             placeholder-[#4A6D4A]/50 font-inter"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center font-inter">{error}</p>
                    )}

                    <div className="space-y-4">
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3 px-4 border border-transparent 
                                         rounded-xl text-white bg-[#8FBC8F] hover:bg-[#228B22] focus:outline-none 
                                         focus:ring-2 focus:ring-offset-2 focus:ring-[#9DC88D] transition-all 
                                         duration-300 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </motion.div>

                        <div className="flex flex-col space-y-2 text-center">
                            <Link 
                                to="/forgot"
                                className="font-inter text-sm text-[#4A6D4A] hover:text-[#228B22] 
                                         transition-colors duration-300"
                            >
                                Forgot your password?
                            </Link>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or</span>
                                </div>
                            </div>
                            <Link 
                                to="/register"
                                className="font-inter text-sm text-[#228B22] hover:text-[#8FBC8F] 
                                         transition-colors duration-300"
                            >
                                Don't have an account? Register now
                            </Link>
                        </div>
                    </div>
                </motion.form>
            </motion.div>
        </motion.div>
    );
};

export default Login;