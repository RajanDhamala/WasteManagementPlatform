import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import { UserRanking,postData,getData } from '../Controller/ComminityController.js';

const CommunityRoute=express.Router();


CommunityRoute.get('/',(req,res)=>{
    console.log('Community Route hitted')
    return res.send('Community Route hitted')
})

CommunityRoute.get('/ranking',AuthMiddleware,UserRanking)
CommunityRoute.post('/Postdata',AuthMiddleware,postData)
CommunityRoute.get('/Getdata',AuthMiddleware,getData)




export default CommunityRoute;