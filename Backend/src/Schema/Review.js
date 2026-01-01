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
    },Event:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event',
        required:true
    },ReviewImage:{
        type:String,
        required:false
    },likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
    
},{timestamps:true})

const Review= mongoose.model('Review',EventSchema)
export default Review