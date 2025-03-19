import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, User, MessageSquare, Image, MessageCircle, ThumbsUp, Send } from 'lucide-react';
import useUserContext from '@/hooks/useUserContext';
import { useParams } from "react-router-dom";
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const EventReportSection = () => {
  let { title } = useParams();
  const [newComment, setNewComment] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newReplies, setNewReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});

  const { CurrentUser } = useUserContext();
  const queryClient = useQueryClient();
  const Navigate = useNavigate();

  const handleRouting = () => {
    Navigate(`/events/${title}`);
  };

  const FetchReport = async () => {
    const response = await axios.get(`http://localhost:8000/report/final/${title}`, { withCredentials: true });
    return response.data.data;
  };

  const FetchPost = async () => {
    const response = await axios.get(`http://localhost:8000/community/post/${title}`, { withCredentials: true });
    return response.data.data;
  };

  const LikeDislikeDiscussion = async (discussionId) => {
    const response = await axios.post(
      `http://localhost:8000/community/like/${discussionId}`,
      {},
      { withCredentials: true }
    );
    return response.data;
  };

  const { data: eventReport, isLoading, isError } = useQuery({
    queryKey: ['EventReport', title],
    queryFn: FetchReport
  });

  const postReplyMutation = useMutation({
    mutationFn: async ({ discussionId, content, parentCommentId }) => {
      const response = await axios.post(
        'http://localhost:8000/community/postReply',
        { discussionId, content, parentCommentId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Reply posted successfully!');
      setNewReplies({});
      setShowReplyInput({});
      queryClient.invalidateQueries(['EventReport', title]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    },
  });

  const postDiscussionMutation = useMutation({
    mutationFn: async ({ content, eventId }) => {
      const response = await axios.post(
        'http://localhost:8000/community/postTopic',
        { content, eventId: eventId === 'all' ? null : eventId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Discussion posted successfully!');
      setNewDiscussion('');
      queryClient.invalidateQueries(['EventReport', title]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post discussion');
    },
  });

  const LikeUnlike = useMutation({
    mutationFn: LikeDislikeDiscussion,
    onMutate: async (discussionId) => {
      const prevData = queryClient.getQueryData(['EventReport', title]);
      queryClient.setQueryData(['EventReport', title], (oldData) => {
        return {
          ...oldData,
          communityPosts: oldData.communityPosts.map(discussion => {
            if (discussion._id === discussionId) {
              return {
                ...discussion,
                hasLiked: !discussion.hasLiked,
                likesCount: discussion.likesCount + (discussion.hasLiked ? -1 : 1)
              };
            }
            return discussion;
          })
        };
      });
      return { prevData };
    },
    onError: (err, discussionId, context) => {
      queryClient.setQueryData(['EventReport', title], context.prevData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['EventReport', title]);
    }
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    postDiscussionMutation.mutate({
      content: newComment,
      eventId: title
    });
    setNewComment('');
  };

  const handleReplySubmit = (e, discussionId) => {
    e.preventDefault();
    postReplyMutation.mutate({
      discussionId,
      content: newReplies[discussionId],
      parentCommentId: null
    });
  };

  const toggleReplyInput = (discussionId) => {
    setShowReplyInput(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  const handleLike = (discussionId) => {
    LikeUnlike.mutate(discussionId);
  };

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const eventData = {
    title: "Community Park Cleanup",
    hostedBy: "Green City Initiative",
    date: "February 20, 2025",
    time: "9:00 AM - 2:00 PM",
    location: "Central City Park, 123 Park Avenue",
    participants: [
      { id: 1, name: "John Smith", role: "Volunteer" },
      { id: 2, name: "Sarah Johnson", role: "Organizer" },
      { id: 3, name: "Mike Peterson", role: "Volunteer" },
      { id: 4, name: "Lisa Chen", role: "Sponsor" },
    ],
    reviews: [
      { id: 1, author: "John Smith", rating: 5, comment: "Great event! We collected over 50 bags of trash." },
      { id: 2, author: "Sarah Johnson", rating: 4, comment: "Well organized, but we could use more tools next time." }
    ],
    galleryImages: [
      { id: 1, url: "https://res.cloudinary.com/dy78jnaye/image/upload/f_auto,q_auto/v1/event_images/1739928266678?_a=BAMCkGWM0", caption: "Volunteers gathering at the start" },
      { id: 2, url: "/api/placeholder/600/400", caption: "Team cleaning the riverside" },
      { id: 3, url: "/api/placeholder/600/400", caption: "Local news coverage" },
      { id: 4, url: "/api/placeholder/600/400", caption: "Lunch break" },
      { id: 5, url: "/api/placeholder/600/400", caption: "Group photo at the end" },
      { id: 6, url: "/api/placeholder/600/400", caption: "Bags of collected trash" }
    ],
    beforeAfterImages: [
      { id: 1, type: "before", url: "https://res.cloudinary.com/dy78jnaye/image/upload/f_auto,q_auto/v1/event_images/1739928266678?_a=BAMCkGWM0", caption: "Before the cleanup" },
      { id: 2, type: "after", url: "https://res.cloudinary.com/dy78jnaye/image/upload/f_auto,q_auto/v1/event_images/1739253682201?_a=BAMCkGWM0", caption: "After the cleanup" }
    ],
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Hero section with event title and basic info */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{eventReport?.heading.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{eventData.hostedBy}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{eventReport?.heading.date}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{eventReport?.heading.location}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Before & After section */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <Image className="h-5 w-5 mr-2 text-blue-500" />
                Before & After
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {eventData.beforeAfterImages.map(image => (
                  <div key={image.id} className="space-y-2">
                    <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <img 
                        src={image.url} 
                        alt={image.caption} 
                        className="w-full h-64 object-cover cursor-pointer transform hover:scale-105 transition-transform duration-300"
                        onClick={() => openImageModal(image)}
                      />
                    </div>
                    <p className="text-center text-gray-600 font-medium">{image.caption}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Discussion section */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                Community Discussion
              </h2>
              <div className="space-y-6">
                {eventReport?.communityPosts?.map((discussion) => (
                  <div key={discussion._id} className="border-l-4 border-blue-100 pl-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={discussion.postedBy.ProfileImage}
                        alt={discussion.postedBy.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{discussion.postedBy.name}</h3>
                          <span className="text-sm text-gray-500">
                            {new Date(discussion.date).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{discussion.topic}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <button 
                            onClick={() => handleLike(discussion._id)}
                            className="flex items-center text-gray-500 hover:text-blue-600 text-sm"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {discussion.likesCount} Likes
                          </button>
                          <button 
                            onClick={() => toggleReplyInput(discussion._id)}
                            className="flex items-center text-gray-500 hover:text-blue-600 text-sm"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Reply
                          </button>
                        </div>

                        {/* Reply Form */}
                        {showReplyInput[discussion._id] && (
                          <form 
                            onSubmit={(e) => handleReplySubmit(e, discussion._id)} 
                            className="mt-4 ml-6"
                          >
                            <textarea
                              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none"
                              rows="2"
                              placeholder="Write your reply..."
                              value={newReplies[discussion._id] || ''}
                              onChange={(e) => setNewReplies({
                                ...newReplies,
                                [discussion._id]: e.target.value
                              })}
                            />
                            <button
                              type="submit"
                              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
                              disabled={!newReplies[discussion._id]?.trim()}
                            >
                              Post Reply
                            </button>
                          </form>
                        )}

                        {/* Comments Section */}
                        {discussion.comments.length > 0 && (
                          <div className="ml-6 mt-4 space-y-4">
                            {discussion.comments.map((comment) => (
                              <div key={comment.commentID} className="flex items-start gap-3">
                                <img
                                  src={comment.commenter.profileImage}
                                  alt={comment.commenter.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-medium">{comment.commenter.name}</h3>
                                    <span className="text-xs text-gray-500">
                                      {new Date(comment.commentDate).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-700">{comment.comment}</p>
                                  <div className="mt-1">
                                    <button className="flex items-center text-gray-500 hover:text-blue-600 text-xs">
                                      <ThumbsUp className="h-3 w-3 mr-1" /> 0 Likes
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment form */}
              <form onSubmit={handleCommentSubmit} className="mt-6">
                <div className="flex items-start gap-3">
                  <img 
                    src={CurrentUser?.ProfileImage || ''} 
                    alt="Your avatar" 
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all"
                      rows="3"
                      placeholder="Share your thoughts about this event..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        disabled={!newComment.trim() || postDiscussionMutation.isLoading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post Discussion
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </section>
          </div>

          {/* Sidebar column */}
          <div className="space-y-6">
            {/* Event Details card */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Event Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Clock className="h-4 w-4 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-gray-600">{eventReport?.Eventdetails.date}</p>
                    <p className="text-gray-600">{eventReport?.Eventdetails.StartTime}-{eventReport?.Eventdetails.EndingTime}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{eventReport?.Eventdetails.Location}</p>
                  </div>
                </div>
                <div className="pt-2">
                  <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                    Register for Next Event
                  </button>
                </div>
              </div>
            </section>

            {/* Participants card */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Participants
              </h2>
              <div className="space-y-3">
                {eventData.participants.map(participant => (
                  <div key={participant.id} className="flex justify-between items-center py-1">
                    <span className="font-medium">{participant.name}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                      {participant.role}
                    </span>
                  </div>
                ))}
                <div className="pt-2 text-center text-gray-600">
                  +42 other participants
                </div>
              </div>
            </section>

            {/* Reviews card */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />
                Reviews & Feedback
              </h2>
              <div className="space-y-4">
                {eventReport?.ReviewsAndFeedback.map(review => (
                  <div key={review.ReviewID} className="py-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{review.Reviewer}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < review.Rating ? "text-yellow-500" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.Review}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <button 
                    className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition-colors" 
                    onClick={() => handleRouting()}
                  >
                    Leave a Review
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Gallery section */}
        <section className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
            <Image className="h-5 w-5 mr-2 text-blue-500" />
            Event Gallery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {eventData.galleryImages.map(image => (
              <div key={image.id} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <img 
                  src={image.url} 
                  alt={image.caption} 
                  className="w-full h-40 object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                  onClick={() => openImageModal(image)}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-sm truncate">{image.caption}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
              <Image className="h-4 w-4 mr-2" />
              View All Photos (24)
            </button>
          </div>
        </section>
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.caption} 
                  className="w-full max-h-screen object-contain"
                />
                <button 
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-opacity-70"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <p className="text-lg font-medium">{selectedImage.caption}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventReportSection;