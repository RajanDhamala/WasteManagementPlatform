import React, { useState, useCallback } from 'react';
import EventCard from './EventCard';
import { Camera, Calendar, MapPin, Users, Plus, Clock, X, Loader2,
Filter, CheckCircle, AlertCircle, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import axios from 'axios';
import Alert from '@/AiComponnets/Alert';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const SkeletonLoader = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(8)].map((_, index) => (
      <div key={index} className="animate-pulse bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-48 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const fetchEvents = async (filter = 'all') => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}event/loadevents`, {
      params: { filter },
      withCredentials: true,
    });

    if (response.data.statusCode === 200) {
      return response.data.data; 
    }
    throw new Error(response.data.message);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch events');
  }
};


function EventSection() {
  const initialFormState = {
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    requiredVolunteers: '',
    images: [],
    problemStatement: '',
  };

  const [alert, setAlert] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Events', icon: <Filter size={20} /> },
    { value: 'latest', label: 'Latest', icon: <ArrowDownAZ size={20} /> },
    { value: 'oldest', label: 'Oldest', icon: <ArrowUpAZ size={20} /> },
    { value: 'completed', label: 'Completed', icon: <CheckCircle size={20} /> },
    { value: 'pending', label: 'Pending', icon: <AlertCircle size={20} /> }
  ];

  const { data: eventinfo, isLoading, error } = useQuery({
    queryKey: ['events', selectedFilter],
    queryFn: () => fetchEvents(selectedFilter),
    staleTime: 1000 * 60 * 5,
  });

  const handleFilterSelect = (value) => {
    setSelectedFilter(value);
    setIsFilterOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const remainingSlots = 3 - formData.images.length;
    const allowedFiles = files.slice(0, remainingSlots);

    if (remainingSlots <= 0) {
      alert('Maximum 3 images allowed');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...allowedFiles].slice(-3),
    }));

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(allowedFiles[allowedFiles.length - 1]);
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      images: [], 
    });
    setImagePreview(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files)
        .filter((file) => file.type.startsWith('image/'))
        .slice(0, 3 - formData.images.length);

      if (!files.length) return;

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files].slice(-3),
      }));

      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(files[files.length - 1]);
    },
    [formData.images.length]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.images.length) return alert('Please select at least one image');

    setIsSubmitting(true);
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'images') formDataToSend.append(key, value);
    });

    formData.images.forEach((image) => formDataToSend.append('images', image));

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/eventform`,
        formDataToSend,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.statusCode === 200) {
        setAlert({ type: 'success', message: 'Event Created Successfully!', title: 'Success' });
        setFormData(initialFormState);
        setImagePreview(null);
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Error creating event',
        title: 'Error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Community Events</h2>
          <div className="flex items-center gap-4">
            {/* Add Filter Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {filterOptions.find(opt => opt.value === selectedFilter)?.icon}
                <span>{filterOptions.find(opt => opt.value === selectedFilter)?.label}</span>
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterSelect(option.value)}
                      className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors
                        ${selectedFilter === option.value ? 'bg-gray-50' : ''}`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Create Event
            </button>
          </div>
        </div>
                          {isLoading ? (
                    <SkeletonLoader />
                  ) : error ? (
                    <p className="text-red-500">{error.message}</p>
                  ) : eventinfo.length === 0 ? (
                    <div className="flex flex-col justify-center items-center text-center py-20">
                      <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-gray-700 mb-4">
                          No Events Available
                        </h2>
                        <p className="text-gray-500 mb-6">
                          It looks like there are no events scheduled at the moment. Please check back later or create your own event to get started!
                        </p>
                        <button
                          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                          onClick={() => {
                            setIsCreateModalOpen(true)
                          }}
                        >
                          Create Event
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {eventinfo.map((event, index) => (
                        <EventCard
                          key={event._id || index}
                          title={event.title}
                          date={new Date(event.date).toDateString()}
                          location={event.location}
                          Peoples={event.participantCount}
                          EventImg={event.EventImg}
                          status={event.EventStatus}
                        />
                      ))}
                    </div>
                  )}


        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl transform transition-all"
              style={{
                animation: 'modal-pop 0.3s ease-out',
              }}
            >
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
                <p className="text-green-100 mt-1">
                  Fill in the details to create a new community event
                </p>
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
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
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
                        <Clock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={18}
                        />
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
                      <MapPin
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
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
                      <Users
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={18}
                      />
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
                                  Click to {formData.images.length >= 3 ? 'change' : 'add more'} images ({formData.images.length}/3)
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
                                Drop your images here, or <span className="text-green-600">browse</span>
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
                      disabled={isSubmitting}
                      className={`px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Creating Event...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>Create Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(EventSection);
