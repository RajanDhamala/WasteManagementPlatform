import mongoose from "mongoose";

const EventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },metadata:{
        type:String,
        required:false
    },location:{
        type:String,
        required:true
    },date:{
        type:Date,
        required:true
    },EventImg:{
        type:String,
        default:''
    },Participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    ],Host:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    ],EventStatus:{
        type:String,
        default:'pending',
    },EventRating:{
        type:Number,
       required:false,
        min:0,
        max:5
    },
    EventReview:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Review',
            required:false
        }
    ]
},{timestamps:true})

const Event=mongoose.model('Event',EventSchema)

export default Event