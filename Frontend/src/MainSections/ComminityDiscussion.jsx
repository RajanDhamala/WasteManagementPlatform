import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Trophy, Users, Heart, Share2, ThumbsUp, Star, MessageSquare, ChevronRight, Calendar, Send, Filter, Search, Leaf, Recycle, Wind, Cloud, Trash2, PlusCircle, MapPin, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CommunityDiscussion = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [newDiscussion, setNewDiscussion] = useState(''); // For new discussion posts
  const [showEventSelector, setShowEventSelector] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState({});
  const [newComments, setNewComments] = useState({}); // For comments on discussions
  const [newReplies, setNewReplies] = useState({}); // For replies
  const [showReplyInput, setShowReplyInput] = useState({});

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
    onSuccess: () => {},
    onSettled: () => {}
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

  const filteredDiscussions = selectedEvent === 'all' 
    ? DiscussionPost || [] 
    : (DiscussionPost || []).filter(d => d.EventId === selectedEvent);

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
  const leafPattern = { backgroundImage: 'radial-gradient(rgba(74, 222, 128, 0.05) 2px, transparent 2px)', backgroundSize: '30px 30px' };

  const formatDate = (dateString) => {
    // Check if dateString is valid
    if (!dateString || typeof dateString !== 'string') {
      return 'Invalid Date'; // Fallback for invalid or missing dates
    }
  
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      return 'Invalid Date'; // Fallback for unparsable dates
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

  const renderComments = (discussionId, comments, level = 0) => {
    return Object.entries(comments || {}).map(([commentId, comment]) => (
      <div key={commentId} className={`flex items-start gap-3 ${level > 0 ? 'ml-8' : ''}`}>
        <Avatar className="w-8 h-8 border border-green-200">
          <AvatarImage src={comment.userImage} alt={comment.userName} />
          <AvatarFallback className="text-xs bg-green-100 text-green-800">{comment.userName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 bg-green-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-green-800">{comment.userName}</p>
            <p className="text-xs text-green-600 opacity-70">{formatDate(comment.date)}</p>
          </div>
          <p className="text-sm text-green-900 mt-1">{comment.content}</p>
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-700 hover:bg-green-100"
              onClick={() => toggleReplyInput(discussionId, commentId)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Reply
            </Button>
          </div>
          {showReplyInput[`${discussionId}-${commentId}`] && (
            <div className="mt-2 flex items-center gap-2">
              <Textarea
                placeholder="Type your reply..."
                className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500"
                value={newReplies[discussionId]?.[commentId] || ''}
                onChange={(e) => setNewReplies(prev => ({
                  ...prev,
                  [discussionId]: { ...prev[discussionId], [commentId]: e.target.value }
                }))}
              />
              <Button
                onClick={() => handlePostReply(discussionId, commentId)}
                disabled={postReplyMutation.isLoading || !newReplies[discussionId]?.[commentId]?.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          {comment.replies && renderComments(discussionId, comment.replies, level + 1)}
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8" style={leafPattern}>
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
                      </Button>
                      {isLoading ? (
                        <div>Loading events...</div>
                      ) : isEventsError ? (
                        <div>Error: {eventsError?.message || 'Failed to load events'}</div>
                      ) : eventsData?.data?.events?.map(event => (
                        <Button 
                          key={event._id}
                          variant={selectedEvent === event._id ? "default" : "outline"}
                          className={`w-full justify-start py-6 ${selectedEvent === event._id ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 text-green-800 border-green-200'}`}
                          onClick={() => setSelectedEvent(event._id)}
                        >
                          <div className="flex items-center text-left">
                            <div className="bg-green-100 p-2 rounded-full mr-3 text-green-700"></div>
                            <div>
                              <div>{event.title}</div>
                              <div className="text-xs opacity-70 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" /> {event.location}
                              </div>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="topics">{/* Topics content */}</TabsContent>
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
                    <AvatarImage src="/api/placeholder/100/100" />
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
                        </Button>
                        {showEventSelector && (
                          <motion.div 
                            className="absolute mt-2 bg-white shadow-lg rounded-md border border-green-100 p-2 z-10"
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                          >
                            {eventsData?.data?.events?.map(event => (
                              <Button 
                                key={event._id}
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-sm text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedEvent(event._id);
                                  setShowEventSelector(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <div className="bg-green-100 p-1.5 rounded-full mr-2 text-green-700"></div>
                                  {event.title}
                                </div>
                              </Button>
                            ))}
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
            </Card>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">
                {selectedEvent === 'all' ? 'Community Discussions' : `Discussions: ${eventsData?.data?.events?.find(e => e._id === selectedEvent)?.title || ''}`}
              </h2>
            </div>

            <div className="space-y-6">
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
                              {discussion.EventId && (
                                <Badge className="bg-green-100 text-green-700">{eventsData?.data?.events?.find(e => e._id === discussion.EventId)?.title || 'Event'}</Badge>
                              )}
                            </div>
                            <p className="mt-3 text-green-900 whitespace-pre-wrap">{discussion.topic}</p>
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
                              <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {Object.keys(discussion.comments || {}).length}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-green-700 hover:bg-green-50">
                                <Share2 className="w-4 h-4 mr-1" />
                                Share
                              </Button>
                            </div>

                            <div className="mt-4 space-y-3 pt-4 border-t border-green-100">
                              {renderComments(discussion._id, discussion.comments)}
                              <div className="flex items-center gap-2 mt-4">
                                <Textarea
                                  placeholder="Add a comment..."
                                  className="resize-none border-green-200 focus:ring-green-500 focus:border-green-500"
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
                            </div>
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