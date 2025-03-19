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

const CreateEventReport = asyncHandler(async (req, res) => {
    const eventHash = req.params.title // Event hash ID (this could be passed dynamically)
    const user = req.user;  // Assuming the user is authenticated

    console.log(eventHash)

    if (!user) throw new ApiError(401, 'Please include cookies in request');

    const existingEvent = await Event.findOne({ title: eventHash });
    if (!existingEvent) throw new ApiError(400, 'The event does not exist');

    const heading = {
        title: existingEvent.title,
        date: existingEvent.date,
        time: existingEvent.time,
        location: existingEvent.location,
    };

    const BeforeAfter = {
        Before:[ existingEvent.EventImg[0]], 
        After: [''], 
    };

    const Eventdetails = {
        date: existingEvent.date,
        StartTime: existingEvent.time,
        EndingTime: '12:00', 
        Location: existingEvent.location,
    };

    // Fetch the latest 2 reviews for the event
    const reviews = await Review.aggregate([
        { $match: { Event: existingEvent._id } },
        { $lookup: { from: 'users', localField: 'Reviewer', foreignField: '_id', as: 'Reviewer' } },
        { $unwind: '$Reviewer' },
        { $project: { ReviewID: '$_id', Review: 1, Rating: 1, Reviewer: '$Reviewer.name' } },
        { $sort: { createdAt: -1 } },
        { $limit: 2 }  // Limit to the top 2 reviews
    ]);

    const ReviewsAndFeedback = reviews.map(({ ReviewID, Review, Rating, Reviewer }) => ({
        ReviewID,
        Review,
        Rating,
        Reviewer,
    }));

    // Fetch the latest 2 community posts for the event
    let communityPosts = await CommunityDiscussion.find({ EventId: existingEvent._id })
    .populate('postedBy', 'name ProfileImage')
    .populate('comments.commentBy', 'name ProfileImage')
    .populate('comments.replies.repliedBy', 'name ProfileImage')
    .lean(); 
  
    communityPosts = communityPosts.map((post) => {
        return {
          ...post,
          hasLiked: post.likes.some((likeId) => likeId.toString() === user._id),
          likesCount: post.likes.length,
          comments: post.comments.map(comment => ({
            commentID: comment.commentID,
            comment: comment.comment,
            commentDate: comment.date,
            commenter: {
              name: comment.commentBy.name,
              profileImage: comment.commentBy.ProfileImage,
            },
            replies: comment.replies.map(reply => ({
              replyID: reply.replyID,
              reply: reply.reply,
              replyDate: reply.date,
              repliedBy: {
                name: reply.repliedBy.name,
                profileImage: reply.repliedBy.ProfileImage,
              }
            }))
          })),
        };
      });
      
    // Debugging: Check the data coming from the aggregation
    console.log('Fetched community posts:', communityPosts);

    return res.send(new ApiResponse(200, 'Successfully generated the report', { heading, BeforeAfter, Eventdetails, ReviewsAndFeedback, communityPosts }));
});


export {
    CreateEventReport
}