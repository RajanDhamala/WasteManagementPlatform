import { time } from "console";
import mongoose from "mongoose";
import { type } from "os";

const EventSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },slug:{
        type:String,
        required:false
    },
    time:{
        type:String,
        default:''
    },date:{
        type:Date,
        required:true
    },description:{
        type:String,
        required:false
    },location:{
        type:String,
        required:true
    },VolunteersReq:{
        type:Number,
        default:5

    },problemStatement:{
        type:String,
        default:''
    },EventImg:[
        {
            type:String,
            default:'',
            max:3
        }
    ],Participants:[
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
    ],Priority:{
        type:Boolean
    }
},{timestamps:true})

const Event=mongoose.model('Event',EventSchema)

export default Event