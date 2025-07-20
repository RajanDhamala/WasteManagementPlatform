import {Scrapping,Showbooks,ScrapNews,Crawling,ScrapMaster,Pagination,ScrapChesscom} from '../Controller/ScrapperController.js'
import express from 'express'
import { TrialMail } from '../Utils/MailUtil.js'

const ScrapRouter = express.Router()

ScrapRouter.get('/',(req,res)=>{
    res.send("Scrapper Route hitted")
})

ScrapRouter.get('/scrap',Scrapping)

ScrapRouter.get('/show/:length',Showbooks)

ScrapRouter.get('/scrapnews',ScrapNews)

ScrapRouter.get('/crawl',Crawling)

ScrapRouter.get('/master',ScrapMaster)

ScrapRouter.get('/pagination/:page/:limits',Pagination)

ScrapRouter.get('/chesscom',ScrapChesscom)

ScrapRouter.get('/mail',async(req,res)=>{
    console.log("Mail route hit")
    const mailsent=await TrialMail("mddanish@nbc.edu.np","Rujal","Trial Mail","This is a trial mail from the scrapper route")
    res.send("Mail sent successfully")
})

export default ScrapRouter