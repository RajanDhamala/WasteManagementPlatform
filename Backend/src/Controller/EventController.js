import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import upload2Cloudinary from '../Utils/CloundinaryImg.js'
import Event from '../Schema/Event.js'
import User from '../Schema/User.js'
import Review from '../Schema/Review.js'


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

  const Eventinfo=asyncHandler(async(req,res)=>{
    const {title}=req.params;
    
    const isValidTitle = /^[a-zA-Z0-9\s\-'&]+$/.test(title);
    
    if (!isValidTitle) {
        return res.status(400).json({ error: "Invalid event title" });
    }
    
      console.log("Title:",title);  
    try{
        const response=await Event.findOne({title}).select('title date time location description VolunteersReq problemStatement EventImg EventRating Host').populate({
          path:'EventReview',
          select:'Review Rating Reviewer',

        });
        console.log("Response:",response);

        if(!response){
            return res.send(new ApiResponse(404,'Event not found',null))
        }
        return res.send(new ApiResponse(200,'Event Info',response))

    }catch(err){
        console.log("Error in Event Info",err);
        return res.send(new ApiResponse(500,'Error in retriving info',null))
    }

  })

  const LoadEvents=asyncHandler(async(req,res)=>{
    try{
      const pipeline = [
        {
          $project: {
            _id: 1,
            EventImg: {
              $slice: ["$EventImg", 2]
            },
            title: 1,
            EventStatus: 1,
            date: 1,
            time: 1,
            location: 1,
            participantCount: { $size: "$Participants" }
          }
        },
        {
          $sort: { date: 1 }
        },{
          $limit:10
        }
      ];
      
      const Events = await Event.aggregate(pipeline);

      console.log("Events:",Events);
      return res.send(new ApiResponse(200,'Events Loaded Successfully',Events));

    }catch(err){
      console.log("Error in Load Events",err);
    }
  })

  const joinEvent = asyncHandler(async (req, res) => {
    console.log("Join Event Controller");
    const user = req.user;
    const { _id } = req.body;
    console.log("User:", user,_id);
  
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


  const AddReview = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.send(new ApiResponse(400, "Invalid Credentials", null));
    }
    const { title, rating, review: ReviewText } = req.body;
    if (!title || !rating || !ReviewText) {
        return res.send(new ApiResponse(400, "Please fill all the fields", null));
    }
    console.log("Title:", title, "Rating:", rating, "Review:", ReviewText);
    try {
        const existingEvent = await Event.findOne({ title: title }).select('EventReview title');

        if (!existingEvent) {
            return res.send(new ApiResponse(404, "Event not found", null));
        }
        const existingReview = await Review.findOne({Event: existingEvent._id,Reviewer: user._id});

        if (existingReview) {
            return res.send(new ApiResponse(400, "You have already reviewed this event", null));
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

        return res.send(new ApiResponse(200, "Review Added Successfully", null));
    } catch (err) {
        console.log("Error in Add Review", err);
        return res.send(new ApiResponse(500, "Internal Server Error", null));
    }
});


const RemoveReview=asyncHandler(async(req,res)=>{
const user=req.user;
const {reviewId}=req.body; 

if(!user){
  return res.send(new ApiResponse(400,"Invalid Credentials",null));
}

if(!reviewId){
  res.send(new ApiResponse(400,"Review Id is required",null));
}
try{
  const review = await Review.findOne({ _id: reviewId }).select('Reviewer');
  if(!review){
    return res.send(new ApiResponse(404,"Review not found",null));
  }
  if(review.Reviewer.toString()!==user._id){
  res.send(new ApiResponse(400,"You are not authorized to remove this review",null));
  console.log("You are not authorized to remove this review");
  }
  
  const Eventss=await Event.findOne({EventReview:reviewId}).select('EventReview');

  if(!Eventss){
    return res.send(new ApiResponse(404,"Event not found",null));
  }
  Eventss.EventReview.pull(reviewId);
  await Review.deleteOne({ _id: reviewId });
  await Eventss.save();
  console.log("Review Removed Successfully");
  res.send(new ApiResponse(200,"Review Removed Successfully",null));

}catch(err){
  console.log("Error in Remove Review",err);
  return res.send(new ApiResponse(500,"Internal Server Error",null));
}
})


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
    ClearALlReviews
}
