import React, { useState, useEffect, useMemo } from "react";
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlert } from "@/UserContext/AlertContext";
import axios from "axios";

const EventCard = ({
  title = "Beach Cleanup Drive",
  date = "Sat, Mar 15 • 9:00 AM",
  location = "Biratnagar, Nepal",
  EventImg = ["./bg.avif", "./ktm.jpg"],
  status = "pending",
  Peoples: initialPeoples = 24,
}) => {
  const [iscopied, setIscopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [Peoples, setPeoples] = useState(initialPeoples);
  const [joinDisabled, setJoinDisabled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const { setAlert } = useAlert();
  const encodedTitle = title;

  // Memoized event image to prevent unnecessary re-renders
  const currentImage = useMemo(() => EventImg[currentImageIndex] || "/images/default-event.jpg", [currentImageIndex, EventImg]);

  const queryClient = useQueryClient();

  // Mutation for joining the event
  const joinEventMutation = useMutation({
    mutationFn: async (_id) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/joinEvent`,
        { _id },
        { withCredentials: true }
      );
      return data;
    },
    onSuccess: (data) => {
      setAlert({
        type: data.statusCode === 200 ? "success" : "error",
        message: data.message,
        title: data.statusCode === 200 ? "Success" : "Event Error",
      });

      if (data.statusCode === 200) {
        setPeoples((prev) => (isNaN(Number(prev)) ? 1 : Number(prev) + 1));
      }
      
    },
    onError: (err) => {
      setAlert({ type: "error", message: "Error in joining event" });
    },
    onSettled: () => {
      setTimeout(() => setJoinDisabled(false), 5000);
    },
  });

  const joinEvent = (_id) => {
    if (joinDisabled) return;
    setJoinDisabled(true);
    joinEventMutation.mutate(_id);
  };

  useEffect(() => {
    if (!isHovering || EventImg.length <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % EventImg.length);
    }, 4000);

    return () => clearInterval(intervalId);
  }, [isHovering, EventImg.length]);

  const copyToClipboard = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/events/${encodedTitle}`).then(() => {
      setIscopied(true);
      setTimeout(() => setIscopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer">
      <div
        className="relative h-48 overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setCurrentImageIndex(0);
        }}
      >
        {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

        <img
          draggable="false"
          loading="lazy"
          src={currentImage}
          alt={title}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/images/default-event.jpg";
            setImageLoaded(true);
          }}
        />

        <div className={`absolute top-4 right-4 ${status === "completed" ? "bg-blue-500" : "bg-green-500"} text-white px-3 py-1 rounded-full text-sm`}>
          {status}
        </div>

        {EventImg.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev === 0 ? EventImg.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex((prev) => (prev + 1) % EventImg.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div className="p-6">
        <Link to={`/events/${encodedTitle}`} className="text-xl font-bold mb-2 text-gray-800 transition-colors duration-200 hover:text-green-600">
          {title}
        </Link>

        <div className="space-y-2 mb-4 mt-2 text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>{Peoples} volunteers joined</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {status === "completed" ? (
            <Link 
              to={`/eventreport/${encodedTitle}`}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <FileText size={18} />
              <span>See Report</span>
            </Link>
          ) : (
            <button
              onClick={() => joinEvent(title)}
              disabled={joinDisabled}
              className={`flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 ${joinDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Join Event
            </button>
          )}
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