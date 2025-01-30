import { useState, useEffect } from 'react';
import { Camera, Calendar, MapPin, Users, X, Search, Menu, LogOut } from 'lucide-react';
import useUserContext from '@/hooks/useUserContext';
import EventCard from './EventCard';
import {Link,useNavigate} from 'react-router-dom';


const LandingPage = () => {
    return (
      <>
        <div
          className="min-h-screen bg-cover bg-center relative"
          style={{ backgroundImage: "url('./bg.avif')" }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative z-10 pt-16">
            <main className="max-w-7xl mx-auto px-4 py-12 md:mt-20 relative z-0">
              <div className="mb-12 text-center">
                <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
                  Join the Clean Community Movement
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
                  Connect with local volunteers and make a difference in your community through organized cleanup events.
                </p>
                <div className="flex justify-center gap-4">
                  <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg">
                    Join Now
                  </button>
                  <button className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors shadow-lg">
                    Learn More
                  </button>
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Search for events..."
                    className="w-full p-3 pl-10 rounded-full border-0 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="absolute left-3 top-3 text-white/70" size={20} />
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-gradient-to-b from-gray-100 to-green-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Upcoming Clean-Up Events
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join these community events and help make our environment cleaner and greener
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              <EventCard 
                title="Ghinaghat Cleanup Drive"
                date="Sat, Apr 20 • 7:00 AM"
                location="Ghinaghat, Biratnagar-3"
                Peoples="45"
                image={'./ghinaghat.jpg'}
                status='Ongoing'
              
              />
              <EventCard 
                title="Keshaliya River Cleanup"
                date="Sun, Apr 21 • 6:30 AM"
                location="Keshaliya Bridge, Biratnagar-7"
                Peoples="32"
                image={'./ktm.jpg'}
                status='Completed'
              
              />
              <EventCard 
                title="Tinpaini Market Cleanup"
                date="Sat, Apr 27 • 7:30 AM"
                location="Tinpaini Chowk, Biratnagar-5"
                Peoples="28"
                image={'./dirt.webp'}
                status='Finshed'
              
              />
              <EventCard 
                title="Bargachhi Park Revival"
                date="Sun, Apr 28 • 8:00 AM"
                location="Bargachhi, Biratnagar-4"
                Peoples="37"
                status='Ongoing'
                image={'./defulthu.jpg'}
              />
            </div>
            

            <div className="text-center mt-12">
              <Link className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg inline-flex items-center gap-2" to={'/events'}>
                View All Events
                <Calendar size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* <BookShow/>BookShow Section where books details are scrapped from the web  good learing experince for web scrapping */}
      

        {/* Optional: Add a Footer Section */}
        <footer className="bg-green-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">EcoClean</h3>
                <p className="text-green-100">
                  Making our communities cleaner, one event at a time.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-green-100 hover:text-white">About Us</a></li>
                  <li><a href="#" className="text-green-100 hover:text-white">Events</a></li>
                  <li><a href="#" className="text-green-100 hover:text-white">Communities</a></li>
                  <li><a href="#" className="text-green-100 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
                <p className="text-green-100 mb-4">
                  Join our newsletter to stay updated with the latest events.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name='email'
                    placeholder="Enter your email"
                    className="px-4 py-2 rounded-lg bg-green-700 text-white placeholder-green-200 flex-grow focus:outline-none"
                  />
                  <button className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </>
    );
};

export default LandingPage;