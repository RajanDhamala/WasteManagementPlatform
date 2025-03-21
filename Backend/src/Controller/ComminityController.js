import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import User from '../Schema/User.js'
import ApiError from '../Utils/ApiError.js'
import Event from '../Schema/Event.js'
import { Redisclient } from '../Utils/RedisUtil.js'
import CommunityDiscussion from '../Schema/CommunityDiscussion.js'



const UserRanking=asyncHandler(async(req,res)=>{
    const user=req.user

    if(!user){
        throw new ApiError(404,'User not found in the cookies')
    }

    const rankings = [
        {
          id: 1,
          rank: 1,
          username: "EcoWarrior",
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=EcoWarrior&backgroundColor=00acc1",
          points: Math.floor(Math.random() * 10000),
          icon: 'Crown',
        },
        {
          id: 2,
          rank: 2,
          username: "GreenHero",
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=GreenHero&backgroundColor=8e94f2",
          points: Math.floor(Math.random() * 10000),
          icon: 'Gem',
        },
        {
          id: 3,
          rank: 3,
          username: "RecycleMaster",
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=RecycleMaster&backgroundColor=4caf50",
          points: Math.floor(Math.random() * 10000),
          icon: 'Sprout',
        },
        {
          id: 4,
          rank: 4,
          username: "WasteWarrior",
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=WasteWarrior&backgroundColor=ffb300",
          points: Math.floor(Math.random() * 10000),
          icon: 'Recycle',
        },
        {
          id: 5,
          rank: 5,
          username: "EarthDefender",
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=EarthDefender&backgroundColor=81c784",
          points: 2345,
          icon: 'Leaf',
        },
      ]
    return res.send(new ApiResponse(200,'successfully fetched data',{rankings}))
})

const Datashai = [
  {
    username: 'Rajan Dhamala',
    data: 'I am a software engineer',
    subject: 'Software Engineering',
  },
  {
    username: 'Aarav Sharma',
    data: 'Passionate about artificial intelligence and machine learning.',
    subject: 'AI & Machine Learning',
  },
  {
    username: 'Sneha Joshi',
    data: 'Working as a full-stack developer with a love for JavaScript.',
    subject: 'Web Development',
  },
  {
    username: 'Kiran Thapa',
    data: 'Cybersecurity enthusiast, always exploring ethical hacking.',
    subject: 'Cybersecurity',
  },
  {
    username: 'Priya Karki',
    data: 'Mobile app developer specializing in React Native and Flutter.',
    subject: 'Mobile Development',
  },
  {
    username: 'Anish Gurung',
    data: 'Data analyst with a deep interest in data visualization and analytics.',
    subject: 'Data Science',
  },
  {
    username: 'Megha Singh',
    data: 'Cloud computing expert, focusing on AWS and Azure services.',
    subject: 'Cloud Computing',
  },
  {
    username: 'Rohit Bhandari',
    data: 'Blockchain developer, working on decentralized applications.',
    subject: 'Blockchain Technology',
  },
  {
    username: 'Neha Basnet',
    data: 'DevOps engineer, streamlining CI/CD pipelines.',
    subject: 'DevOps',
  },
  {
    username: 'Sushil Adhikari',
    data: 'Game developer specializing in Unity and Unreal Engine.',
    heading: 'Game Development',
  },
];

const getData=asyncHandler(async(req,res)=>{
  return res.send(new ApiResponse(200,'successfully fetched data',Datashai.reverse()))
})


const postData = asyncHandler(async (req, res) => {
  const { heading, data,username } = req.body;

  console.log(heading, data);

  if (!heading || !data) {
      throw new ApiError(404, 'Please provide heading and data');
  }

  Datashai.push({
      username:username,
      data,
      subject: heading
  });

  return res.send(new ApiResponse(200, 'Data posted successfully',{
      username:username,
      data,
      subject: heading
  }));
});

const getAllEvents = asyncHandler(async (req, res) => {
  const cachedData = await Redisclient.json.get('EVENTLIST', '$'); 
console.log("john bange don")
  if (cachedData) {
    console.log('Data fetched from Redis');
    return res.send(new ApiResponse(200, 'Successfully fetched data from cache', { events: cachedData }));
  } else {
    const events = await Event.find({}).select('title location');

    if (!events || events.length === 0) {
      throw new ApiError(404, 'No events found');
    }
    await Redisclient.json.set('EVENTLIST', '$', events); 

    console.log('Data fetched from database');
    return res.send(new ApiResponse(200, 'Successfully fetched data', { events }));
  }
});

const CreateCommunityPost = asyncHandler(async (req, res) => {
  const { content, eventId } = req.body;
  console.log(content, eventId);
  const user = req.user;

  console.log(content,eventId)

  if (!content || !eventId) {
      throw new ApiError(404, 'Please provide content and eventId');
  }
  if (!user) {
      throw new ApiError(404, 'User not found in the cookies');
  }
  const CommunityPost = await CommunityDiscussion.create({
      topic: content,
      postedBy: user._id,
      user: user._id,
      EventId: eventId
  });
  return res.send(new ApiResponse(200, 'Post created successfully', { CommunityPost }));
});

