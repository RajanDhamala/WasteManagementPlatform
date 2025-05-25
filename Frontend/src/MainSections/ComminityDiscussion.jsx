import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, Share2, ThumbsUp, MessageSquare, ChevronRight, Calendar, Send, Leaf, MapPin, AlertTriangle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Editdot from '../UtilsCOmps/EditDot';
import useStore from '@/ZustandStore/UserStore';

const CommunityDiscussion = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [newDiscussion, setNewDiscussion] = useState('');
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState({});
  const [newComments, setNewComments] = useState({});
  const [newReplies, setNewReplies] = useState({});
  const [showReplyInput, setShowReplyInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editDiscussionId, setEditDiscussionId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const CurrentUser=useStore((state)=>state.CurrentUser)

  const queryClient = useQueryClient();

  const fetchEvents = async () => {
    const response = await axios.get('http://localhost:8000/community/GetAllEvents', { withCredentials: true });
    return response.data;
  };

  const fetchEventDiscussions = async () => {
    const response = await axios.get(`http://localhost:8000/community/getPost/${selectedEvent}`, { withCredentials: true });
    return response.data.data;
  };

  const { data: DiscussionPost, isLoading: isDiscussionLoading, isError: isDiscussionError, error: DiscussionError, refetch: FetchPost } = useQuery({
    queryKey: ['GetDiscussionPost', selectedEvent],
    queryFn: fetchEventDiscussions,
  });

  const { data: eventsData = [], isLoading, isError: isEventsError, error: eventsError } = useQuery({
    queryKey: ['GetAllEvents'],
    queryFn: fetchEvents,
  });

  const LikeDislikeDiscussion = async (id) => {
    const response = await axios.put(`http://localhost:8000/community/likeUnlikeDiscussion/${id}`, {}, { withCredentials: true });
    return { hasLiked: response.data.data?.hasLiked || false, likesCount: response.data.data?.likesCount || 0 };
  };

  const LikeUnlike = useMutation({
    mutationFn: LikeDislikeDiscussion,
    onMutate: async (discussionId) => {
      const prevData = queryClient.getQueryData(['GetDiscussionPost', selectedEvent]);
      queryClient.setQueryData(['GetDiscussionPost', selectedEvent], (oldData) => {
        return oldData.map(discussion => {
          if (discussion._id === discussionId) {
            return { ...discussion, hasLiked: !discussion.hasLiked, likesCount: discussion.likesCount + (discussion.hasLiked ? -1 : 1) };
          }
          return discussion;
        });
      });
      return { prevData };
    },
    onError: (err, discussionId, context) => {
      queryClient.setQueryData(['GetDiscussionPost', selectedEvent], context.prevData);
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
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post discussion');
    },
  });

  const editDiscussionMutation = useMutation({
    mutationFn: async ({ id, content }) => {
      console.log(id)
      const response = await axios.put(
        `http://localhost:8000/community/editPost/${id}`,
        { content,
         },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Discussion updated successfully!');
      setEditDiscussionId(null);
      setEditContent('');
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update discussion');
    },
  });

  const deleteDiscussionMutation = useMutation({
    mutationFn: async (id) => {
      const response = await axios.delete(`http://localhost:8000/community/deletePost/${id}`, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Discussion deleted successfully!');
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete discussion');
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async ({ comment, discussionId }) => {
      const response = await axios.post(
        'http://localhost:8000/community/commentOnDiscussion',
        { comment, discussionId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Comment posted successfully!');
      setNewComments({});
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({ discussionId, commentId, comment }) => {
      const response = await axios.put(
        `http://localhost:8000/community/editComment/${discussionId}/${commentId}`,
        { comment },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Comment updated successfully!');
      setEditCommentId(null);
      setEditContent('');
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async ({ discussionId, commentId }) => {
      const response = await axios.delete(
        `http://localhost:8000/community/deleteComment/${discussionId}/${commentId}`,
        { withCredentials: true }
      );
      console.log(response.data)
      return response.data;
    },
    onSuccess: () => {
      toast.success('Comment deleted successfully!');
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    },
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
      FetchPost();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    },
  });

  const handlePostDiscussion = () => {
    if (!newDiscussion.trim()) {
      toast.error('Discussion cannot be empty');
      return;
    }
    postDiscussionMutation.mutate({
      content: newDiscussion,
      eventId: selectedEvent,
    });
  };

  const handleEditDiscussion = (discussionId, currentContent) => {
    setEditDiscussionId(discussionId);
    setEditContent(currentContent);
  };

  const handleSaveEditDiscussion = (discussionId) => {
    if (!editContent.trim()) {
      toast.error('Content cannot be empty');
      return;
    }
    editDiscussionMutation.mutate({ id: discussionId, content: editContent });
  };

  const handleDeleteDiscussion = (discussionId) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      deleteDiscussionMutation.mutate(discussionId);
    }
  };

  const handlePostComment = (discussionId) => {
    const commentContent = newComments[discussionId]?.trim();
    if (!commentContent) {
      toast.error('Comment cannot be empty');
      return;
    }
    postCommentMutation.mutate({
      comment: commentContent,
      discussionId,
    });
  };

  const handleEditComment = (discussionId, commentId, currentComment) => {
    setEditCommentId(commentId);
    setEditContent(currentComment);
  };

  const handleSaveEditComment = (discussionId, commentId) => {
    if (!editContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    editCommentMutation.mutate({ discussionId, commentId, comment: editContent });
  };

  const handleDeleteComment = (discussionId, commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ discussionId, commentId });
    }
  };

  const handlePostReply = (discussionId, parentCommentId = null) => {
    const replyContent = newReplies[discussionId]?.[parentCommentId || 'root']?.trim();
    if (!replyContent) {
      toast.error('Reply cannot be empty');
      return;
    }
    postReplyMutation.mutate({
      discussionId,
      content: replyContent,
      parentCommentId,
    });
  };

  const handleLike = (discussionId) => {
    LikeUnlike.mutate(discussionId);
  };

  const toggleReplyInput = (discussionId, commentId = 'root') => {
    setShowReplyInput(prev => ({
      ...prev,
      [`${discussionId}-${commentId}`]: !prev[`${discussionId}-${commentId}`]
    }));
  };

  const toggleComments = (discussionId) => {
    setShowComments(prev => ({
      ...prev,
      [discussionId]: !prev[discussionId]
    }));
  };

  const filteredDiscussions = selectedEvent === 'all' 
    ? DiscussionPost || [] 
    : (DiscussionPost || []).filter(d => d.EventId === selectedEvent);

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const leafPattern = { backgroundImage: 'radial-gradient(rgba(74, 222, 128, 0.05) 2px, transparent 2px)', backgroundSize: '30px 30px' };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'Invalid Date';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    if (DiscussionPost?.length > 0) {
      const initialLikes = {};
      DiscussionPost.forEach(discussion => {
        initialLikes[discussion._id] = { hasLiked: discussion.hasLiked || false, likesCount: discussion.likesCount || 0 };
      });
      setOptimisticLikes(initialLikes);
    }
  }, [DiscussionPost]);

  const renderComments = (discussionId, comments = [], level = 0) => {
    return comments.map((comment) => (
      <motion.div 
        key={comment.commentID || comment.replyID} 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 ${level > 0 ? 'ml-10 mt-3 border-l-2 border-green-200 pl-4' : 'mt-4'} ${level === 0 ? 'bg-green-50' : 'bg-green-100'} rounded-lg p-3 shadow-sm border border-green-100`}
      >
        <Avatar className="w-8 h-8 border border-green-200">
          <AvatarImage 
            src={comment.commenter?.profileImage || comment.repliedBy?.profileImage} 
            alt={comment.commenter?.name || comment.repliedBy?.name} 
          />
          <AvatarFallback className="text-xs bg-green-100 text-green-800">
            {(comment.commenter?.name || comment.repliedBy?.name)?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-800">
              {comment.commenter?.name || comment.repliedBy?.name}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-green-600 opacity-70">
                {formatDate(comment.commentDate || comment.replyDate)}
              </p>              {CurrentUser && comment.commenter?.name === CurrentUser?.name && (
                <Editdot 
                  onEdit={() => handleEditComment(discussionId, comment.commentID, comment.comment)}
                  onDelete={() => handleDeleteComment(discussionId, comment.commentID)}
                />
              )}
            </div>
          </div>
          {editCommentId === comment.commentID ? (
            <div className="mt-2 flex items-center gap-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500 text-sm"
              />
              <Button
                onClick={() => handleSaveEditComment(discussionId, comment.commentID)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </Button>
              <Button
                onClick={() => setEditCommentId(null)}
                variant="outline"
                className="text-green-700 border-green-200 hover:bg-green-50"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <p className="text-sm text-green-900 mt-1">
              {comment.comment || comment.reply}
            </p>
          )}
          
          {!comment.replyID && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-green-700 hover:bg-green-100"
                onClick={() => toggleReplyInput(discussionId, comment.commentID)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Reply
              </Button>
            </div>
          )}

          {showReplyInput[`${discussionId}-${comment.commentID}`] && (
            <div className="mt-2 flex items-center gap-2">
              <Textarea
                placeholder="Type your reply..."
                className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500 text-sm"
                value={newReplies[discussionId]?.[comment.commentID] || ''}
                onChange={(e) => setNewReplies(prev => ({
                  ...prev,
                  [discussionId]: { ...prev[discussionId], [comment.commentID]: e.target.value }
                }))}
              />
              <Button
                onClick={() => handlePostReply(discussionId, comment.commentID)}
                disabled={!newReplies[discussionId]?.[comment.commentID]?.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {comment.replies?.length > 0 && (
            <div className="mt-3 space-y-3">
              {renderComments(discussionId, comment.replies, level + 1)}
            </div>
          )}
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 md:ml-[53px]" style={leafPattern}>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <Leaf className="h-6 w-6 text-green-600 mr-2" />
            <h1 className="text-3xl font-bold text-green-800">EcoClean Community</h1>
          </div>
          <p className="text-green-700 opacity-80">Connect, share, and make a difference together</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <Card className="sticky top-4 border-green-200 bg-white/80 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-2 border-b border-green-100">
                <CardTitle className="text-xl text-green-800 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Community Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="events" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 bg-green-100">
                    <TabsTrigger value="events" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Events</TabsTrigger>
                    <TabsTrigger value="topics" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Topics</TabsTrigger>
                  </TabsList>
                  <TabsContent value="events">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-green-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-green-600" />
                          Upcoming Events
                        </h3>
                        <Button variant="ghost" size="sm" className="text-green-700 hover:text-green-900 hover:bg-green-100">View All</Button>
                      </div>
                      <Button 
                        variant={selectedEvent === 'all' ? "default" : "outline"}
                        className={`w-full justify-start ${selectedEvent === 'all' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 text-green-800 border-green-200'}`}
                        onClick={() => setSelectedEvent('all')}
                      >
                        All Discussions
                      </Button>                      {isLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-green-50 rounded-lg border border-green-100"></div>
                            </div>
                          ))}
                        </div>
                      ) : isEventsError ? (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {eventsError?.message || 'Failed to load events'}
                        </div>
                      ) : eventsData?.data?.events?.map(event => (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            variant={selectedEvent === event._id ? "default" : "outline"}
                            className={`w-full justify-start mb-[4px] group transition-all duration-200 py-5 ${
                              selectedEvent === event._id 
                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-lg shadow-green-100' 
                                : 'hover:bg-green-50/80 text-green-800 border-green-200 hover:border-green-300 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedEvent(event._id)}
                          >
                            <div className="flex items-center text-left w-full">
                              <div className={`rounded-xl p-2.5 mr-3 flex items-center justify-center transition-all duration-200 ${
                                selectedEvent === event._id 
                                  ? 'bg-green-500/20 backdrop-blur-sm' 
                                  : 'bg-green-100 group-hover:bg-green-200/80'
                              }`}>
                                <Calendar className={`h-5 w-5 transition-colors ${
                                  selectedEvent === event._id ? 'text-white' : 'text-green-700 group-hover:text-green-800'
                                }`} />
                              </div>
                              <div className="flex-1 ">
                                <div className="font-medium text-[13px] leading-tight mb-1">{event.title}</div>
                                <div className={`text-xs flex items-center ${
                                  selectedEvent === event._id ? 'text-white/90' : 'text-green-600'
                                }`}>
                                  <MapPin className="h-3 w-3 mr-1" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              </div>
                              <ChevronRight className={`h-4 w-4 ml-2 transition-transform ${
                                selectedEvent === event._id 
                                  ? 'text-white transform translate-x-1' 
                                  : 'text-green-400 group-hover:text-green-600 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'
                              }`} />
                            </div>
                          </Button>
                        </motion.div>                      ))}
                    </div>
                  </TabsContent>                  <TabsContent value="topics">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Topics Coming Soon</h3>
                      <p className="text-sm text-green-600 opacity-80">We're working on bringing you organized discussion topics. Stay tuned!</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:w-3/4">
            <Card className="mb-6 border-green-200 shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 h-2"></div>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Avatar className="border-2 border-green-200">
                    <AvatarImage src={CurrentUser?.ProfileImage || ''} />
                    <AvatarFallback className="bg-green-100 text-green-800">YP</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea 
                      placeholder="Share your thoughts or ask a question about sustainable practices..." 
                      className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500"
                      value={newDiscussion}
                      onChange={(e) => setNewDiscussion(e.target.value)}
                      disabled={postDiscussionMutation.isLoading}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {selectedEvent !== 'all' && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                            {eventsData?.data?.events?.find(e => e._id === selectedEvent)?.title || 'General'}
                            <button className="ml-1 text-xs" onClick={() => setSelectedEvent('all')}>×</button>
                          </Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowEventSelector(!showEventSelector)}
                          className="text-sm text-green-700 border-green-200 hover:bg-green-50"
                          disabled={postDiscussionMutation.isLoading}
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          Select Event
                        </Button>                        {showEventSelector && (
                          <motion.div 
                            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 flex items-start justify-center pt-32"
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                          >
                            <motion.div 
                              className="bg-white/95 backdrop-blur-sm shadow-xl rounded-xl border border-green-100 p-3 z-50 w-[500px] max-h-[400px] relative"
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >                              {/* Close button */}
                              <button 
                                onClick={() => setShowEventSelector(false)}
                                className="absolute right-2 top-2 p-1 hover:bg-green-50 rounded-full text-green-600 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>

                              {/* Event list */}
                              <div className="space-y-1.5 overflow-y-auto max-h-[300px] p-1">
                                {eventsData?.data?.events?.map(event => (
                                    <button
                                      key={event._id}
                                      className={`w-full flex items-center p-2.5 text-sm rounded-lg transition-all ${
                                        selectedEvent === event._id
                                          ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
                                          : 'text-green-700 hover:bg-green-50/80'
                                      }`}
                                      onClick={() => {
                                        setSelectedEvent(event._id);
                                        setShowEventSelector(false);
                                      }}
                                    >
                                      <div className="flex items-center w-full">
                                        <div className={`p-2 rounded-lg mr-3 ${
                                          selectedEvent === event._id ? 'bg-green-200' : 'bg-green-100'
                                        }`}>
                                          <Calendar className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                          <div className="font-medium line-clamp-1">{event.title}</div>
                                          <div className="text-xs text-green-600/80 flex items-center mt-0.5">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            <span className="line-clamp-1">{event.location}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                ))}                                {eventsData?.data?.events?.length === 0 && (
                                  <div className="text-center py-8 text-green-600">
                                    <Calendar className="h-12 w-12 mx-auto mb-2 text-green-300" />
                                    <p>No events available</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </div>
                      <Button 
                        onClick={handlePostDiscussion}
                        disabled={!newDiscussion.trim() || postDiscussionMutation.isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {postDiscussionMutation.isLoading ? 'Posting...' : <><Send className="w-4 h-4 mr-2" /> Post</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    {selectedEvent === 'all' ? 'Community Discussions' : `Discussions: ${eventsData?.data?.events?.find(e => e._id === selectedEvent)?.title || ''}`}
                  </h2>
                  <p className="text-sm text-green-600">
                    {selectedEvent === 'all' 
                      ? 'Join the conversation and share your thoughts with the community' 
                      : 'Share your experiences and connect with event participants'}
                  </p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
              {isDiscussionLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-green-200 animate-pulse">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-green-100 rounded w-1/4" />
                            <div className="h-4 bg-green-100 rounded w-3/4" />
                            <div className="h-4 bg-green-100 rounded w-1/2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : isDiscussionError ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <div className="text-red-600 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      <span>{DiscussionError?.message || 'Failed to load discussions'}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredDiscussions.length > 0 ? (
                filteredDiscussions.map(discussion => (
                  <motion.div key={discussion._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <Card className="border-green-200 hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="border-2 border-green-200">
                            <AvatarImage src={discussion.postedBy?.ProfileImage} alt={discussion.postedBy?.name} />
                            <AvatarFallback className="bg-green-100 text-green-800">{discussion.postedBy?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-green-800">{discussion.postedBy?.name}</p>
                                <p className="text-sm text-green-600 opacity-70">{formatDate(discussion.date)}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {discussion.EventId && (
                                  <Badge className="bg-green-100 text-green-700">{eventsData?.data?.events?.find(e => e._id === discussion.EventId)?.title || 'Event'}</Badge>
                                )}
                                {discussion.postedBy._id==CurrentUser?._id?
                                  <Editdot 
                                  onEdit={() => handleEditDiscussion(discussion._id, discussion.topic)}
                                  onDelete={() => handleDeleteDiscussion(discussion._id)}
                                />:null
                                }
                              </div>
                            </div>
                            {editDiscussionId === discussion._id ? (
                              <div className="mt-3 flex items-center gap-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500"
                                />
                                <Button
                                  onClick={() => handleSaveEditDiscussion(discussion._id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditDiscussionId(null)}
                                  variant="outline"
                                  className="text-green-700 border-green-200 hover:bg-green-50"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <p className="mt-3 text-green-900 whitespace-pre-wrap">{discussion.topic}</p>
                            )}
                            <div className="mt-4 flex items-center gap-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`flex items-center gap-2 transition-all ${optimisticLikes[discussion._id]?.hasLiked ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-gray-600 hover:bg-green-50'} ${LikeUnlike.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => handleLike(discussion._id)}
                                disabled={LikeUnlike.isLoading}
                              >
                                <ThumbsUp className={`w-4 h-4 transition-colors ${optimisticLikes[discussion._id]?.hasLiked ? 'fill-green-600 text-green-600' : 'text-gray-400'}`} />
                                <span className={`${optimisticLikes[discussion._id]?.hasLiked ? 'text-green-700' : 'text-gray-600'}`}>{optimisticLikes[discussion._id]?.likesCount || 0}</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-green-700 hover:bg-green-50 flex items-center gap-2"
                                onClick={() => toggleComments(discussion._id)}
                              >
                                <MessageSquare className="w-4 h-4" />
                                {Object.keys(discussion.comments || {}).length}
                                {showComments[discussion._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>

                            {showComments[discussion._id] && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }} 
                                animate={{ height: 'auto', opacity: 1 }} 
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 space-y-3 pt-4 border-t border-green-100"
                              >
                                {renderComments(discussion._id, discussion.comments)}
                                <div className="flex items-center gap-2 mt-4">
                                  <Textarea
                                    placeholder="Add a comment..."
                                    className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500 text-sm"
                                    value={newComments[discussion._id] || ''}
                                    onChange={(e) => setNewComments(prev => ({ ...prev, [discussion._id]: e.target.value }))}
                                  />
                                  <Button
                                    onClick={() => handlePostComment(discussion._id)}
                                    disabled={postCommentMutation.isLoading || !newComments[discussion._id]?.trim()}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-green-800 mb-2">No discussions yet</h3>
                      <p className="text-green-600">Be the first to start a discussion in this community!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDiscussion;