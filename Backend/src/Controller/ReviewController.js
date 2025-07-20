import User from '../Schema/User.js';
import Event from '../Schema/Event.js';
import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from '../Utils/ApiError.js';
import Review from '../Schema/Review.js';
import dotenv from 'dotenv';
dotenv.config();



const EditUserReview = asyncHandler(async (req, res) => {
    const { reviewId, review } = req.params;
    const user = req.user;

    if (!reviewId || !review) {
        throw new ApiError(400, 'Review ID and review text are required');
    }

    const updatedReview = await Review.findOneAndUpdate(
        { _id: reviewId, Reviewer: user._id },
        { Review: review },
        { new: true } 
    );

    if (!updatedReview) {
        throw new ApiError(403, 'Review not found or you are not allowed to edit it');
    }

    res.send(new ApiResponse(200, 'Review updated successfully', updatedReview));
});

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