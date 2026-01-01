"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight, FileText, Share2, Check } from "lucide-react"
import { Link } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import useStore from "@/ZustandStore/UserStore"
import axios from "axios"

const EventCard = ({
  title = "Beach Cleanup Drive",
  date = "Sat, Mar 15 • 9:00 AM",
  location = "Biratnagar, Nepal",
  EventImg = ["./bg.avif", "./ktm.jpg"],
  status = "pending",
  Peoples: initialPeoples = 24,
}) => {
  const [iscopied, setIscopied] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [Peoples, setPeoples] = useState(initialPeoples)
  const [joinDisabled, setJoinDisabled] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [nextImageLoaded, setNextImageLoaded] = useState(false)

  const setAlert = useStore((state) => state.setAlert)
  const encodedTitle = title

  const currentImage = useMemo(
    () => EventImg[currentImageIndex] || "/images/default-event.jpg",
    [currentImageIndex, EventImg],
  )
  const nextImage = useMemo(() => EventImg[(currentImageIndex + 1) % EventImg.length], [currentImageIndex, EventImg])

  const queryClient = useQueryClient()

  const joinEventMutation = useMutation({
    mutationFn: async (_id) => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/joinEvent`,
        { _id },
        { withCredentials: true },
      )
      return data
    },
    onSuccess: (data) => {
      setAlert({
        type: data.statusCode === 200 ? "success" : "error",
        message: data.message,
        title: data.statusCode === 200 ? "Success" : "Event Error",
      })

      if (data.statusCode === 200) {
        setPeoples((prev) => (isNaN(Number(prev)) ? 1 : Number(prev) + 1))
      }
    },
    onError: (err) => {
      setAlert({ type: "error", message: "Error in joining event" })
    },
    onSettled: () => {
      setTimeout(() => setJoinDisabled(false), 5000)
    },
  })

  const joinEvent = (_id) => {
    if (joinDisabled) return
    setJoinDisabled(true)
    joinEventMutation.mutate(_id)
  }

  useEffect(() => {
    if (!isHovering || EventImg.length <= 1) return

    const intervalId = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % EventImg.length)
    }, 4000)

    return () => clearInterval(intervalId)
  }, [isHovering, EventImg.length])

  // Preload next image for smooth transitions
  useEffect(() => {
    if (nextImage && EventImg.length > 1) {
      const img = new Image()
      img.onload = () => setNextImageLoaded(true)
      img.src = nextImage
    }
  }, [nextImage, EventImg.length])

  const copyToClipboard = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/events/${encodedTitle}`).then(() => {
      setIscopied(true)
      setTimeout(() => setIscopied(false), 2000)
    })
  }

  return (
    <div
      className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 ease-out hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 cursor-pointer border border-gray-100"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        className="relative h-52 overflow-hidden bg-gray-100"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          setCurrentImageIndex(0)
        }}
      >
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        )}

        {/* Main image with smooth transition */}
        <img
          draggable="false"
          loading="lazy"
          src={currentImage || "/placeholder.svg?height=208&width=400"}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = "/images/default-event.jpg"
            setImageLoaded(true)
          }}
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Status badge */}
        <div
          className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border transition-all duration-300 ${
            status === "completed"
              ? "bg-blue-500/90 text-white border-blue-400/50 shadow-lg shadow-blue-500/20"
              : "bg-emerald-500/90 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/20"
          }`}
        >
          {status}
        </div>

        {/* Image navigation */}
        {EventImg.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex((prev) => (prev === 0 ? EventImg.length - 1 : prev - 1))
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setCurrentImageIndex((prev) => (prev + 1) % EventImg.length)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
            >
              <ChevronRight size={18} />
            </button>

            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {EventImg.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "bg-white scale-125 shadow-lg" : "bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Title */}
        <Link
          to={`/events/${encodedTitle}`}
          className="block text-xl font-bold text-gray-900 transition-colors duration-200 hover:text-emerald-600 leading-tight tracking-tight"
        >
          {title}
        </Link>

        {/* Event details */}
        <div className="space-y-3 text-gray-600">
          <div className="flex items-center gap-3 transition-colors duration-200 hover:text-gray-800">
            <Calendar size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-3 transition-colors duration-200 hover:text-gray-800">
            <MapPin size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">{location}</span>
          </div>
          <div className="flex items-center gap-3 transition-colors duration-200 hover:text-gray-800">
            <Users size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">
              <span className="text-gray-900 font-semibold">{Peoples}</span> volunteers joined
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-2">
          {status === "completed" ? (
            <Link
              to={`/eventreport/${encodedTitle}`}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-2 font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
            >
              <FileText size={18} />
              <span>View Report</span>
            </Link>
          ) : (
            <button
              onClick={() => joinEvent(title)}
              disabled={joinDisabled}
              className={`flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 ${
                joinDisabled
                  ? "opacity-50 cursor-not-allowed hover:shadow-none hover:translate-y-0"
                  : "hover:from-emerald-700 hover:to-emerald-800"
              }`}
            >
              {joinDisabled ? "Joining..." : "Join Event"}
            </button>
          )}

          <button
            onClick={copyToClipboard}
            className={`px-4 py-3 border-2 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              iscopied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-gray-200 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 hover:shadow-md"
            }`}
          >
            {iscopied ? (
              <div className="flex items-center gap-2">
                <Check size={18} />
                <span>Copied!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Share2 size={18} />
                <span>Share</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default React.memo(EventCard)
