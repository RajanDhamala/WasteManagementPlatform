import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import {CreateEventReport,BeforeAfter,EventGallary,EventVideos}from '../Controller/EventReport.js';
import uploadMiddleware from '../Middleware/UploadMiddleware.js';
import uploadVideoMiddleware from '../Middleware/UploadVideos.js'


const EventReportRouter=express.Router();

EventReportRouter.get('/',(req,res)=>{
    res.send('welcome to the event report controller')
})

EventReportRouter.get('/final/:title',AuthMiddleware,CreateEventReport)

const upload = uploadMiddleware('ImageGallary');

EventReportRouter.post('/Before_After',AuthMiddleware, upload.fields([
  {name:'BeforeImg',maxCount:1},
  {name:'AfterImg',maxCount:1}
]),BeforeAfter)

EventReportRouter.post('/Image_Gallary',AuthMiddleware,upload.array('Gallary_img'),EventGallary)
EventReportRouter.post('/Video_Gallary',AuthMiddleware,uploadVideoMiddleware('VideoGallary').array('Video_gallary'),EventVideos)


export default EventReportRouter;