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
    const eventHash = req.params.title 
    const user = req.user; 
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
        EventId:existingEvent._id
    };

    const reviews = await Review.aggregate([
        { $match: { Event: existingEvent._id } },
        { $lookup: { from: 'users', localField: 'Reviewer', foreignField: '_id', as: 'Reviewer' } },
        { $unwind: '$Reviewer' },
        { $project: { ReviewID: '$_id', Review: 1, Rating: 1, Reviewer: '$Reviewer.name' } },
        { $sort: { createdAt: -1 } },
        { $limit: 2 }  
    ]);

    const ReviewsAndFeedback = reviews.map(({ ReviewID, Review, Rating, Reviewer }) => ({
        ReviewID,
        Review,
        Rating,
        Reviewer,
    }));

   
    let communityPosts = await CommunityDiscussion.find({ EventId: existingEvent._id })
    .sort({ createdAt: -1 }) 
    .limit(2)
    .populate('postedBy', 'name ProfileImage')
    .populate('comments.commentBy', 'name ProfileImage')
    .populate('comments.replies.repliedBy', 'name ProfileImage')
    .lean();
  
  communityPosts = communityPosts.map((post) => {
    return {
      ...post,
      hasLiked: post.likes.some((likeId) => likeId.toString() === user._id),
      likesCount: post.likes.length,
      comments: post.comments
        .sort((a, b) => new Date(b.date) - new Date(a.date)) 
        .slice(0, 1) 
        .map(comment => ({
          commentID: comment.commentID,
          comment: comment.comment,
          commentDate: comment.date,
          commenter: {
            name: comment.commentBy.name,
            profileImage: comment.commentBy.ProfileImage,
          },
          replies: comment.replies
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 1) 
            .map(reply => ({
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
  
    console.log('Fetched community posts:', communityPosts);

    return res.send(new ApiResponse(200, 'Successfully generated the report', { heading, BeforeAfter, Eventdetails, ReviewsAndFeedback, communityPosts }));
});


const BeforeAfter = asyncHandler(async (req, res) => {
  const files = req.files;
  const user = req.user;
  const { eventId:EventId } = req.body;

  if (!user) {
    throw new ApiError(500, 'User is not included in the request cookies');
  }

console.log(req.files)
const beforeImageUrl = files.BeforeImg[0].path; 
const afterImageUrl = files.AfterImg[0].path; 
  const updateDb = await EventReport.findOne({ Event: EventId });

  if (updateDb) {
    updateDb.BeforeCleanupImg = beforeImageUrl;
    updateDb.AfterCleanupImg = afterImageUrl;
    await updateDb.save();
    return res.send(new ApiResponse(200, 'Database updated successfully'));
  } else {
    const createHai = new EventReport({
      Event: EventId,
      BeforeCleanupImg: beforeImageUrl,
      AfterCleanupImg: afterImageUrl,
      EventGallery: [],
      VideoGallary: []
    });
    await createHai.save();
    return res.send(new ApiResponse(200, 'Document created successfully', createHai));
  }
});

const EventGallary = asyncHandler(async (req, res) => {
  const files = req.files;
  const user = req.user;
  const { eventId } = req.body;

  if (!files || !eventId) throw new ApiError(400, "Please include image or eventId in request");
  if (!user) throw new ApiError(404, "Unauthorized access of uploading data");

  let existingEvent = await EventReport.findOne({ Event: eventId });

  if (!existingEvent) {
    existingEvent = new EventReport({
      Event: eventId,
      BeforeCleanupImg: "",
      AfterCleanupImg: "",
      EventGallery: [],
      VideoGallary: []
    });
  }

  if (files.Gallary_img && Array.isArray(files.Gallary_img)) {
    files.Gallary_img.forEach((img) => {
      existingEvent.EventGallery.push(img.path); 
    });
  }

  await existingEvent.save();

  return res.send(new ApiResponse(200, "Successfully updated the event gallery"));
});

const EventVideos = asyncHandler(async (req, res) => {
  const user = req.user;
  const videos = req.files;
  const { EventID } = req.body;

  if (!user || !videos || !EventID) {
    throw new ApiError(400, "Please include all required fields: eventId, videos, and user.");
  }
  const existingDocument = await EventReport.findOne({ Event: EventID });

  if (!existingDocument) {
    throw new ApiError(400, "Please upload images first to initialize the database.");
  }

  if (videos.Video_gallary && Array.isArray(videos.Video_gallary)) {
    videos.Video_gallary.forEach((video) => {
      existingDocument.VideoGallary.push(video.path);
    });
  }

  await existingDocument.save();
  return res.send(new ApiResponse(200, "Video uploaded successfully", existingDocument));
});


export {
    CreateEventReport,
    BeforeAfter,
    EventGallary,
    EventVideos
}