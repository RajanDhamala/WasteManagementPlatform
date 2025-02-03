import express from 'express'
import {AddEvent,EventForm,Eventinfo,LoadEvents,joinEvent,removeParticipation} from '../Controller/EventController.js'
import upload from '../Middleware/MulterImg.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'

const EventRouter=express.Router()
EventRouter.get('/',(req,res)=>{
    console.log("Event Route hitted")
   res.send("Event Route hitted")
})

EventRouter.get('/add',AddEvent)

EventRouter.post('/eventform',upload.array('images',3),EventForm)

EventRouter.get('/eventinfo/:title',Eventinfo)

EventRouter.get('/loadevents',AuthMiddleware,LoadEvents)

EventRouter.post('/joinEvent',AuthMiddleware,joinEvent)

EventRouter.get('/remove',AuthMiddleware,removeParticipation)

export default EventRouter




