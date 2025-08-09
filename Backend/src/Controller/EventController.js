import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import upload2Cloudinary from '../Utils/CloundinaryImg.js'
import Event from '../Schema/Event.js'
import User from '../Schema/User.js'
import Review from '../Schema/Review.js'
import ApiError from '../Utils/ApiError.js'
import { Redisclient } from '../Utils/RedisUtil.js'
import axios from 'axios';
import SetQrJob from '../Jobs/AgendaFxns.js'
import { error } from 'console'

dotenv.config()

  const EventForm = asyncHandler(async (req, res) => {
    try {
      console.log(req.body)
      const user=req.user;
      console.log("User:",user);
      const { title, date, time, location, description, requiredVolunteers, problemStatement,coordinates } = req.body;

      const submittedDate = new Date(date)
const today = new Date();
today.setHours(0, 0, 0, 0);
if (submittedDate < today) {
  throw new Error('Date cannot be in the past.');
}
      const images = req.files; 


    const slug = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const coordsObj = JSON.parse(coordinates); 

    const locationPoint = {
    type: "Point",
    coordinates: [coordsObj.lng, coordsObj.lat] 
};
      const imgPaths = [];
  
      for (const img of images) {
        const { path } = img;
        const { uploadResult, optimizeUrl } = await upload2Cloudinary(path);
        imgPaths.push(optimizeUrl);
      }
      const event = new Event({
        title: title,
        slug: slug,
        time: time,
        date: date,
        location: location,
        description: description,
        VolunteersReq: requiredVolunteers,
        problemStatement: problemStatement,
        EventImg: imgPaths,
        Host: req.user._id,
        coordinates: coordinates,
        locationPoint: locationPoint,
      });
  
      await event.save();
  async function invalidateEventsCache() {
  const keys = await Redisclient.sMembers("events:cache_keys");
  if (keys.length > 0) {
    await Redisclient.del(...keys);
    await Redisclient.del("events:cache_keys");
    console.log("Invalidated cached event list keys");
  }
}
      await invalidateEventsCache();
      await SetQrJob(event._id,date); // Schedule QR generation job

      return res.send(new ApiResponse(200, 'Event Form Submitted Successfully', imgPaths));
    } catch (err) {
      console.log("Error in Event Form", err);
      return res.status(500).send(new ApiResponse(500, 'Error in Event Form', null));
    }
  });

  const Eventinfo = asyncHandler(async (req, res) => {
    const { title } = req.params;

    const isValidTitle = /^[a-zA-Z0-9\s\-'&]+$/.test(title);
    
    if (!isValidTitle) {
        return res.status(400).json({ error: "Invalid event title" });
    }
    console.log("Title:", title);  
    const cacheKey = `event:${title}`;

    try {
        const cachedData = await Redisclient.json.get(cacheKey);
        if (cachedData) {
            console.log("Returning Cached Data");
            return res.send(new ApiResponse(200, 'Event Info (Cached)', cachedData));
        }

        const response = await Event.findOne({ title })
            .select("title date time location description VolunteersReq problemStatement EventImg EventRating Host locationPoint")
            .populate({
                path: "EventReview",
                select: "Review Rating Reviewer createdAt",
                populate: {
                    path: "Reviewer",
                    select: "name ProfileImage",
                },
            })
            .populate({
                path: "Host",
                select: "name ProfileImage",
            });

        console.log("Response:", response);

        if (!response) {
            return res.send(new ApiResponse(404, 'Event not found', null));
        }

        await Redisclient.json.set(cacheKey, "$", response); 
        await Redisclient.expire(cacheKey, 300);
        return res.send(new ApiResponse(200, 'Event Info', response));

    } catch (err) {
        console.log("Error in Event Info", err);
        return res.send(new ApiResponse(500, 'Error in retrieving info', null));
    }
});

const LoadEvents = asyncHandler(async (req, res) => {
  try {
    const { filter = "all", page = 1, limit = 10 } = req.params;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    let matchStage = {};
    let sortStage = { date: 1 };
    let userCoordinates = null;
    let useGeoQuery = false;

    if (filter === "nearby") {
      if (!req.user) throw new ApiError(400, "User not authenticated for nearby events");
      const user = await User.findById(req.user._id);
      if (!user || !user.locationPoint || !user.locationPoint.coordinates) {
        return res.status(400).json({ message: "User location not set" });
      }
      userCoordinates = user.locationPoint.coordinates; // [lng, lat]
      useGeoQuery = true;
    }

    switch (filter) {
      case "latest":
        sortStage = { createdAt: -1 };
        break;
      case "oldest":
        sortStage = { createdAt: 1 };
        break;
      case "completed":
        matchStage = { EventStatus: "completed" };
        break;
      case "pending":
        matchStage = { EventStatus: "pending" };
        break;
      // 'all' or other filters do nothing extra
    }

    const cacheKey = `events:${filter}:page-${parsedPage}:limit-${parsedLimit}`;

    // Check cache
    const cachedData = await Redisclient.json.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        statusCode: 200,
        message: "Events Loaded Successfully (Cached)",
        data: cachedData,
      });
    }

    const skip = (parsedPage - 1) * parsedLimit;
    const query = { ...matchStage };

    if (useGeoQuery) {
      // radius in kilometers
      const radiusKm = 5;
      const earthRadiusKm = 6378.1;
      const radiusRadians = radiusKm / earthRadiusKm;

      query.locationPoint = {
        $geoWithin: {
          $centerSphere: [userCoordinates, radiusRadians],
        },
      };
    }

    const totalEvents = await Event.countDocuments(query);

    const events = await Event.find(query)
      .sort(sortStage)
      .skip(skip)
      .limit(parsedLimit)
      .select({
        EventImg: { $slice: 2 },
        title: 1,
        EventStatus: 1,
        date: 1,
        time: 1,
        location: 1,
        locationPoint: 1,
        Participants: 1,
      })
      .lean();

    const eventsWithParticipantCount = events.map((ev) => ({
      ...ev,
      participantCount: ev.Participants ? ev.Participants.length : 0,
    }));

    const totalPages = Math.ceil(totalEvents / parsedLimit);

    const responseData = {
      events: eventsWithParticipantCount,
      totalEvents,
      currentPage: parsedPage,
      totalPages,
      hasMore: parsedPage < totalPages,
    };

    await Redisclient.json.set(cacheKey, "$", responseData);
    await Redisclient.expire(cacheKey, 300);

    // Conditionally track cache keys to invalidate later
    if (filter !== "nearby") {
      await Redisclient.sAdd("events:cache_keys", cacheKey);
    }

    return res.status(200).json({
      statusCode: 200,
      message: "Events Loaded Successfully",
      data: responseData,
    });
  } catch (err) {
    console.error("Error loading events:", err);
    return res.status(500).json({
      statusCode: 500,
      message: "Server Error",
      error: err.message,
    });
  }
});


