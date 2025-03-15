import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import Review from '../Schema/Review.js'
import ApiError from '../Utils/ApiError.js'
import Event from '../Schema/Event.js'
import EventReport from '../Schema/EventReport.js'
import User from '../Schema/User.js'
import CommunityDiscussion from '../Schema/CommunityDiscussion.js'

dotenv.config()


const CreateEventReport=asyncHandler(async(req,res)=>{

    const {eventTitle}=req.body
    const user=req.user

    const {beforeImages,afterImages}=req.files

    if(!req.user){
        throw new ApiError(401,'User not authenticated')
    }

    const existingEvent=await Event.findOne({title:eventTitle})

    if(!existingEvent){
        throw new ApiError(404,'Event not found')
    }
    const reviews=await Review.find({Event:existingEvent._id})

    const EventReport= await new EventReport({
        Event:existingEvent._id,
        Title:eventTitle.title,
        CommunityDiscussion:null,
        ReviewsAndFeedback:null,
        EventGallery:[],
        Participants:[],
    })

    await EventReport.save()

})

export {
    CreateEventReport
}