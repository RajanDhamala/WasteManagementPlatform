import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Reply Schema
const ReplySchema = new Schema({
    replyID: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(), 
    },
    reply: {
        type: String,
    },
    repliedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        default: Date.now
    }
});


const CommentSchema = new Schema({
    commentID: {
        type: Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(), 
    },
    comment: {
        type: String,
    },
    commentBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    replies: [ReplySchema]  
});

const CommunityDiscussionSchema = new Schema({
    topic: {
        type: String,
        required: true
    },
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    EventId:{
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [CommentSchema] 
});

const CommunityDiscussion = model("CommunityDiscussion", CommunityDiscussionSchema);

export default CommunityDiscussion;
