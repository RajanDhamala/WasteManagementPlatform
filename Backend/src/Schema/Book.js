import mongoose from "mongoose";

const BoookSchema= new mongoose.Schema({
    title:{
        type:String,
        required:true
    },price:{
        type:Number,
        required:true
    },link:{
        type:String,
        required:true
    },Img:{
        type:String,
        default:''
    },rating:{
        type:Number,
        default:1
    }
},{timestamps:true})

const Book=mongoose.model('Book',BoookSchema)

export default Book