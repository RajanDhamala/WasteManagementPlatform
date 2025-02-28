import asyncHandler from "../Utils/AsyncHandler.js";
import ApiResponse from "../Utils/ApiResponse.js";
import ApiError from "../Utils/ApiError.js";
import fs from 'fs'

import { Redisclient } from "../Utils/RedisUtil.js";


const CreatingChunks = asyncHandler(async (req, res) => {
    console.log('......')
    const filepath = './temp/College.webp';
    const stream = fs.createReadStream(filepath);
  
    res.setHeader('Content-Disposition', 'attachment; filename="college.webp"');
    res.setHeader('Content-Type', 'image/webp');

    stream.pipe(res);  
    stream.on('data', (chunks) => {
      console.log('Sending chunks...', chunks);
    });
  
    stream.on('end', (err) => {
      console.log('Finished sending chunks.', err);
      res.end();
    });
  
    stream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).send(new ApiResponse(500, 'Failed to stream file', err.message));
    });
  });


  const CreatingRedis=asyncHandler(async(req,res)=>{
   const response=await Redisclient.get('name','lets go hai',10)
   const data=await Redisclient.get('msg:1')
    console.log(response,data)

    res.send({
        message:'Data inserted',
        data:response,
        get:data
    })
  })
  

export {
    CreatingChunks,
    CreatingRedis
}