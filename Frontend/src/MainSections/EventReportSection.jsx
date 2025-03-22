import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, User, MessageSquare, Image, MessageCircle, ThumbsUp, Send } from 'lucide-react';
import useUserContext from '@/hooks/useUserContext';
import { useParams } from "react-router-dom";
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SkeletonImage = ({ className }) => (
  <div className={`${className} animate-pulse bg-gray-200 rounded-lg`}></div>
);

const SkeletonText = ({ className }) => (
  <div className={`${className} animate-pulse bg-gray-200 rounded h-4`}></div>
);

const EventReportSection = () => {
  let { title } = useParams();
  const [newComment, setNewComment] = useState('');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [newReplies, setNewReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [EventID, setEventId] = useState();

  const { CurrentUser } = useUserContext();
  const queryClient = useQueryClient();
  const Navigate = useNavigate();

  const handleRouting = () => {
    Navigate(`/events/${title}`);
  };

  const FetchReport = async () => {
    const response = await axios.get(`http://localhost:8000/report/final/${title}`, { withCredentials: true });
    setEventId(response.data.data.Eventdetails.EventId);
    return response.data.data;
  };

  const LikeDislikeDiscussion = async (discussionId) => {
    const response = await axios.put(
      `http://localhost:8000/community/likeUnlikeDiscussion/${discussionId}`,
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
    mutationFn: async ({ discussionId, comment }) => {
      const response = await axios.post(
        'http://localhost:8000/community/commentOnDiscussion',
        { discussionId, comment },
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
        { content, eventId: EventID === 'all' ? null : eventId },
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
    onSuccess: () => {},
  });

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    postDiscussionMutation.mutate({
      content: newComment,
      eventId: EventID
    });
    setNewComment('');
  };

  const handleReplySubmit = (e, discussionId) => {
    e.preventDefault();
    postReplyMutation.mutate({
      discussionId,
      comment: newReplies[discussionId],
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
  };

  if (isError) {
    return <div className="text-center text-red-600">Error loading event report</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Hero section with event title and basic info */}
        <header className="bg-white rounded-xl shadow-md p-6 mb-6">
          {isLoading ? (
            <>
              <SkeletonText className="h-8 w-3/4 mb-2" />
              <div className="flex flex-wrap items-center gap-4">
                <SkeletonText className="h-4 w-32" />
                <SkeletonText className="h-4 w-32" />
                <SkeletonText className="h-4 w-32" />
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
                {isLoading ? (
                  Array(2).fill().map((_, index) => (
                    <div key={index} className="space-y-2">
                      <SkeletonImage className="w-full h-64" />
                      <SkeletonText className="h-4 w-1/2 mx-auto" />
                    </div>
                  ))
                ) : (
                  Object.entries(eventReport?.BeforeAfter || {}).map(([key, url], index) => (
                    <div key={index} className="space-y-2">
                      <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <img 
                          src={url} 
                          alt={key} 
                          className="w-full h-64 object-cover cursor-pointer transform hover:scale-105 transition-transform duration-300"
                          onClick={() => openImageModal({ ImageUrl: url, caption: key })} // Fixed here
                          loading="lazy"
                        />
                      </div>
                      <p className="text-center text-gray-600 font-medium">{key}</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Community Discussion section */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                Community Discussion
              </h2>
              <div className="space-y-6">
                {isLoading ? (
                  Array(2).fill().map((_, index) => (
                    <div key={index} className="border-l-4 border-blue-100 pl-4">
                      <div className="flex items-start gap-3">
                        <SkeletonImage className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <SkeletonText className="h-4 w-24" />
                            <SkeletonText className="h-4 w-32" />
                          </div>
                          <SkeletonText className="mt-1 h-4 w-full" />
                          <SkeletonText className="mt-1 h-4 w-3/4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  eventReport?.communityPosts?.map((discussion) => (
                    <div key={discussion._id} className="border-l-4 border-blue-100 pl-4">
                      <div className="flex items-start gap-3">
                        <img
                          src={discussion.postedBy.ProfileImage}
                          alt={discussion.postedBy.name}
                          className="w-10 h-10 rounded-full"
                          loading="lazy"
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
                              className={`flex items-center text-sm ${discussion.hasLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
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

                          {discussion.comments.length > 0 && (
                            <div className="ml-6 mt-4 space-y-4">
                              {discussion.comments.map((comment) => (
                                <div key={comment.commentID} className="flex items-start gap-3">
                                  <img
                                    src={comment.commenter.profileImage}
                                    alt={comment.commenter.name}
                                    className="w-8 h-8 rounded-full"
                                    loading="lazy"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                      <h3 className="font-medium">{comment.commenter.name}</h3>
                                      <span className="text-xs text-gray-500">
                                        {new Date(comment.commentDate).toLocaleString()}
                                      </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-700">{comment.comment}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="mt-6">
                <div className="flex items-start gap-3">
                  {isLoading ? (
                    <SkeletonImage className="w-10 h-10 rounded-full" />
                  ) : (
                    <img 
                      src={CurrentUser?.ProfileImage || ''} 
                      alt="Your avatar" 
                      className="w-10 h-10 rounded-full"
                      loading="lazy"
                    />
                  )}
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
              {isLoading ? (
                <div className="space-y-4">
                  <SkeletonText className="h-4 w-24" />
                  <SkeletonText className="h-4 w-full" />
                  <SkeletonText className="h-4 w-3/4" />
                </div>
              ) : (
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
              )}
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
              {isLoading ? (
                <div className="space-y-4">
                  <SkeletonText className="h-4 w-full" />
                  <SkeletonText className="h-4 w-3/4" />
                </div>
              ) : (
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
              )}
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
            {isLoading ? (
              Array(6).fill().map((_, index) => (
                <SkeletonImage key={index} className="w-full h-40" />
              ))
            ) : (
              eventReport?.ImageGallary.map(image => (
                <div key={Math.random()} className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <img 
                    src={image.ImageUrl} 
                    alt={image.caption} 
                    className="w-full h-40 object-cover cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                    onClick={() => openImageModal(image)}
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                    <p className="text-sm truncate">{image.caption}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-6 text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
              <Image className="h-4 w-4 mr-2" />
              View All Photos (24)
            </button>
          </div>
        </section>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeImageModal}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={selectedImage.ImageUrl} 
                  alt={selectedImage.caption} 
                  className="w-full max-h-screen object-contain"
                  loading="lazy"
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