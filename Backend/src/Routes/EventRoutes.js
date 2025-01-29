import express from 'express'
import {AddEvent,Scrapping,Showbooks,ScrapNews} from '../Controller/EventController.js'
import ApiResponse from '../Utils/ApiResponse.js'

const EventRouter=express.Router()

EventRouter.get('/',(req,res)=>{
    console.log("Event Route hitted")
   res.send("Event Route hitted")
})

EventRouter.get('/add',AddEvent)

EventRouter.get('/scrap',Scrapping)

EventRouter.get('/show/:length',Showbooks)

EventRouter.get('/scrapnews',ScrapNews)

export default EventRouter