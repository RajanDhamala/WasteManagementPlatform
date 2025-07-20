import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true

    },birthdate:{
        type:Date,
        required:false
    },
    RefreshToken:{
        type:String,
       default:''

    },ProfileImage:{
        type:String,
       default:''

    },bio:{
        type:String,
        default:''

    },location:{
        type:String,
       default:''
    },isVerfied:{
        type:Boolean,
        default:false
    },JoinedEvents:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Event'
        }
    ],PassOtp:{
        type:String,
        default:'',
    },VerificationOtp:{
        type:String,
        default:''
    },Points:{
        type:Number,
        default:200
    },isBlocked:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const User= mongoose.model('User',UserSchema)

export default User