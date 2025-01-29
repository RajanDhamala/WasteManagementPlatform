import React, { useState } from 'react';
import EventCard from './EventCard';
import { Camera, Calendar, MapPin, Users, Plus, Clock, X, Upload } from 'lucide-react';
import axios from 'axios';

function EventSection() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    requiredVolunteers: '',
    images: [],
    problemStatement: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      const currentCount = formData.images.length;
      const remainingSlots = 3 - currentCount;
      const allowedFiles = files.slice(0, remainingSlots);

      if (currentCount >= 3) {
        alert('Maximum 3 images allowed. Please remove existing images to add new ones.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...allowedFiles].slice(-3) 
      }));
      
   
      const latestFile = allowedFiles[allowedFiles.length - 1];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(latestFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length > 0) {
      const currentCount = formData.images.length;
      const remainingSlots = 3 - currentCount;
      const allowedFiles = files.slice(0, remainingSlots);

      if (currentCount >= 3) {
        alert('Maximum 3 images allowed');
        return;
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...allowedFiles].slice(-3)
      }));
      
      const latestFile = allowedFiles[allowedFiles.length - 1];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(latestFile);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      images: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('requiredVolunteers', formData.requiredVolunteers);
      formDataToSend.append('problemStatement', formData.problemStatement);
      
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/AddEvent`,
        formDataToSend,  
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data', 
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setIsCreateModalOpen(false);
        setImagePreview(null);
        setFormData({
          title: '',
          date: '',
          time: '',
          location: '',
          description: '',
          requiredVolunteers: '',
          images: [],
          problemStatement: '',
        });
        
       
        alert('Event created successfully!');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Error creating event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:mt-18 mt-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Community Events</h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              
              />
          {/* Add more EventCards here */}
        </div>

        {/* Create Event Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div 
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl transform transition-all"
              style={{
                animation: 'modal-pop 0.3s ease-out'
              }}
            >
              {/* Sticky header with higher z-index */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">Create New Event</h3>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-green-100 mt-1">Fill in the details to create a new community event</p>
              </div>

              {/* Scrollable content with hidden scrollbar */}
              <div className="overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* Title Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Event Title
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter a descriptive title for your event"
                      required
                    />
                  </div>

                  {/* Date and Time Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Date
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Time
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Location
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Enter event location"
                        required
                      />
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Description
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="Describe your event in detail..."
                      required
                    ></textarea>
                  </div>

                  {/* Problem Statement Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Problem Statement
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      name="problemStatement"
                      value={formData.problemStatement}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="What problem will this event address?"
                      required
                    ></textarea>
                  </div>

                  {/* Volunteers Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Required Volunteers
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="number"
                        name="requiredVolunteers"
                        value={formData.requiredVolunteers}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Number of volunteers needed"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Event Images
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div 
                      className={`relative border-2 border-dashed rounded-xl transition-all duration-300 
                        ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'} 
                        ${imagePreview ? 'border-solid' : 'hover:border-green-500 hover:bg-green-50'}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        name="images"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="event-images"
                        multiple
                        required
                      />
                      <label
                        htmlFor="event-images"
                        className="flex flex-col items-center justify-center w-full min-h-[200px] cursor-pointer"
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full group">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-[200px] object-cover rounded-xl"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-xl flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex flex-col items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleRemoveImage}
                                  className="bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                                >
                                  <X size={20} className="text-gray-600" />
                                </button>
                                <p className="text-white text-sm">
                                  Click to {formData.images.length >= 3 ? 'change' : 'add more'} images 
                                  ({formData.images.length}/3)
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 text-center p-6">
                            <div className="mx-auto w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Camera className="h-10 w-10 text-gray-400 group-hover:text-green-500 transition-colors" />
                            </div>
                            <div>
                              <p className="text-base font-medium text-gray-700">
                                Drop your images here, or{" "}
                                <span className="text-green-600">browse</span>
                              </p>
                              <p className="text-sm text-gray-500 mt-2">
                                Supports: JPG, PNG, GIF, SVG, WEBP
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Select up to 3 images (10MB each)
                              </p>
                              {formData.images.length > 0 && (
                                <div className="space-y-1 mt-2">
                                  <p className="text-xs text-green-600">
                                    {formData.images.length}/3 images selected
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {3 - formData.images.length} more {3 - formData.images.length === 1 ? 'image' : 'images'} can be added
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Create Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Updated CSS with scrollbar styling */}
      <style jsx>{`
        @keyframes modal-pop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}

export default EventSection;