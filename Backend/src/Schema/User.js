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
    }

},{timestamps:true})

const User= mongoose.model('User',UserSchema)

export default User