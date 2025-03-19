import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import {CreateEventReport}from '../Controller/EventReport.js';

const EventReportRouter=express.Router();

EventReportRouter.get('/',(req,res)=>{
    res.send('welcome to the event report controller')
})

EventReportRouter.get('/final/:title',AuthMiddleware,CreateEventReport)

export default EventReportRouter;