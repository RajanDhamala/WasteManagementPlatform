import React from "react";
import { Users, Mail, Heart, Globe, Shield, Coffee, Award } from "lucide-react";

const AboutUs = () => {
  const features = [
    { icon: Globe, title: "Global Reach", description: "Connect with homestays worldwide" },
    { icon: Shield, title: "Trusted Platform", description: "Verified hosts and secure bookings" },
    { icon: Heart, title: "Authentic Experience", description: "Real homes, real connections" },
    { icon: Coffee, title: "Local Culture", description: "Immerse in community life" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="relative h-[50vh] lg:h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 transform scale-105"
          style={{
            backgroundImage: `url(https://wsrv.nl?url=https://s3.amazonaws.com/www.explorersweb.com/wp-content/uploads/2023/04/05165958/nepal-1.jpg)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="max-w-4xl px-6">
            <Users className="h-20 w-20 text-emerald-400 mx-auto mb-8" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">About Us</h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
              Discover our journey, mission, and the people behind Homestay Stories.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <feature.icon className="h-10 w-10 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="prose prose-lg max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Homestay Stories was founded with a vision to bring unique and heartfelt homestay experiences
              to travelers worldwide. We believe every homestay has a story, and we are dedicated to
              sharing those stories to inspire meaningful connections.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
              <p className="text-gray-700 leading-relaxed">
                We aim to digitize homestay experiences in Nepal, making them more accessible to travelers
                while supporting local hosts. Our mission is to empower small homestay owners with an
                online presence and help them reach a global audience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Do</h2>
              <ul className="space-y-4">
                {["Showcasing real-life homestay experiences", "Connecting travelers with homestay owners", "Promoting sustainable tourism", "Supporting local communities"].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3 text-gray-700">
                    <Award className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-2xl transform -rotate-2" />
              <div className="absolute inset-0 bg-white rounded-2xl border border-emerald-200 transform rotate-2" />
              <div className="relative bg-white p-6 rounded-2xl border border-emerald-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-4">
                  We'd love to hear from you! Whether you're a traveler or a homestay owner,
                  reach out to us.
                </p>
                <a
                  href="mailto:info@homestaystories.com"
                  className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Mail className="h-5 w-5" />
                  <span>info@homestaystories.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t text-center">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us on our journey to make homestay experiences unforgettable,
            one story at a time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
