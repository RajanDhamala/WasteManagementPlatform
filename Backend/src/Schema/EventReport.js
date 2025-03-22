import mongoose from "mongoose";

const EventReportSchema = new mongoose.Schema({
    Event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    BeforeCleanupImg: 
        {
            type: String,
            default: ""
    },
    AfterCleanupImg: 
        {
            type: String,
            default: ""
        }
    ,
    EventGallery: [  
       {
        _id:false,
        url: { type: String, required: true }, 
        caption: { type: String, required: false }
        }
    ],VideoGallery: [
        {
            url: { type: String, required: true }, 
            caption: { type: String, required: false }
        }
    ],Particpiants:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Particpants'
    }
  
},{timestamps: true});

const EventReport = mongoose.model("EventReport", EventReportSchema);

export default EventReport;
