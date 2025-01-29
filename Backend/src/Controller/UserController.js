import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";

const RegisterUser=asyncHandler(async(req,res)=>{
    console.log("some hit this controller")
 res.send(new ApiResponse (200,'User Added Successfully',null))
})

export {
    RegisterUser
}