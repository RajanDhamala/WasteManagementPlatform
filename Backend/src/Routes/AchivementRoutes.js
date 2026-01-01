import express from "express"
import AuthMiddleware from '../Middleware/JwtMiddleware.js';
import { CreateAchievement,setAchievements,getUrAchivements,createLeaderboard,getLeaderBoard,getLocalLeaderboard,EventCompletedgrantPoints} from "../Controller/AchivemntController.js";
const AchivementRouter=express.Router()

AchivementRouter.get('/',(req,res)=>{
  console.log("achivement router hitted man")
  return res.send("hello from achivement router man")
})

AchivementRouter.get("/get",AuthMiddleware,getUrAchivements)

AchivementRouter.get("/setAchivement/:achievementId",AuthMiddleware,setAchievements)

AchivementRouter.get('/makeLeaderboard',createLeaderboard)


AchivementRouter.get('/leader',AuthMiddleware,getLeaderBoard)
AchivementRouter.get('/localLeaderboard',AuthMiddleware,getLocalLeaderboard)

AchivementRouter.get('/test/:eventId',AuthMiddleware,EventCompletedgrantPoints)

export default AchivementRouter
