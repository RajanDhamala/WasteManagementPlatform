import express from 'express';
import { EditUserReview,ReportReview } from '../Controller/ReviewController.js';
import  AuthMiddleware  from '../Middleware/JwtMiddleware.js';

const ReviewRouter=express.Router();

ReviewRouter.get('/',(req,res)=>{
    res.send('Review Route hitted')
})

ReviewRouter.put('/edit/:reviewId/:review',AuthMiddleware,EditUserReview);

ReviewRouter.get('/report/:reviewId',ReportReview);

export default ReviewRouter;