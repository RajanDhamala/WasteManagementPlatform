import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ChevronLeft, ChevronRight, LinkIcon, ArrowLeft } from 'lucide-react';
import axios from 'axios';

function SlugEvent() {
  const { title } = useParams();
  const navigate = useNavigate();
  const decodedTitle = decodeURIComponent(title);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState(null);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}event/eventinfo/${decodedTitle}`);
        setEvent(response.data.data);
      } catch (error) {
        setError('Failed to load event details');
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [decodedTitle]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % event.EventImg.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + event.EventImg.length) % event.EventImg.length);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600">{error || 'Event not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery Section */}
          <div className="relative">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              {event.EventImg && event.EventImg.length > 0 && (
                <img
                draggable='false'
                  src={event.EventImg[currentImageIndex]}
                  alt={`Event image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              {event.EventImg && event.EventImg.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-all"
                  >
                    <ChevronLeft className="text-white" size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/30 transition-all"
                  >
                    <ChevronRight className="text-white" size={24} />
                  </button>
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {event.EventImg.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Event Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h1>
              <div className="grid gap-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <span>{event.time} am</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span>{event.VolunteersReq} volunteers needed</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Problem Statement</h2>
                <p className="text-gray-600 leading-relaxed">{event.problemStatement}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 active:bg-green-800 transition-colors">
                Join Event
              </button>
              <button 
                onClick={copyToClipboard}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                aria-label="Share event"
              >
                <LinkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShareToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default SlugEvent;