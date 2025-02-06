import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import upload2Cloudinary from '../Utils/CloundinaryImg.js'
import Event from '../Schema/Event.js'
import User from '../Schema/User.js'


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
        const response=await Event.findOne({title}).select('title date time location description VolunteersReq problemStatement EventImg');

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
  
export {
    EventForm,
    Eventinfo,
    LoadEvents,
    joinEvent,
    removeParticipation,
    ReportEvent,
    SubscribeEvent
}
