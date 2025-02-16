import User from '../Schema/User.js';
import Event from '../Schema/Event.js';
import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from '../Utils/ApiError.js';
import Review from '../Schema/Review.js';
import dotenv from 'dotenv';
dotenv.config();


const EditUserReview=asyncHandler(async(req,res)=>{
    const {reviewId,review}=req.params;
    const user=req.user;

    console.log(reviewId,review)

    if (!reviewId || !review) {
        throw new ApiError(400, 'Review ID and review text are required');
    }
const existingReview=await Review.findOne({_id:reviewId});
if(!existingReview){
    throw new ApiError(404, 'Review not found')
}
console.log(existingReview)

if(existingReview.Reviewer.toString()!==user._id.toString()){
    throw new ApiError(403, 'You are not allowed to edit this review')
}
existingReview.Review=review;
await existingReview.save();

res.send(new ApiResponse(200, 'Review updated successfully', existingReview));
})

const ReportReview=asyncHandler(async(req,res)=>{
    const {reviewId}=req.params;

    if (!reviewId) {
        throw new ApiError(400, 'Review ID and issue is required');
    }
    console.log(reviewId,"reported by:")
    res.send(new ApiResponse(200, 'Review reported successfully', reviewId));
})

export {
    EditUserReview,
    ReportReview
}