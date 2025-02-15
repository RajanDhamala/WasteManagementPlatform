import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAlert } from '@/UserContext/AlertContext';
import { Check, X } from 'lucide-react';
import axios from 'axios';
import ThreeDotMenu from '@/AiComponnets/ThreeDots';

const ReviewDine = ({ event }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const { setAlert } = useAlert();

  useEffect(() => {
    if (event?.EventReview) {
      setReviews(event.EventReview);
    }
  }, [event]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}event/addreview`,
        {
          title: event.title,
          review: reviewText,
          rating,
        },
        { withCredentials: true }
      );

      if (response.data.statusCode === 200) {
        setReviewText('');
        setShowReviewModal(false);
        setAlert({
          type: 'success',
          message: 'Review added successfully',
        });
        if (response.data.review) {
          setReviews([...reviews, response.data.review]);
        }
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to add review',
      });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}event/removereview/${reviewId}`,
        { withCredentials: true }
      );

      if (response.data.statusCode === 200) {
        setReviews((prevReviews) =>
          prevReviews.filter((review) => review._id !== reviewId)
        );
        setAlert({
          type: 'success',
          message: 'Review deleted successfully',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete review',
      });
    }
  };

  const handleEditReview = (reviewId, reviewText) => {
    setEditingReviewId(reviewId);
    setEditingText(reviewText);
  };

  const handleUpdateReview = async (reviewId) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}event/updatereview/${reviewId}`,
        {
          review: editingText,
        },
        { withCredentials: true }
      );

      if (response.data.statusCode === 200) {
        setReviews((prevReviews) =>
          prevReviews.map((rev) =>
            rev._id === reviewId ? { ...rev, Review: editingText } : rev
          )
        );
        setEditingReviewId(null);
        setEditingText('');
        setAlert({
          type: 'success',
          message: 'Review updated successfully',
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update review',
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
          {reviews.map((review) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-lg"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Write a Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-2xl ${
                          star <= rating ? 'text-yellow-400' : 'text-gray-300'
                        } hover:scale-110 transition-transform`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 min-h-[100px] p-2"
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReviewDine;