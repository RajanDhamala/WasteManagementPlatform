import Participation from "../Schema/Participation.js"
import ApiResponse from '../Utils/ApiResponse.js'
import Achievement from '../Schema/Achivements.js'
import asyncHandler from "../Utils/AsyncHandler.js";
import dotenv from 'dotenv';
import ApiError from '../Utils/ApiError.js'
import User from '../Schema/User.js'
import { Redisclient } from '../Utils/RedisUtil.js';
import Event from "../Schema/Event.js"
import { getIo } from "../../index.js";

const CreateAchievement = asyncHandler(async (req, res) => {

  const data = [
    {
      name: "Bronze Cleaner",
      type: "point-milestone",
      criteria: { minPoints: 500 },
      basePoints: 0,
      description: "Awarded when a user reaches 500 points.",
      iconName: "bronze-medal",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Silver Cleaner",
      type: "point-milestone",
      criteria: { minPoints: 1000 },
      basePoints: 0,
      description: "Awarded when a user reaches 1000 points.",
      iconName: "silver-medal",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Diamond Cleaner",
      type: "point-milestone",
      criteria: { minPoints: 2000 },
      basePoints: 0,
      description: "Awarded when a user reaches 2000 points.",
      iconName: "diamond-medal",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Heroic Cleaner",
      type: "point-milestone",
      criteria: { minPoints: 5000 },
      basePoints: 0,
      description: "Awarded when a user reaches 5000 points.",
      iconName: "heroic-badge",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Leadership",
      type: "custom",
      criteria: { task: "votedBestLeader" },
      basePoints: 0,
      description: "Awarded for outstanding leadership in an event.",
      iconName: "leadership-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Helpfulness",
      type: "custom",
      criteria: { task: "votedMostHelpful" },
      basePoints: 0,
      description: "Awarded for being voted most helpful.",
      iconName: "helpfulness-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Teamwork",
      type: "custom",
      criteria: { task: "votedBestTeamPlayer" },
      basePoints: 0,
      description: "Awarded for excellent teamwork.",
      iconName: "teamwork-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Enthusiasm",
      type: "custom",
      criteria: { task: "votedMostEnthusiastic" },
      basePoints: 0,
      description: "Awarded for showing great enthusiasm.",
      iconName: "enthusiasm-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Punctuality",
      type: "custom",
      criteria: { task: "votedMostPunctual" },
      basePoints: 0,
      description: "Awarded for being the most punctual participant.",
      iconName: "punctuality-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
    {
      name: "Communication",
      type: "custom",
      criteria: { task: "votedBestCommunicator" },
      basePoints: 0,
      description: "Awarded for excellent communication skills.",
      iconName: "communication-icon",
      createdAt: new Date("2025-08-12T00:00:00.000Z"),
    },
  ];

  for (const item of data) {
    const exists = await Achievement.findOne({ name: item.name });
    if (exists) {
      console.log(`Achievement '${item.name}' already exists in db`);
      continue; // skip existing achievements
    }

    const newAchievement = new Achievement({
      name: item.name,
      type: item.type,
      criteria: item.criteria,
      basePoints: item.basePoints,
      description: item.description,
      iconName: item.iconName,
      createdAt: item.createdAt,
    });

    await newAchievement.save();
  }

  res.status(201).json(new ApiResponse("Achievements created successfully", data));
});


const setAchievements = asyncHandler(async (req, res) => {
  const user = req.user;
  const { achievementId } = req.params;

  if (!achievementId) throw new ApiError(404, 'Please include the achievement ID');
  if (!user) throw new ApiError(400, 'User does not exist');

  // Directly use updateOne without fetching the document first
  const result = await User.updateOne(
    { _id: user._id, "achievements.achievement": { $ne: achievementId } }, // avoid duplicates
    {
      $push: {
        achievements: {
          achievement: achievementId, // let MongoDB handle ObjectId conversion
          earnedAt: new Date()
        }
      }
    }
  );

  if (result.modifiedCount === 0) {
    return res.status(200).json({
      message: "Achievement already added",
    });
  }

  return res.status(200).json({
    message: "Achievement added successfully",
  });
});


const getUrAchivements = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) return res.status(403).json({ message: "Forbidden" });

  const userWithAchievements = await User.findById(user._id)
    .select("name _id achievements")
    .populate({
      path: "achievements.achievement", // populate the 'achievement' field inside array
      select: "_id name type description iconName criteria",
    });

  if (!userWithAchievements) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    statusCode: 200,
    success: true,
    message: "Fetched achievements",
    data: userWithAchievements,
  });
});



const createLeaderboard = asyncHandler(async (req, res) => {
  const usersdata = await User.find().select("_id Points name").lean();

  for (const user of usersdata) {
    await Redisclient.zAdd('leaderboard', {
      score: user.Points,
      value: user._id.toString(),
    });
  }

  return res.status(200).json({
    success: true,
    message: "Leaderboard created/updated successfully",
    data: usersdata,
  });
});




const getLeaderBoard = asyncHandler(async (req, res) => {
  const cacheKey = "Top10Leaderboard";

  let cachedData = await Redisclient.get(cacheKey);
  let leaderboard = [];
  let rank = null;
  let score = null;

  if (cachedData) {
    const parsed = JSON.parse(cachedData);

    if (parsed.length > 0) {
      leaderboard = parsed;
      console.log("cache hit, no miss");

      rank = await Redisclient.zRevRank("leaderboard", req.user._id.toString());
      score = await Redisclient.zScore("leaderboard", req.user._id.toString());
    } else {
      cachedData = null;
    }
  }

  if (!cachedData) {
    const leaderboardData = await Redisclient.zRangeWithScores(
      "leaderboard",
      0,
      9,
      { REV: true }
    );

    rank = await Redisclient.zRevRank("leaderboard", req.user._id.toString());
    score = await Redisclient.zScore("leaderboard", req.user._id.toString());

    const userIds = leaderboardData.map(u => u.value);

    const users = await User.find({ _id: { $in: userIds } })
      .select("_id name ProfileImage")
      .lean();

    leaderboard = leaderboardData.map(ld => {
      const user = users.find(u => u._id.toString() === ld.value);
      return {
        _id: ld.value,
        name: user?.name || "Unknown",
        ProfileImage: user?.ProfileImage || null,
        score: ld.score,
      };
    });

    await Redisclient.set(cacheKey, JSON.stringify(leaderboard));
  }

  return res.status(200).json(
    new ApiResponse(200, "Fetched leaderboard", {
      leaderboardData: leaderboard,
      rank: rank !== null ? rank + 1 : null,   
      score: score !== null ? Number(score) : null,
    })
  );
});



const getLocalLeaderboard = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).select(
    "Points locationPoint name ProfileImage"
  );

  if (
    !currentUser ||
    !currentUser.locationPoint ||
    !currentUser.locationPoint.coordinates
  ) {
    throw new ApiError(400, "User location is required to fetch leaderboard");
  }

  const [lng, lat] = currentUser.locationPoint.coordinates;

  const nearbyUsers = await User.find({
    locationPoint: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: 5000, // 5 km
      },
    },
  })
    .select("_id name ProfileImage Points locationPoint")
    .sort({ Points: -1 })
    .lean();

  const top10 = nearbyUsers.slice(0, 10);

  const userRank =
    nearbyUsers.findIndex(
      (u) => u._id.toString() === currentUser._id.toString()
    ) + 1 || null;

  return res.status(200).json(
    new ApiResponse(200, "Fetched local leaderboard", {
      leaderboardData: top10,
      rank: userRank,
      points: currentUser.Points,
    })
  );
})





const addPointsAchievement = async (userId, eventPoints = 150) => {
  const SocketConnection=getIo();
  const leaderboardKey = "leaderboard";
  const cacheKey = "Top10Leaderboard";

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const beforePoints = user.Points || 0;
  let afterPoints = beforePoints + eventPoints;

  const existingAchievements = user.achievements || [];

  const newAchievements = await Achievement.find({
    type: "point-milestone",
    "criteria.minPoints": { $gt: beforePoints, $lte: afterPoints },
    _id: { $nin: existingAchievements.map(a => a.achievement) }
  });

  const updateAchievements = newAchievements.map(a => ({
    achievement: a._id,
    earnedAt: new Date()
  }));

  const totalBasePoints = newAchievements.reduce(
    (sum, a) => sum + (a.basePoints || 0),
    0
  );
  afterPoints += totalBasePoints;

  await User.updateOne(
    { _id: user._id },
    {
      $set: { Points: afterPoints },
      $addToSet: { achievements: { $each: updateAchievements } }
    }
  );

  const oldRank = await Redisclient.zRevRank(leaderboardKey, user._id.toString());

  const newScore = await Redisclient.zIncrBy(
    leaderboardKey,
    eventPoints + totalBasePoints,
    user._id.toString()
  );

  const newRank = await Redisclient.zRevRank(leaderboardKey, user._id.toString());

  const wasInTop10 = oldRank !== null && oldRank < 10;
  const nowInTop10 = newRank !== null && newRank < 10;

  if (wasInTop10 || nowInTop10) {
    const redisKey = `user:${userId}`;
    const existingUser = await Redisclient.json.get(redisKey);
    if (existingUser?.socketId) {
      SocketConnection.to(existingUser.socketId).emit("userPointUpdated", {
        userId: user._id,
        score: Number(newScore),
        rank: newRank !== null ? newRank + 1 : null
      });
    }
  }

  if (wasInTop10 || nowInTop10) {
    await Redisclient.del(cacheKey);
  }

  const redisKey = `user:${userId}`;
  const existingUser = await Redisclient.json.get(redisKey);

  if (!existingUser?.socketId) return; // user not connected

  const score = await Redisclient.zScore(leaderboardKey, userId.toString());
  const rank = await Redisclient.zRevRank(leaderboardKey, userId.toString());

  SocketConnection.to(existingUser.socketId).emit("ownRank", {
    userId,
    score: score !== null ? Number(score) : 0,
    rank: rank !== null ? rank + 1 : null
  });

  return {
    message: "Points added and achievements updated",
    beforePoints,
    afterPoints,
    newAchievements: updateAchievements,
    newScore: Number(newScore),
    newRank
  };
};


const EventCompletedgrantPoints = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  if (!eventId) throw new ApiError(404, 'access denied bruh');

  const checkeventStatus = await Event.findOne({ _id: eventId }).lean();
  if (!checkeventStatus) throw new ApiError(403, 'points cannot be distributed');

  const ParticipatedPeoples = await Participation.findOne({ event: eventId }).lean();
  console.log("participated people", ParticipatedPeoples);

  if (ParticipatedPeoples?.participants?.length) {
    ParticipatedPeoples.participants.forEach(async (element) => {
      await addPointsAchievement(element.user); // element.user is the userId
    });
  }

  res.status(200).json({ message: "Points distributed successfully" });
});



export { CreateAchievement ,setAchievements,getUrAchivements,createLeaderboard
  ,getLeaderBoard,getLocalLeaderboard,addPointsAchievement
  ,EventCompletedgrantPoints
};
