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

dotenv.config()

  const EventForm = asyncHandler(async (req, res) => {
    try {
      const user=req.user;
      console.log("User:",user);
      const { title, date, time, location, description, requiredVolunteers, problemStatement } = req.body;
      const images = req.files;
      console.log("Title:", title, "Date:", date, "Time:", time, "Location:", location,
        "Description:", description, "Required Volunteers:", requiredVolunteers, "Problem Statement:", problemStatement);
      console.log("Images:", images);

      const slug = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  
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
      });
  
      await event.save();
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
            .select("title date time location description VolunteersReq problemStatement EventImg EventRating Host")
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
        const { filter = 'all', page = 1, limit = 10 } = req.params;
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        let matchStage = {};
        let sortStage = { date: 1 };

        // Configure filter conditions
        switch (filter) {
            case "latest":
                sortStage = { date: -1 }; // Changed to -1 for latest first
                break;
            case "oldest":
                sortStage = { date: 1 };
                break;
            case "completed":
                matchStage = { EventStatus: "completed" };
                break;
            case "pending":
                matchStage = { EventStatus: "pending" };
                break;
            default:
                break;
        }

        // Create cache key
        const cacheKey = `events:${filter}:page-${parsedPage}:limit-${parsedLimit}`;
        const cachedData = await Redisclient.json.get(cacheKey);
        
        if (cachedData) {
            console.log("Returning Cached Data");
            return res.status(200).json({
                statusCode: 200,
                message: "Events Loaded Successfully (Cached)",
                data: {
                    events: cachedData.events,
                    totalEvents: cachedData.totalEvents,
                    currentPage: cachedData.currentPage,
                    totalPages: cachedData.totalPages,
                    hasMore: cachedData.hasMore
                }
            });
        }

        // Get total count first
        const totalEvents = await Event.countDocuments(matchStage);
        const totalPages = Math.ceil(totalEvents / parsedLimit);
        const skip = (parsedPage - 1) * parsedLimit;

        // Main query with pagination
        const events = await Event.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: parsedLimit },
            {
                $project: {
                    _id: 1,
                    EventImg: { $slice: ["$EventImg", 2] },
                    title: 1,
                    EventStatus: 1,
                    date: 1,
                    time: 1,
                    location: 1,
                    participantCount: { $size: "$Participants" },
                }
            }
        ]);

        const responseData = {
            events,
            totalEvents,
            currentPage: parsedPage,
            totalPages,
            hasMore: parsedPage < totalPages
        };

        // Cache the response
        await Redisclient.json.set(cacheKey, "$", responseData);
        await Redisclient.expire(cacheKey, 300); // 5 minutes cache

        return res.status(200).json({
            statusCode: 200,
            message: "Events Loaded Successfully",
            data: responseData
        });

    } catch (err) {
        console.error("Error in Load Events:", err);
        return res.status(500).json({
            statusCode: 500,
            message: "Internal Server Error",
            error: err.message
        });
    }
});


  
  const joinEvent = asyncHandler(async (req, res) => {
    console.log("Join Event Controller");
    const user = req.user;
    const { _id } = req.body;
    console.log("User:", user._id,"event id :",_id);
  
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
        .populate({
          path: "JoinedEvents",
          select: "date",
        });
  
      console.log("Existing User:", existingUser);
      if (!existingUser) {
        return res.send(new ApiResponse(404, "User not found", null));
      }
  
      const isAlreadyJoined = event.Participants.includes(user._id);
      if (isAlreadyJoined) {
        return res.send(new ApiResponse(400, "You had already joined this event", null));
      }
  
      event.Participants.push(user._id);
      existingUser.JoinedEvents.push(event._id);
  
      await existingUser.save();
      await event.save();
      const data = await Redisclient.json.numIncrBy('events:all', `$[?(@.title=="${_id}")].participantCount`, 1);
      console.log("Participant count incremented successfully:", data);


      return res.send(new ApiResponse(200, "Joined Event Successfully", null));
    } catch (err) {
      console.log("Error in Join Event", err);
      return res.send(new ApiResponse(500, "Internal Server Error", null));
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

    const { title, rating, review: ReviewText } = req.body;
    if (!title || !rating || !ReviewText) {
        return next(new ApiError(400, "Please fill all the fields"));
    }

    console.log("Title:", title, "Rating:", rating, "Review:", ReviewText);

    try {
        const existingEvent = await Event.findOne({ title: title }).select('EventReview title');

        if (!existingEvent) {
            throw new ApiError(404, "Event not found");
        }

        const existingReview = await Review.findOne({ Event: existingEvent._id, Reviewer: user._id });

        if (existingReview) {
            throw new ApiError(400, "You have already reviewed this event");
        }

        const review = new Review({
            Reviewer: user._id,
            Review: ReviewText,
            Rating: rating,
            Event: existingEvent._id
        });

        await review.save();

        existingEvent.EventReview.push(review._id);
        await existingEvent.save();

        return res.status(200).json(new ApiResponse(200, "Review Added Successfully", null));
    } catch (err) {
        console.log("Error in Add Review:", err);
        next(err);  
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
    ).select('EventReview');

    if (!event) {
      return res.status(404).json(new ApiResponse(404, "Event not found", null));
    }

    await Review.deleteOne({ _id: reviewId });
    console.log("Review Removed Successfully");
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
    CacheJoinedEvent
}