const joinEvent = asyncHandler(async (req, res) => {
  console.log("Join Event Controller");
  const user = req.user;
  const { _id } = req.body;
  console.log("User:", user?._id, "event id:", _id);

  if (!user) {
    return res.send(new ApiResponse(400, "Invalid Credentials", null));
  }

  if (!_id) {
    return res.send(new ApiResponse(400, "Event Id is required", null));
  }

  try {
    const event = await Event.findOne({ title: _id });
    if (!event) {
      return res.send(new ApiResponse(404, "Event not found", null));
    }

    const existingUser = await User.findOne({ _id: user._id })
      .select("JoinedEvents _id")
      .populate("JoinedEvents", "date");

    if (!existingUser) {
  throw new ApiError(404, "User not found");
    }

    if (event.Participants.includes(user._id)) {
    throw new ApiError(400, "You have already joined this event",error);
    }

    event.Participants.push(user._id);
    existingUser.JoinedEvents.push(event._id);
    const key=(`JoinedEvents${req.user._id}`)
    await Redisclient.del(key)
    await existingUser.save();
    await event.save();

async function invalidateEventsCache() {
  const keys = await Redisclient.sMembers("events:cache_keys");
  if (keys.length > 0) {
    await Redisclient.del(...keys);
    await Redisclient.del("events:cache_keys");
    console.log("Invalidated cached event list keys");
  }
}
      await invalidateEventsCache();
    return res.send(new ApiResponse(200, "Joined Event Successfully", null));
  } catch (err) {
    console.error("Error in Join Event:", err);
    throw new ApiError(500, "Internal Server Error");
  }
});

  
  const removeParticipation=asyncHandler(async(req,res)=>{
    const Events=await Event.find({}).select('title Participants date');

    if(!Events){
      return res.send(new ApiResponse(404,"No Events Found",null));
    }
    const user=req.user;
    const existingUser=await User.findOne({_id:user._id}).select('JoinedEvents');
    existingUser.JoinedEvents=[];
    await existingUser.save();
    
    for(const Event of Events){
      Event.Participants=[];
      await Event.save();
    }
    return res.send(new ApiResponse(200,"Participation Removed Successfully",null));
  })


  const ReportEvent=asyncHandler(async (req,res)=>{
    const {title,issue}=req.body;
    if(!title && !issue){
      return res.send(new ApiResponse(400,"please fill all the issues",null));
    }
    console.log("Title:",title,"Issue:",issue);
    return res.send(new ApiResponse(200,"Issue Reported Successfully",null));
  })

  const SubscribeEvent=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    if(!email){
      return res.send(new ApiResponse(400,"Email is required",null));
    }
    console.log("Email:",email);
    return res.send(new ApiResponse(200,"Subscribed Successfully",null));
  })

