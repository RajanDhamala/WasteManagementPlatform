import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import {}from '../Controller/EventReport.js';

const EventReportRouter=express.Router();

export default EventReportRouter;