import {Scrapping,Showbooks,ScrapNews,Crawling,ScrapMaster} from '../Controller/ScrapperController.js'
import express from 'express'

const ScrapRouter = express.Router()

ScrapRouter.get('/',(req,res)=>{
    res.send("Scrapper Route hitted")
})

ScrapRouter.get('/scrap',Scrapping)

ScrapRouter.get('/show/:length',Showbooks)

ScrapRouter.get('/scrapnews',ScrapNews)

ScrapRouter.get('/crawl',Crawling)

ScrapRouter.get('/master',ScrapMaster)

export default ScrapRouter