import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {Calendar,MapPin,Users,Clock,ChevronLeft,ChevronRight,ArrowLeft,AlertTriangle,User,Share2,Heart,Eye,} from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import useStore from "@/ZustandStore/UserStore"
import ReviewDine from "../BreakingHai/ReviewDine"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"

const fetchEventDetails = async (decodedTitle) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}event/eventinfo/${decodedTitle}`)
  return response.data.data
}

function SlugEvent() {
  const { title } = useParams()
  const navigate = useNavigate()
  const decodedTitle = decodeURIComponent(title)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showShareToast, setShowShareToast] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [otherReason, setOtherReason] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const setAlert = useStore((state) => state.setAlert)
  const queryClient = useQueryClient()

  const reportReasons = [
    "Fraudulent event",
    "Incorrect location",
    "Invalid date/time",
    "Inappropriate content",
    "Misleading information",
    "Spam",
    "Other",
  ]

  const {
    data: event,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["event", decodedTitle],
    queryFn: () => fetchEventDetails(decodedTitle),
    enabled: !!decodedTitle,
  })

  const nextImage = () => {
    if (event && event.EventImg) {
      setCurrentImageIndex((prev) => (prev + 1) % event.EventImg.length)
    }
  }

  const prevImage = () => {
    if (event && event.EventImg) {
      setCurrentImageIndex((prev) => (prev - 1 + event.EventImg.length) % event.EventImg.length)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowShareToast(true)
    setTimeout(() => setShowShareToast(false), 3000)
  }

  const handleReport = async (e) => {
    e.preventDefault()
    try {
      const finalReason = reportReason === "Other" ? otherReason : reportReason
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/report`,
        {
          title: event._id,
          issue: finalReason,
        },
        { withCredentials: true },
      )

      if (response.data.statusCode === 200) {
        setAlert({
          type: "success",
          message: "Event reported successfully",
          title: "Report Submitted",
        })
        setShowReportModal(false)
        setReportReason("")
        setOtherReason("")
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to report event",
        title: "Report Failed",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button skeleton */}
          <div className="h-10 w-20 bg-gray-200 rounded-lg mb-8 animate-pulse"></div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Image skeleton */}
            <div className="lg:col-span-2">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 animate-pulse shadow-lg"></div>
            </div>

            {/* Content skeleton */}
            <div className="space-y-6">
              <div className="h-10 w-3/4 bg-gray-200 rounded-lg animate-pulse"></div>

              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>

              <div className="flex gap-3">
                <div className="h-14 flex-1 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-14 w-14 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error?.message || "Event not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-all duration-200 hover:gap-3 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:transform group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Events</span>
        </motion.button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-2xl group">
              {event.EventImg && event.EventImg.length > 0 && (
                <img
                  draggable={false}
                  src={event.EventImg[currentImageIndex] || "/placeholder.svg"}
                  alt={`Event image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}

              {/* Image Navigation */}
              {event.EventImg && event.EventImg.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="text-white" size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="text-white" size={24} />
                  </button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {event.EventImg.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all duration-200 ${
                          index === currentImageIndex ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/75"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Image Counter */}
              {event.EventImg && event.EventImg.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {currentImageIndex + 1} / {event.EventImg.length}
                </div>
              )}
            </div>

            {/* Problem Statement - Below Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Problem Statement</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{event.problemStatement}</p>
              </div>
            </motion.div>

            {/* Action Buttons - Below Problem Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex flex-wrap gap-4 items-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Join Event
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                className="p-4 border-2 border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 transition-all duration-200 group"
                aria-label="Share event"
              >
                <Share2 className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReportModal(true)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all duration-200 group"
                aria-label="Report event"
              >
                <AlertTriangle className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Title and Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{event.title}</h1>
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isLiked ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{event.time} AM</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{event.VolunteersReq} volunteers needed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700 group">
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium">Hosted by: {event?.Host?.[0]?.name || "Anonymous"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">About This Event</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{event.description}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Link copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Report Event</h3>
              </div>

              <form onSubmit={handleReport} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Why are you reporting this event?
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 shadow-sm py-3 px-4 focus:border-red-500 focus:ring-red-500 focus:ring-2 focus:ring-opacity-20 transition-all duration-200"
                    required
                  >
                    <option value="">Select a reason</option>
                    {reportReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>

                {reportReason === "Other" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Please provide details</label>
                    <textarea
                      value={otherReason}
                      onChange={(e) => setOtherReason(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-red-500 focus:ring-red-500 focus:ring-2 focus:ring-opacity-20 px-4 py-3 transition-all duration-200 resize-none"
                      rows={4}
                      placeholder="Describe the issue in detail..."
                      required
                    />
                  </motion.div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(false)
                      setReportReason("")
                      setOtherReason("")
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors duration-200 shadow-lg"
                  >
                    Submit Report
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReviewDine event={event} />
    </div>
  )
}

export default SlugEvent
