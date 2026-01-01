import mongoose from "mongoose";

const RealParticipants=new mongoose.Schema({
    Particpantname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },EnrollDate:{
        type:Date,
        default:Date.now()
    },EnrolledEvent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Event'
    }
},{timestamps:true})

const Participants=mongoose.model('Particpants',RealParticipants)

export default Participants