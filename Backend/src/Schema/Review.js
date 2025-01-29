import mongoose from "mongoose";

const EventSchema=new mongoose.Schema({
    Reviewer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
    ,Review:{
        type:String,
        required:true
    },
    Rating:{
        type:Number,
        default:0,
        max:5,
        min:0
    }
    
})

const Review= mongoose.model('Review',EventSchema)
export default Review