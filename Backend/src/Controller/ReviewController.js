import User from '../Schema/User.js';
import Event from '../Schema/Event.js';
import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from '../Utils/ApiError.js';
import Review from '../Schema/Review.js';
import dotenv from 'dotenv';
import { Redisclient } from '../Utils/RedisUtil.js';
dotenv.config();



const EditUserReview = asyncHandler(async (req, res) => {
  const { reviewId, review } = req.params;
  const user = req.user;

  if (!reviewId || !review) {
    throw new ApiError(400, "Review ID and review text are required");
  }

  const [updatedReview, event] = await Promise.all([
    Review.findOneAndUpdate(
      { _id: reviewId, Reviewer: user._id },
      { Review: review },
      { new: true }
    ),
    Event.findOne({ EventReview: reviewId }).select("title")
  ]);

  if (!updatedReview) {
    throw new ApiError(403, "Review not found or not yours");
  }
  if (!event) {
    throw new ApiError(404, "Event not found for this review");
  }
  const cacheKey = `event:${event.title}`;
  try {
    const cached = await Redisclient.json.get(cacheKey);

    if (cached?.EventReview) {
      const index = cached.EventReview.findIndex(r => r._id === reviewId);

      if (index !== -1) {
        await Redisclient.json.set(
          cacheKey,
          `.EventReview[${index}].Review`,
          review
        );
      } else {
        console.warn("Review ID not found in Redis cache array");
      }
    }
  } catch (err) {
    console.error("Redis error during Review edit sync:", err.message);
    await Redisclient.del(cacheKey);
  }

  return res.status(200).json(
    new ApiResponse(200, "Review updated successfully", updatedReview)
  );
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