const AddReview = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ApiError(400, "Invalid Credentials"));
  }

  const { title: reqTitle, rating, review: ReviewText } = req.body;
  if (!reqTitle || !rating || !ReviewText) {
    return next(new ApiError(400, "Please fill all the fields"));
  }

  try {
    const existingEvent = await Event.findOne({ title: reqTitle })
      .select("EventReview title")
      .populate({
        path: "EventReview",
        populate: { path: "Reviewer", select: "name ProfileImage" },
      });

    if (!existingEvent) {
      throw new ApiError(404, "Event not found");
    }

    const newReview = new Review({
      Reviewer: user._id,
      Review: ReviewText,
      Rating: rating,
      Event: existingEvent._id,
    });
    await newReview.save();

    existingEvent.EventReview.push(newReview._id);
    await existingEvent.save();

    const populatedReview = await Review.findById(newReview._id).populate({
      path: "Reviewer",
      select: "_id name ProfileImage",
    });

    const redisReviewData = {
      _id: populatedReview._id.toString(),
      Reviewer: {
        _id: populatedReview.Reviewer._id.toString(),
        name: populatedReview.Reviewer.name,
        ProfileImage: populatedReview.Reviewer.ProfileImage || "",
      },
      Review: populatedReview.Review,
      Rating: populatedReview.Rating,
      createdAt: populatedReview.createdAt,
    };

    const cacheKey = `event:${existingEvent.title}`;

    try {
      const cachedEvent = await Redisclient.json.get(cacheKey);
      if (cachedEvent) {
        await Redisclient.json.arrAppend(cacheKey, '.EventReview', redisReviewData);
      } else {
        console.warn("No cache found for event:", cacheKey);
      }
    } catch (redisErr) {
      console.error("Redis error while updating review:", redisErr.message);
      await Redisclient.del(cacheKey);
    }

    return res.status(200).json(new ApiResponse(200, "Review Added Successfully", null));
  } catch (err) {
    console.error("Error in Add Review:", err);
    return next(err);
  }
});


const RemoveReview = asyncHandler(async (req, res) => {
  const user = req.user;
  const { reviewId } = req.params;

  if (!user) {
    return res.status(400).json(new ApiResponse(400, "Invalid Credentials", null));
  }
  if (!reviewId) {
    return res.status(400).json(new ApiResponse(400, "Review Id is required", null));
  }
  try {

    const review = await Review.findOne({ _id: reviewId }).select('Reviewer');
    console.log("Review:", review);
    if (!review) {
      return res.status(404).json(new ApiResponse(404, "Review not found", null));
    }
    if (!review.Reviewer.equals(user._id)) {
      console.log("You are not authorized to remove this review");
      return res.status(403).json(new ApiResponse(403, "You are not authorized to remove this review", null));
    }
    const event = await Event.findOneAndUpdate(
      { EventReview: reviewId },
      { $pull: { EventReview: reviewId } }, 
      { new: true }
    ).select('EventReview title');

    if (!event) {
      return res.status(404).json(new ApiResponse(404, "Event not found", null));
    }

    await Review.deleteOne({ _id: reviewId });
    console.log("Review Removed Successfully");
    const cacheKey = `event:${event.title}`;
    await Redisclient.del(cacheKey);
    return res.status(200).json(new ApiResponse(200, "Review Removed Successfully", { reviewId }));

  } catch (err) {
    console.error("Error in Remove Review", err);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error", null));
  }
});

const ClearALlReviews=asyncHandler(async(req,res)=>{
  const Reviews=await Review.find({}).select('_id');
  for(const review of Reviews){
    await Review.deleteOne({_id:review._id});}

    const Events=await Event.find({}).select('EventReview');
    for(const event of Events){
      event.EventReview=[];
      await event.save();
    } 
    return res.send(new ApiResponse(200,"All Reviews Removed Successfully",null));
})

