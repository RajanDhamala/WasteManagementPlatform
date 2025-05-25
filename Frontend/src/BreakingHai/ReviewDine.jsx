import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import axios from 'axios';
import ThreeDotMenu from '@/AiComponnets/ThreeDots';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useStore from '@/ZustandStore/UserStore';

const ReviewDine = ({ event }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const { setAlert } = useAlert();
  const queryClient = useQueryClient();

  const CurrentUser=useStore((state)=>state.CurrentUser)

  const addReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/addreview`,
        {
          title: event.title,
          review: reviewText,
          rating,
        },
        { withCredentials: true }
      );
      console.log(response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['event', event.title]);
      setReviewText('');
      setShowReviewModal(false);
      setAlert({ type: 'success', message: 'Review added successfully' });
    },
    onError: (error) => {
      console.error("Mutation Error:", error); // Debugging
      console.error("Response Data:", error.response?.data); // Log the response
    
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to add review",
      });
      setShowReviewModal(false);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId) => {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}event/removereview/${reviewId}`,
        { withCredentials: true }
      );
      return response.data;
    },
    onMutate: (reviewId) => {
      queryClient.setQueryData(['event', event.title], (oldData) => {
        if (!oldData) return oldData;
  
        const updatedReviews = oldData.EventReview.filter(
          (review) => review._id !== reviewId
        );
  
        return {
          ...oldData,
          EventReview: updatedReviews, 
        };
      });
    },
    onSuccess: (data) => {
      setAlert({ type: 'success', message: 'Review deleted successfully' });
    },
    onError: (error, reviewId) => {
      queryClient.invalidateQueries(['event', event.title]);
  
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete review',
      });
      console.log(`Failed to delete review with ID: ${reviewId}`);
    },
  });
  

  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, editedText }) => {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}review/edit/${reviewId}/${editedText}`,
        {},
        { withCredentials: true }
      );
      console.log(response.data.data);
      return response.data.data;
    },
    onSuccess: (updatedReview) => {
      queryClient.setQueryData(['event', event.title], (oldData) => {
        if (!oldData) return oldData;
    
        const updatedEventReview = oldData.EventReview.map((review) =>
          review._id === updatedReview._id
            ? { ...review, Review: updatedReview.Review, updatedAt: new Date().toISOString() } 
            : review
        );
        return {
          ...oldData,
          EventReview: updatedEventReview, 
        };
      });
      setEditingReviewId(null);
      setEditingText('');
      setAlert({ type: 'info', message: 'Review updated successfully' });
    },
    
    
    onError: (error) => {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update review',
      });
    },
  });
  

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addReviewMutation.mutate();
  };

  const handleReviewDelete = (reviewId) => {
    deleteReviewMutation.mutate(reviewId);
  };

  const handleEditReview = (reviewId, reviewText) => {
    setEditingReviewId(reviewId);
    setEditingText(reviewText); 
  };

  const handleUpdateReview = (reviewId) => {
    updateReviewMutation.mutate({ reviewId, editedText: editingText });
  };

  const ReportReview = async (reviewId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}review/report/${reviewId}`,
        { withCredentials: true }
      );

      if (response.data.statusCode === 200) {
        setAlert({
          type: 'update',
          message: response.data.message,
          title: 'Event Reported',
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: error.response?.data?.message || 'Something went wrong.',
        title: 'Error',
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Reviews</h2>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Write a Review
          </button>
        </div>

        <div className="space-y-6">
          {event?.EventReview?.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <img
                    src={review.Reviewer.ProfileImage || '/default-avatar.png'}
                    alt={review.Reviewer.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {review.Reviewer.name || 'Anonymous'}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-lg ${
                            i < review.Rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <ThreeDotMenu
                  onDelete={() => handleReviewDelete(review._id)}
                  onEdit={() => handleEditReview(review._id, review.Review)}
                  onReport={() => ReportReview(review._id)}
                  {
                    ...(CurrentUser && CurrentUser._id === review.Reviewer._id) 
                    ? { showDetails: true } 
                    : { showDetails: false }
                  }
                />
              </div>

              {editingReviewId === review._id ? (
                <div className="mt-4">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px] p-3 text-gray-700"
                    placeholder="Edit your review..."
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setEditingReviewId(null);
                        setEditingText('');
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateReview(review._id)}
                      className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    >
                      <Check size={16} />
                      Submit
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-gray-600">{review.Review}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg"
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="relative pb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4"
                    onClick={() => setShowReviewModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-2xl font-bold">Write a Review</CardTitle>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-base">How would you rate your experience?</Label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-all hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base">Share your thoughts</Label>
                      <Textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us what you loved or what we could improve..."
                        className="min-h-[120px] resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!rating || !reviewText.trim() || addReviewMutation.isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {addReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
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
  );
};

export default ReviewDine;