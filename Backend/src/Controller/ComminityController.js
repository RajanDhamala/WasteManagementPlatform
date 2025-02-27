import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import User from '../Schema/User.js'
import ApiError from '../Utils/ApiError.js'

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


export {
    UserRanking,
    postData,
    getData
    
}