import { useState } from "react"
import { Calendar, Import, Search } from "lucide-react"
import EventCard from "./EventCard"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import useStore from "@/ZustandStore/UserStore"
import axios from 'axios'
import { useQuery } from "@tanstack/react-query"


const LandingPage = () => {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])

  const [email,setemail]=useState('')
 const setAlert=useStore((state)=>state.setAlert)

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const fetchHomeEvents=async()=>{
   const response=await axios.get(`${import.meta.env.VITE_BASE_URL}event/home`)
   console.log(response.data)
   return response.data
  }
  const {data,isError,isLoading,error}=useQuery({
    queryKey:['HomeEvents'],
    queryFn:fetchHomeEvents,
    staleTime: 10 * 60 * 1000, 
  onSuccess: (data) => {
    console.log('Fetched Home Events:', data);
  },
  })
  
  const SubscribeDb = async () => {
    if (!validateEmail(email)) {
      setAlert({ type: 'error', message: 'Invalid email address.' });
      return;
    }
    console.log(email);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/subscribe`,
        { email }
      );
      console.log(response.data);
      if (response.data.statusCode === 200) {
        setAlert({ type: 'success', message: response.data.message});
      } else if (response.data.statusCode === 400) {
        setAlert({ type: 'error', message: response.data.message });
      }
    } catch (err) {
      console.log(err);
      setAlert({ type: 'error', message: 'Error in subscribing' });
    }
  };

  return (
    <>
      <motion.div
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: "url('./bg.avif')",
          opacity,
          scale,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 pt-16">
          <main className="max-w-7xl mx-auto px-4 py-12 md:mt-20 relative z-0">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">Join the Clean Community Movement</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
                Connect with local volunteers and make a difference in your community through organized cleanup events.
              </p>
              <motion.div
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <motion.button
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Now
                </motion.button>
                <motion.button
                  className="bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-8 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search for events..."
                  className="w-full p-3 pl-10 rounded-full border-0 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-3 text-white/70" size={20} />
              </div>
            </motion.div>
          </main>
        </div>
      </motion.div>

      {/* Events Section */}
      <div className="bg-gradient-to-b from-gray-100 to-green-50 py-16">
        <motion.div
          className="w-full h-0.5 bg-gray-300 mb-3"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        />
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Upcoming Clean-Up Events</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join these community events and help make our environment cleaner and greener
            </p>
          </motion.div>          {/* Events Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4, staggerChildren: 0.1 }}
          >
            {isLoading ? (
              // Loading skeleton
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-4 shadow-lg animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : isError ? (
              <div className="col-span-full text-center text-red-600">
                Error loading events: {error?.message || 'Something went wrong'}
              </div>
            ) : (
              data?.map((event) => (
               <EventCard
  key={event._id}
  title={event.title}
  date={new Date(`${event.date}T${event.time}`).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}
  location={event.location}
  EventImg={event.EventImg.length > 0 ? event.EventImg : ['./defulthu.jpg']}
  status={event.EventStatus}
  Peoples={event.participantCount}
/>

              ))
            )}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg inline-flex items-center gap-2"
              to={"/events"}
            >
              View All Events
              <Calendar size={20} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, staggerChildren: 0.1 }}
          >
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <h3 className="text-xl font-bold mb-4">EcoClean</h3>
              <p className="text-green-100">Making our communities cleaner, one event at a time.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-green-100 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <Link to='/events' className="text-green-100 hover:text-white">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to='/community' className="text-green-100 hover:text-white">
                    Communities
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-green-100 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <p className="text-green-100 mb-4">Join our newsletter to stay updated with the latest events.</p>
              <div className="flex gap-2">
              <input
              type="email"
              onChange={(e) => setemail(e.target.value)}
              value={email}
              placeholder="Enter your email"
              name="email"
              required
              className="px-4 py-2 rounded-lg bg-green-700 text-white placeholder-green-200 flex-grow focus:outline-none"
              />

                <motion.button
                  className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e)=>SubscribeDb()}
                >
                  Subscribe
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </footer>
    </>
  )
}

export default LandingPage

