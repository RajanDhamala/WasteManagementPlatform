import express from 'express'
import {AddEvent,Scrapping,Showbooks,ScrapNews,EventForm,Eventinfo} from '../Controller/EventController.js'
import upload from '../Middleware/MulterImg.js'

const EventRouter=express.Router()
EventRouter.get('/',(req,res)=>{
    console.log("Event Route hitted")
   res.send("Event Route hitted")
})

EventRouter.get('/add',AddEvent)

EventRouter.get('/scrap',Scrapping)

EventRouter.get('/show/:length',Showbooks)

EventRouter.get('/scrapnews',ScrapNews)

EventRouter.post('/eventform',upload.array('images',3),EventForm)

EventRouter.get('/eventinfo/:title',Eventinfo)

export default EventRouter