const getCommunityPost = asyncHandler(async (req, res) => {
  const eventID = req.params.eventID;
  const userId = req.user ? req.user._id.toString() : null;

  if (!eventID) {
    throw new ApiError(404, 'Please provide eventID');
  }

  let EventPosts;
  if (eventID === 'all') {
    EventPosts = await CommunityDiscussion.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'postedBy',
          foreignField: '_id',
          as: 'postedByDetails',
        },
      },
      { $unwind: { path: '$postedByDetails', preserveNullAndEmptyArrays: true } },

      // Lookup for comments' users
      {
        $lookup: {
          from: 'users',
          localField: 'comments.commentBy',
          foreignField: '_id',
          as: 'commentByDetails',
        },
      },

      // Lookup for replies' users
      {
        $lookup: {
          from: 'users',
          localField: 'comments.replies.repliedBy',
          foreignField: '_id',
          as: 'replyByDetails',
        },
      },

      {
        $addFields: {
          comments: {
            $map: {
              input: '$comments',
              as: 'comment',
              in: {
                commentID: '$$comment.commentID',
                comment: '$$comment.comment',
                commentDate: '$$comment.date',
                commenter: {
                  name: {
                    $arrayElemAt: [
                      '$commentByDetails.name',
                      { $indexOfArray: ['$commentByDetails._id', '$$comment.commentBy'] }
                    ]
                  },
                  profileImage: {
                    $arrayElemAt: [
                      '$commentByDetails.ProfileImage',
                      { $indexOfArray: ['$commentByDetails._id', '$$comment.commentBy'] }
                    ]
                  }
                },
                replies: {
                  $map: {
                    input: '$$comment.replies',
                    as: 'reply',
                    in: {
                      replyID: '$$reply.replyID',
                      reply: '$$reply.reply',
                      replyDate: '$$reply.date',
                      repliedBy: {
                        name: {
                          $arrayElemAt: [
                            '$replyByDetails.name',
                            { $indexOfArray: ['$replyByDetails._id', '$$reply.repliedBy'] }
                          ]
                        },
                        profileImage: {
                          $arrayElemAt: [
                            '$replyByDetails.ProfileImage',
                            { $indexOfArray: ['$replyByDetails._id', '$$reply.repliedBy'] }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      {
        $project: {
          topic: 1,
          postedBy: {
            name: '$postedByDetails.name',
            ProfileImage: '$postedByDetails.ProfileImage',
            _id: '$postedByDetails._id',
          },
          comments: 1,
          date: 1,
          likesCount: { $size: '$likes' },
          EventId: 1,
          hasLiked: userId
            ? { $in: [userId, { $map: { input: '$likes', as: 'like', in: { $toString: '$$like' } } }] }
            : false,
        },
      },
      { $sort: { date: -1 } },
      { $limit: 10 },
    ]).exec();
  } else {
    EventPosts = await CommunityDiscussion.find({ EventId: eventID })
      .populate('postedBy', 'name ProfileImage')
      .populate('comments.commentBy', 'name ProfileImage')
      .populate('comments.replies.repliedBy', 'name ProfileImage')
      .lean();

    EventPosts = EventPosts.map((post) => {
      const hasLiked = post.likes.map((likeId) => likeId.toString()).includes(userId);
      return {
        ...post,
        hasLiked,
        likesCount: post.likes.length,
        comments: post.comments.map(comment => ({
          commentID: comment.commentID,
          comment: comment.comment,
          commentDate: comment.date,
          commenter: {
            name: comment.commentBy.name,
            profileImage: comment.commentBy.ProfileImage,
          },
          replies: comment.replies.map(reply => ({
            replyID: reply.replyID,
            reply: reply.reply,
            replyDate: reply.date,
            repliedBy: {
              name: reply.repliedBy.name,
              profileImage: reply.repliedBy.ProfileImage,
            }
          }))
        })),
      };
    });
  }

  return res.send(new ApiResponse(200, 'Successfully fetched data', EventPosts));
});




const LikeUnlikeDiscussion = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) throw new ApiError(404, 'User not found');

  const { discussionId } = req.params;
  if (!discussionId) throw new ApiError(404, 'Please provide discussionId');

  const discussion = await CommunityDiscussion.findById(discussionId);
  if (!discussion) throw new ApiError(404, 'Discussion not found');

  let hasLiked = false;
  if (discussion.likes.includes(user._id)) {
      discussion.likes.pull(user._id);
      hasLiked = false;
  } else{
      discussion.likes.push(user._id);
      hasLiked = true;
  }

  await discussion.save();
  console.log(hasLiked)
  return res.send(new ApiResponse(200, 'Successfully updated reaction', {
      hasLiked
  }));
});

const CommentOnDiscussion=asyncHandler(async(req,res)=>{
  const user=req.user;
  if(!user){
    throw new ApiError(404,'User not found')
  }
  const {discussionId,comment}=req.body;

  if(!discussionId || !comment){
    throw new ApiError(404,'Please provide discussionId and comment')
  }

  const discussion=await CommunityDiscussion.findById(discussionId);
  if(!discussion){
    throw new ApiError(404,'Discussion not found')
  }
  discussion.comments.push({
    comment,
    commentBy:user._id
  })
  await discussion.save();
  return res.send(new ApiResponse(200,'Comment added successfully',{discussion}))
})


const ReplyonComment = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const { discussionId, parentCommentId, content } = req.body;
    if (!discussionId || !parentCommentId || !content) {
        throw new ApiError(400, "Please provide discussionId, parentCommentId, and reply content");
    }

    const discussion = await CommunityDiscussion.findById(discussionId);
    if (!discussion) {
        throw new ApiError(404, "Discussion not found");
    }

    const isSame=discussion.comments.find(comment=>comment.commentID.toString()===parentCommentId.toString())
    if(!isSame){
      throw new ApiError(404,'Comment not found')
    }
    discussion.comments.forEach(comment => {
        if (comment.commentID.toString() === parentCommentId.toString()) {
            comment.replies.push({
                reply: content,
                repliedBy: user._id
            });
        }
    });
    await discussion.save();

    res.send(new ApiResponse(200, "Reply added successfully", { discussion }));
});


const DeleteDiscussionPost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { discussionId } = req.params;
  if (!user) {
      throw new ApiError(404, "User not found");
  }

  if (!discussionId) {
      throw new ApiError(400, "Please provide discussionId"); 
  }

  const discussion = await CommunityDiscussion.findById(discussionId);
  if (!discussion) {
      throw new ApiError(404, "Discussion not found");
  }

  if (discussion.postedBy.toString() === user._id.toString()) {
      await CommunityDiscussion.deleteOne({ _id: discussionId }); 
      return res.send(new ApiResponse(200, "Discussion deleted successfully"));
  } else {
      throw new ApiError(403, "You are not authorized to delete this discussion");
  }
});

const DeleteDiscussionComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { discussionId, commentId } = req.params;

  if (!user) throw new ApiError(404, "User not found");
  if (!discussionId || !commentId) throw new ApiError(400, "Please provide discussionId and commentId");

  const postDocument = await CommunityDiscussion.findById(discussionId);
  if (!postDocument) throw new ApiError(404, "Discussion not found");

  const commentIndex = postDocument.comments.findIndex((c) => {
    console.log("Checking comment:", c.commentID?.toString(), "by", c.commentBy.toString());
    return c.commentID?.toString() === commentId.toString() && c.commentBy.toString() === user._id.toString();
  });
  if (commentIndex === -1) {
    throw new ApiError(403, "Comment not found or you are not the owner");
  }

  postDocument.comments.splice(commentIndex, 1);
  await postDocument.save();

  res.send(new ApiResponse(200, "Comment deleted successfully", { discussion: postDocument }));
});


const EditDiscussionPost=asyncHandler(async(req,res)=>{
  const user=req.user;
  const {content}=req.body
  const {id}=req.params

  if(!user){
    throw new ApiError(200,'user not available in token')
  }
  console.log(id)
  if(!id || !content){
    throw new ApiError(200,'please send all the deatils')
  }
  const existingDiscussion = await CommunityDiscussion.findOne({ _id: id }).populate('postedBy');

  console.log(existingDiscussion)
  if(!existingDiscussion){
    throw new ApiError(200,'the discussion doenot exist sorry')
  }
  
  if(existingDiscussion.postedBy._id.toString()==user._id){
   existingDiscussion.topic=content;
    await existingDiscussion.save()
  }
  res.send(new ApiResponse(400,'comment edited successfully',{}))
})

const EditDiscussionComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { discussionId, reqId } = req.params; 
  const { comment } = req.body;

  if (!user) throw new ApiError(400, "Please include user in cookies");
  if (!discussionId || !reqId) throw new ApiError(400, "Please include discussion ID and comment ID");
  if (!comment) throw new ApiError(401, "Please include a new comment");

  const document = await CommunityDiscussion.findById(discussionId);
  if (!document) throw new ApiError(404, "Discussion not found in database");

  const commentIndex = document.comments.findIndex((c) => {
    return c.commentID.toString() === reqId.toString() && c.commentBy.toString() === user._id.toString();
  });

  if (commentIndex === -1) {
    throw new ApiError(403, "Comment not found or you are not the owner");
  }

  document.comments[commentIndex].comment = comment;
  await document.save();

  res.send(new ApiResponse(200, "Comment edited successfully", { discussion: document }));
});


export {
    UserRanking,
    postData,
    getData,
    getAllEvents,
    CreateCommunityPost,
    getCommunityPost,
    LikeUnlikeDiscussion,
    CommentOnDiscussion,
    ReplyonComment,
    DeleteDiscussionPost,
    DeleteDiscussionComment,
    EditDiscussionPost,
    EditDiscussionComment
}