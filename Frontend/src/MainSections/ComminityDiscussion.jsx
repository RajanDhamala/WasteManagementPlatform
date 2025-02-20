import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trophy, Users, Heart, Share2, ThumbsUp, Star, MessageSquare, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RankingList from '@/BreakingHai/Ranking';

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState('discussions');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="relative overflow-hidden mb-16">
        <img 
          src="/api/placeholder/1920/600" 
          alt="Community" 
          className="w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-green-600/80 flex items-center">
          <motion.div 
            className="container mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Join Our EcoClean Community
            </h1>
            <p className="text-xl text-green-50 max-w-2xl mb-8">
              Together, we're building a sustainable future through community action, shared knowledge, and collective impact.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
              >
                Join Community
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg"
              >
                Start Discussion
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-32 mb-16 relative z-10">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { title: "Active Members", value: "100K+", icon: <Users className="w-8 h-8" /> },
            { title: "Cleanups Completed", value: "5,000+", icon: <Trophy className="w-8 h-8" /> },
            { title: "Waste Collected", value: "1M+ kg", icon: <Star className="w-8 h-8" /> }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-4xl font-bold text-green-800">{stat.value}</div>
                  <div className="text-gray-600">{stat.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Community Leaders
      <div className="container mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-green-800 mb-8">Community Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="group"
              >
                <Card className="overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
                  <div className="relative">
                    <img 
                      src="https://imgs.search.brave.com/MayKRj10vMcM3lSoKCsbGdQaE_gg-41iGfU2mYy_HPM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbGlu/aWNvbmUuY29tLm5w/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDIz/LzEyL0RyLUdhbmVz/aC1MYW1hLTM1MHgz/MDAuanBn" 
                      alt="Community Leader" 
                      className="w-full h-48 object-cover"
                      loading='lazy'
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white text-xl font-bold">Dr. Sarah Johnson</h3>
                      <p className="text-green-100">Environmental Scientist</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">Led 50+ cleanup initiatives and contributed to policy changes</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="text-green-700 font-medium">25,000 kg collected</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-green-600 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div> */}
      <RankingList/>

      {/* Discussions Section */}
      <div className="bg-green-50 py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-green-800">Latest Discussions</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg"
            >
              Start New Topic
            </motion.button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img 
                        src="/api/placeholder/100/100" 
                        alt="Avatar" 
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-green-700 mb-2">
                          Best practices for organizing beach cleanups
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {['Beach', 'Organization', 'Tips'].map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-6 text-gray-600">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>45 replies</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4" />
                            <span>156 likes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Join our community of environmental champions and be part of the solution.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
            >
              Join Now
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;