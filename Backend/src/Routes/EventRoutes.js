import express from 'express'
import {EventForm,Eventinfo,LoadEvents,joinEvent,removeParticipation,ReportEvent,SubscribeEvent,AddReview,RemoveReview,ClearALlReviews} from '../Controller/EventController.js'
import upload from '../Middleware/MulterImg.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'
import {rateLimit} from 'express-rate-limit'
import ReviewImg from '../Middleware/ReviewMulter.js'

const EventRouter=express.Router()
EventRouter.get('/',(req,res)=>{
    console.log("Event Route hitted")
   res.send("Event Route hitted")
})

const eventlimit=rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 2,
    message: "Too many events created from this IP, please try again after an hour"
})

EventRouter.post('/eventform',eventlimit,AuthMiddleware,upload.array('images',3),EventForm)

EventRouter.get('/eventinfo/:title',Eventinfo)

EventRouter.get('/loadevents',LoadEvents)

EventRouter.post('/joinEvent',AuthMiddleware,joinEvent)
// rateLimit({windowMs:24 * 60 * 60 * 1000,max:3,message:'cannnot join multiple events'}),

EventRouter.get('/remove',AuthMiddleware,removeParticipation)

EventRouter.post('/report',ReportEvent)

EventRouter.post('/subscribe',SubscribeEvent);

EventRouter.post('/addreview', ReviewImg.single('reviewImg'), AuthMiddleware, AddReview);

EventRouter.delete('/removereview/:reviewId',AuthMiddleware,RemoveReview)

EventRouter.get('/clearReviews',ClearALlReviews)

export default EventRouter




