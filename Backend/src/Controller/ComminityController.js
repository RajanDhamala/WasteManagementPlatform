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

  if (!eventID) {
    throw new ApiError(404, 'Please provide eventID');
  }

  const cacheKey = `EventPosts_${eventID}`;
  const cachedData = await Redisclient.json.get(cacheKey, '$');

  if (cachedData) {
    console.log('Cache hit');
    return res.send(new ApiResponse(200, 'Successfully fetched data from cache', cachedData));
  } else {
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
        {
          $unwind: {
            path: '$postedByDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'comments.commentBy',
            foreignField: '_id',
            as: 'comments.commentByDetails',
          },
        },
        {
          $unwind: {
            path: '$comments.commentByDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            topic: 1,
            postedBy: {
              name: '$postedByDetails.name',
              ProfileImage: '$postedByDetails.ProfileImage',
              _id: '$postedByDetails._id',
            },  
            comments: {
              comment: 1,
              commentBy: '$comments.commentByDetails.name',
              commentByProfileImage: '$comments.commentByDetails.ProfileImage',
            },
            date: 1,
            likes: 1,
            dislikes: 1,
            EventId: 1,
          },
        },
        {
          $sort: { date: -1 },
        },
        {
          $limit: 10,
        },
      ]).exec();
      await Redisclient.json.set(cacheKey, '$', EventPosts);
      console.log('Cache miss, data stored in Redis');
    } else {
      EventPosts = await CommunityDiscussion.find({ EventId: eventID })
        .populate('postedBy', 'name ProfileImage') 
        .populate('comments.commentBy', 'name ProfileImage')
        .exec();

      await Redisclient.json.set(cacheKey, '$', EventPosts);
      console.log('Cache miss, data stored in Redis');
    }

    return res.send(new ApiResponse(200, 'Successfully fetched data', EventPosts));
  }
});

const LikeUnlikeDiscussion=asyncHandler(async(req,res)=>{
  const user=req.user
  if(!user){
    throw new ApiError(404,'User not found in the cookies')
  }
  const {discussionId}=req.parms;

  if(!discussionId){
    throw new ApiError(404,'Please provide discussionId')
  }
  

})

export {
    UserRanking,
    postData,
    getData,
    getAllEvents,
    CreateCommunityPost,
    getCommunityPost,
    LikeUnlikeDiscussion
}