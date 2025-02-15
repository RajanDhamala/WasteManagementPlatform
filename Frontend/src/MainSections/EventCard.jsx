import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAlert } from "@/UserContext/AlertContext";

const EventCard = ({
  title = "Beach Cleanup Drive",
  date = "Sat, Mar 15 • 9:00 AM",
  location = "Biratnagar, Nepal",
  EventImg = ["./bg.avif", "./ktm.jpg"],
  status = "Active",
  Peoples: initialPeoples = 24,
}) => {
  const [iscopied, setIscopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [Peoples, setPeoples] = useState(initialPeoples);
  const [joinDisabled, setJoinDisabled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false); // NEW: Track if image is loaded

  const { setAlert } = useAlert();

  const encodedTitle = title;

  const joinEvent = async (_id) => {
    if (joinDisabled) return;
    setJoinDisabled(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/joinEvent`,
        { _id },
        { withCredentials: true }
      );

      if (response.data.statusCode === 200) {
        setPeoples((prev) => prev + 1);
        setAlert({ type: "success", message: response.data.message, title: "Success" });
      } else {
        setAlert({ type: "error", message: response.data.message, title: "Event Error" });
      }
    } catch (err) {
      console.log("Error in joining event", err);
      setAlert({ type: "error", message: "Error in joining event" });
    } finally {
      setTimeout(() => {
        setJoinDisabled(false);
      }, 5000);
    }
  };

  useEffect(() => {
    let intervalId;

    if (isHovering && EventImg && EventImg.length > 1) {
      intervalId = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prev) => (prev === EventImg.length - 1 ? 0 : prev + 1));
          setIsTransitioning(false);
        }, 300);
      }, 4000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setCurrentImageIndex(0);
      }
    };
  }, [isHovering, EventImg]);

  const copyToClipboard = (e) => {
    e.stopPropagation();
    const eventLink = `${window.location.origin}/events/${encodedTitle}`;
    navigator.clipboard
      .writeText(eventLink)
      .then(() => {
        setIscopied(true);
        setTimeout(() => setIscopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy: ", err));
  };

  const currentImage = EventImg?.[currentImageIndex] || "/images/default-event.jpg";

  const nextImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % EventImg.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevImage = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev === 0 ? EventImg.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden 
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1
      cursor-pointer"
    >
      <div
        className="relative h-48 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setCurrentImageIndex(0);
        }}
      >
        {/* Skeleton Loader */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <div className="w-full h-full bg-gray-300 rounded-xl" />
          </div>
        )}

        {/* Event Image */}
        <img
          draggable="false"
          loading="lazy"
          src={currentImage}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
            isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
          } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/images/default-event.jpg";
            setImageLoaded(true);
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm transform transition-transform duration-200 hover:scale-105">
          {status}
        </div>

        {/* Image Controls */}
        {EventImg.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div className="p-6">
        <Link
          draggable="false"
          to={`/events/${encodedTitle}`}
          className="text-xl font-bold mb-2 text-gray-800 transition-colors duration-200 hover:text-green-600"
        >
          {title}
        </Link>

        <div className="space-y-2 mb-4 mt-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={18} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span>{Peoples} volunteers joined</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => joinEvent(title)}
            disabled={joinDisabled}
            className={`flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 ${
              joinDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Join Event
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-500 hover:text-green-600"
          >
            {iscopied ? "Copied!" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EventCard);
