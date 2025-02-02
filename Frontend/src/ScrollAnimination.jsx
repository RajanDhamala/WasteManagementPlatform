import React from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';

function ScrollAnimination() {
  return (
    <div className="min-h-screen">
      <section className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center text-white text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <Typewriter
              options={{
                strings: [
                  'Welcome to Our University',
                  'Empowering Future Leaders',
                  'Inspiring Excellence',
                  'Creating Innovation'
                ],
                autoStart: true,
                loop: true,
                delay: 150,
                deleteSpeed: 50,
                pauseFor: 2000,
                wrapperClassName: "typewriter-text",
                cursorClassName: "typewriter-cursor"
              }}
            />
          </h1>
          <p className="text-xl md:text-2xl mb-8">Shaping Tomorrow's Leaders Today</p>
          <motion.button 
            className="bg-white text-blue-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Discover More
          </motion.button>
        </motion.div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[ 
              { number: "15,000+", text: "Students" },
              { number: "500+", text: "Faculty" },
              { number: "50+", text: "Buildings" },
              { number: "100+", text: "Awards" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}  // Base 1 second delay + stagger
              >
                <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</h3>
                  <p className="text-gray-600">{stat.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}  // Added 1 second delay
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Excellence in Education</h2>
              <p className="text-gray-600 mb-8">
                Our institution is dedicated to providing world-class education through innovative
                teaching methods and state-of-the-art facilities.
              </p>
              <motion.button 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}  // Added 1.2 second delay
            >
              {[ 
                { title: "Quality Education" },
                { title: "Expert Faculty" },
                { title: "Research Focus" },
                { title: "Global Network" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-50 p-6 rounded-xl text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}  // Base 1 second delay + stagger
                >
                  <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}  // Added 1 second delay
          >
            Our Achievements
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[ 
              { title: "Best College Award", desc: "2023 Excellence in Education" },
              { title: "Research Excellence", desc: "1000+ Research Papers" },
              { title: "Global Rankings", desc: "Top 100 Worldwide" }
            ].map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 + (index * 0.2) }}  // Base 1 second delay + stagger
              >
                <div className="bg-blue-800 p-8 rounded-xl hover:bg-blue-700 transition-colors">
                  <h3 className="text-2xl font-bold mb-4">{achievement.title}</h3>
                  <p className="text-blue-100">{achievement.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ScrollAnimination;