const fetchEvents = async ({ filter = 'all', page = 1, limit = 8 }) => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}event/loadevents/${filter}/${page}/${limit}`,
            { withCredentials: true }
        );

        if (response.data.statusCode === 200) {
            return {
                events: response.data.data.events,
                totalEvents: response.data.data.totalEvents,
                currentPage: response.data.data.currentPage,
                totalPages: response.data.data.totalPages,
                hasMore: response.data.data.hasMore
            };
        }
        throw new Error(response.data.message);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
};

const HomeEvents = asyncHandler(async (req, res) => {
  try {
    const cachedData = await Redisclient.json.get('HomeEvents');
    if (cachedData) {
      console.log("Returning from Redis cache");
      return res.send(cachedData);
    }

    const priorityEvents = await Event.aggregate([
      { $match: { priority: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          time: 1,
          date: 1,
          location: 1,
          EventStatus: 1,
          EventImg: 1,
          participantCount: { $size: "$Participants" }
        }
      },
      { $limit: 4 }
    ]);

    const count = priorityEvents.length;

    let additionalEvents = [];
    if (count < 4) {
      additionalEvents = await Event.aggregate([
        { $match: { priority: { $ne: true } } },
        { $sample: { size: 4 - count } },
        {
          $project: {
            _id: 1,
            title: 1,
            time: 1,
            date: 1,
            location: 1,
            EventStatus: 1,
            EventImg: 1,
            participantCount: { $size: "$Participants" }
          }
        }
      ]);
    }

    const finalEvents = [...priorityEvents, ...additionalEvents];
    await Redisclient.json.set('HomeEvents', '$', finalEvents);
    await Redisclient.expire('HomeEvents', 300);

    return res.send(finalEvents);

  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Failed to load home events" });
  }
});

const ActiveEvents = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    return res.status(404).send(new ApiError(404, 'Invalid request blocked'));
  }

  const events = await CacheJoinedEvent(userId);
  return res.send(new ApiResponse(200, 'Received the active events list', events));
});

const CacheJoinedEvent = async (userId) => {
  try {
    const cachedData = await Redisclient.json.get(`JoinedEvents${userId}`);
    if (cachedData) {
      return cachedData;
    }

    const user = await User.findById(userId).select('JoinedEvents');
    if (!user?.JoinedEvents?.length) {
      return [];
    }

    const events = await Event.aggregate([
      {
        $match: {
          _id: { $in: user.JoinedEvents }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          date: 1,
          participantCount: { $size: '$Participants' },
          Messages:[]
        }
      }
    ]);

    await Redisclient.json.set(`JoinedEvents${userId}`, '.', events);
    await Redisclient.expire(`JoinedEvents${userId}`, 300);

    return events;
  } catch (error) {
    console.error('Error in CacheJoinedEvent:', error);
    return [];
  }
};


const changeStatus = asyncHandler(async (req, res) => {
  const { eventId, status } = req.body;

  if (!eventId || !status) {
    return res.status(400).json(new ApiResponse(400, "Event ID and status are required", null));
  }

  try {
    const event = await Event.findOneAndUpdate(
      { _id: eventId, EventStatus: { $ne: status } }, 
      { $set: { EventStatus: status } },
      { new: true } 
    );

    if (!event) {
     throw new ApiError(404, "Event not found or status already set to the requested value");
    }
    async function invalidateCompletedEventsCache() {
  const keys = await Redisclient.sMembers("events:cache_keys");
  const completedKeys = keys.filter((key) => key.startsWith("events:completed:"));

  if (completedKeys.length > 0) {
    await Redisclient.del(...completedKeys); // delete the keys
    await Redisclient.sRem("events:cache_keys", ...completedKeys); // remove from tracking set
    console.log("Invalidated completed event cache keys");
  } else {
    console.log("No completed event cache keys found");
  }
}
    await invalidateCompletedEventsCache();
    return res
      .send(new ApiResponse(200, "Event status changed successfully", null));

  } catch (err) {
    console.error("Error in changing status:", err);
    return res.status(500).json(new ApiResponse(500, "Internal Server Error", null));
  }
});


const SearchEvents = asyncHandler(async (req, res) => {
  const { keyword, type } = req.query;
  if (!type || !keyword) {
    return res.status(400).json(new ApiResponse(400, "Search query is required", null));
  }

  if (!['title', 'location'].includes(type)) {
    return res.status(400).json(new ApiResponse(400, "Invalid search type", null));
  }

  const filter = {};
  filter[type] = { $regex: keyword, $options: 'i' };

  const event = await Event.find(filter)
    .limit(4)  
    .select('title _id date EventStatus location');

  return res.status(200).json(new ApiResponse(200, "Events found", event));
});



export {
    EventForm,
    Eventinfo,
    LoadEvents,
    joinEvent,
    removeParticipation,
    ReportEvent,
    SubscribeEvent,
    AddReview,
    RemoveReview,
    ClearALlReviews,
    fetchEvents,
    HomeEvents,
    ActiveEvents,
    CacheJoinedEvent,
    changeStatus,
    SearchEvents
}
