import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Calendar, MapPin, Users, X, Menu,Home } from 'lucide-react';
import useUserContext from '@/hooks/useUserContext';

const Navbar = () => {
    const { isMenuOpen, setIsMenuOpen } = useUserContext();

    const menuItems = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Events', path: '/events', icon: Calendar },
        { name: 'Communities', path: '/communities', icon: Users },
        { name: 'Impact', path: '/impact', icon: MapPin },
        { name: 'Gallery', path: '/gallery', icon: Camera },
    ];

    useEffect(() => {
        console.log(isMenuOpen);
    }, [isMenuOpen]);

    return (
        <nav className="fixed top-0 left-0 right-0 bg-green-600/90 text-white backdrop-blur-sm z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">EcoClean</h1>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link className="hover:text-green-200 font-medium" to={'/'} draggable='false'>Home</Link>
                        <Link className="hover:text-green-200 font-medium" to={"/events"} draggable='false'>Events</Link>
                        <Link className="hover:text-green-200 font-medium" to={"/communities"} draggable='false'>Communities</Link>
                        <Link className="hover:text-green-200 font-medium" to={"/impact"} draggable='false'>Impact</Link>
                        <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50">
                            Login
                        </button>
                    </div>

                    <button
                        className="md:hidden p-2 hover:bg-green-700 rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-[100]">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl">
                        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Menu</h2>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <nav className="py-4 bg-white rounded-md h-screen">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="w-full text-left px-6 py-4 hover:bg-green-50 transition-all duration-200 flex items-center space-x-4 group"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <item.icon
                                        size={20}
                                        className="text-green-600 group-hover:scale-110 transition-transform duration-200"
                                    />
                                    <span className="text-gray-700 group-hover:text-green-600 transition-colors duration-200">
                                        {item.name}
                                    </span>
                                </Link>
                            ))}

                            <button className="w-full text-left px-6 py-4 mt-4 border-t border-gray-100">
                                <span className="text-green-600 font-medium">Logout</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
