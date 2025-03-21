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
            type: String,
        }
    ],VideoGallary:[
        {
            type:String
        }
    ],Particpiants:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Particpants'
    }
  
},{timestamps: true});

const EventReport = mongoose.model("EventReport", EventReportSchema);

export default EventReport;
