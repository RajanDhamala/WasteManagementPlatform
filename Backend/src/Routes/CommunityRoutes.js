import express from 'express';
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import { UserRanking,postData,getData,getAllEvents,CreateCommunityPost,getCommunityPost,LikeUnlikeDiscussion,CommentOnDiscussion,ReplyonComment,DeleteDiscussionComment,DeleteDiscussionPost,EditDiscussionPost,EditDiscussionComment } from '../Controller/ComminityController.js';

const CommunityRoute=express.Router();


CommunityRoute.get('/',(req,res)=>{
    console.log('Community Route hitted')
    return res.send('Community Route hitted')
})

CommunityRoute.get('/ranking',AuthMiddleware,UserRanking)
CommunityRoute.post('/Postdata',AuthMiddleware,postData)
CommunityRoute.get('/Getdata',AuthMiddleware,getData)

CommunityRoute.get('/GetAllEvents',AuthMiddleware,getAllEvents)

CommunityRoute.post('/postTopic',AuthMiddleware,CreateCommunityPost)
CommunityRoute.get('/getPost/:eventID',AuthMiddleware,getCommunityPost)
CommunityRoute.put('/likeUnlikeDiscussion/:discussionId',AuthMiddleware,LikeUnlikeDiscussion)
CommunityRoute.post('/commentOnDiscussion',AuthMiddleware,CommentOnDiscussion)

CommunityRoute.post('/postReply',AuthMiddleware,ReplyonComment)

CommunityRoute.delete('/deletePost/:discussionId',AuthMiddleware,DeleteDiscussionPost)

CommunityRoute.delete('/deleteComment/:discussionId/:commentId',AuthMiddleware,DeleteDiscussionComment)

CommunityRoute.put('/editPost/:id',AuthMiddleware,EditDiscussionPost)

CommunityRoute.put('/editComment/:discussionId/:reqId',AuthMiddleware,EditDiscussionComment)


export default CommunityRoute;