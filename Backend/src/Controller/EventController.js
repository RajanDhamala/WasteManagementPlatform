import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import upload2Cloudinary from '../Utils/CloundinaryImg.js'
import Event from '../Schema/Event.js'


dotenv.config()

const AddEvent = asyncHandler(async (req, res) => {
    console.log("some hit this controller")
    res.send(new ApiResponse(200, 'Event Added Successfully', null))
})

  const EventForm = asyncHandler(async (req, res) => {
    try {
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
        EventImg: imgPaths
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
            _id: 0,
            EventImg: {
              $slice: ["$EventImg", 2] // Return up to 2 images (first 2 if available)
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
          $sort: { date: -1 } // Sort by latest first
        }
      ];
      
      const Events = await Event.aggregate(pipeline);

      console.log("Events:",Events);
      return res.send(new ApiResponse(200,'Events Loaded Successfully',Events));

    }catch(err){
      console.log("Error in Load Events",err);
    }
  })
  

export {
    AddEvent,
    EventForm,
    Eventinfo,
    LoadEvents
}
