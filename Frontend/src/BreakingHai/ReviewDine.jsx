"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, X, Star, MessageSquare, Calendar, User } from "lucide-react"
import axios from "axios"
import ThreeDotMenu from "@/AiComponnets/ThreeDots"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import useStore from "@/ZustandStore/UserStore"

const ReviewDine = ({ event }) => {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [hoverRating, setHoverRating] = useState(0)
  const setAlert = useStore((state) => state.setAlert)
  const queryClient = useQueryClient()

  const CurrentUser = useStore((state) => state.CurrentUser)

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/addreview`,
        {
          title: event.title,
          review: reviewText,
          rating,
        },
        { withCredentials: true },
      )
      console.log(response.data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["event", event.title])
      setReviewText("")
      setShowReviewModal(false)
      setAlert({ type: "success", message: "Review added successfully" })
    },
    onError: (error) => {
      console.error("Mutation Error:", error)
      console.error("Response Data:", error.response?.data)

      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to add review",
      })
      setShowReviewModal(false)
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      const response = await axios.delete(`${import.meta.env.VITE_BASE_URL}event/removereview/${reviewId}`, {
        withCredentials: true,
      })
      return response.data
    },
    onMutate: (reviewId) => {
      queryClient.setQueryData(["event", event.title], (oldData) => {
        if (!oldData) return oldData

        const updatedReviews = oldData.EventReview.filter((review) => review._id !== reviewId)

        return {
          ...oldData,
          EventReview: updatedReviews,
        }
      })
    },
    onSuccess: (data) => {
      setAlert({ type: "success", message: "Review deleted successfully" })
    },
    onError: (error, reviewId) => {
      queryClient.invalidateQueries(["event", event.title])

      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to delete review",
      })
      console.log(`Failed to delete review with ID: ${reviewId}`)
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, editedText }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}review/edit/${reviewId}/${editedText}`,
        {},
        { withCredentials: true },
      )
      console.log(response.data.data)
      return response.data.data
    },
    onSuccess: (updatedReview) => {
      queryClient.setQueryData(["event", event.title], (oldData) => {
        if (!oldData) return oldData

        const updatedEventReview = oldData.EventReview.map((review) =>
          review._id === updatedReview._id
            ? { ...review, Review: updatedReview.Review, updatedAt: new Date().toISOString() }
            : review,
        )
        return {
          ...oldData,
          EventReview: updatedEventReview,
        }
      })
      setEditingReviewId(null)
      setEditingText("")
      setAlert({ type: "info", message: "Review updated successfully" })
    },
    onError: (error) => {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to update review",
      })
    },
  })

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    addReviewMutation.mutate()
  }

  const handleReviewDelete = (reviewId) => {
    deleteReviewMutation.mutate(reviewId)
  }

  const handleEditReview = (reviewId, reviewText) => {
    setEditingReviewId(reviewId)
    setEditingText(reviewText)
  }

  const handleUpdateReview = (reviewId) => {
    updateReviewMutation.mutate({ reviewId, editedText: editingText })
  }

  const ReportReview = async (reviewId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}review/report/${reviewId}`, {
        withCredentials: true,
      })

      if (response.data.statusCode === 200) {
        setAlert({
          type: "update",
          message: response.data.message,
          title: "Event Reported",
        })
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Something went wrong.",
        title: "Error",
      })
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const averageRating =
    event?.EventReview?.length > 0
      ? (event.EventReview.reduce((sum, review) => sum + review.Rating, 0) / event.EventReview.length).toFixed(1)
      : 0

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10">
          {/* Reviews Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer Reviews</h2>
              </div>

              {event?.EventReview?.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{averageRating}</span>
                    <span>average rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>
                      {event.EventReview.length} {event.EventReview.length === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowReviewModal(true)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-semibold"
            >
              <Star className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {event?.EventReview?.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                <Button
                  onClick={() => setShowReviewModal(true)}
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  Write the first review
                </Button>
              </div>
            ) : (
              event.EventReview.map((review, index) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <img
                            src={review.Reviewer.ProfileImage || "/placeholder.svg?height=48&width=48"}
                            alt={review.Reviewer.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {review.Reviewer.name || "Anonymous User"}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.Rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{review.Rating}/5</span>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(review.createdAt)}</span>
                            {review.updatedAt !== review.createdAt && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Edited
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <ThreeDotMenu
                        onDelete={() => handleReviewDelete(review._id)}
                        onEdit={() => handleEditReview(review._id, review.Review)}
                        onReport={() => ReportReview(review._id)}
                        showDetails={CurrentUser && CurrentUser._id === review.Reviewer._id}
                      />
                    </div>

                    {/* Review Content */}
                    {editingReviewId === review._id ? (
                      <div className="space-y-4">
                        <Textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="min-h-[120px] resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                          placeholder="Edit your review..."
                        />
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingReviewId(null)
                              setEditingText("")
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReview(review._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.Review}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg mx-4"
            >
              <Card className="shadow-2xl border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-white hover:bg-white/20"
                    onClick={() => setShowReviewModal(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    Write Your Review
                  </CardTitle>
                  <p className="text-emerald-100 mt-1">Share your experience with others</p>
                </CardHeader>

                <CardContent className="p-6">
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900">
                        How would you rate your experience?
                      </Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 hover:text-gray-400"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-sm font-medium text-gray-600">{rating}/5 stars</span>
                      </div>
                    </div>

                    {/* Review Text Section */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold text-gray-900">Share your thoughts</Label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us what you loved or what we could improve. Your feedback helps others make informed decisions..."
                        className="min-h-[140px] resize-none border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                        required
                      />
                      <div className="text-right text-sm text-gray-500">{reviewText.length}/500 characters</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewModal(false)}
                        className="px-6"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!rating || !reviewText.trim() || addReviewMutation.isLoading}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 shadow-lg"
                      >
                        {addReviewMutation.isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default ReviewDine
