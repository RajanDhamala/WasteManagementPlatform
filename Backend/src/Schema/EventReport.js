import mongoose from "mongoose";

const EventReportSchema = new mongoose.Schema({
    Event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    BeforeCleanupImg: [
        {
            type: String,
            default: ""
        }
    ],
    AfterCleanupImg: [
        {
            type: String,
            default: ""
        }
    ],
    CommunityDiscussions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
    },
    Discussions: [
        {
            User: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            likes: {
                type: Number,
                default: 0
            },
            Comment: {
                type: String,
                required: true
            },
            Reply: [
                {
                    User: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User"
                    },
                    Comment: {
                        type: String,
                        required: true
                    }
                }
            ]
        }
    ],
    ReviewsAndFeedback: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "Review"
    },
    EventGallery: [  
        {
            type: String,
            default: ""
        }
    ],
    Participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
},{timestamps: true});

const EventReport = mongoose.model("EventReport", EventReportSchema);

export default EventReport;
