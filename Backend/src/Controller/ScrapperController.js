import asyncHandler from "../Utils/AsyncHandler.js";
import axios from "axios";
import ApiResponse from "../Utils/ApiResponse.js";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import Book from '../Schema/Book.js' 
import puppeteer, { ConsoleMessage } from "puppeteer";
import fs from 'fs';
import {Redisclient} from '../Utils/RedisUtil.js'


dotenv.config()

const Scrapping = asyncHandler(async (req, res) => {
    console.log("Scraping started...");
    const ratingMap = {
        "One": 1,
        "Two": 2,
        "Three": 3,
        "Four": 4,
        "Five": 5
    };

    try {
        const response = await axios.get(process.env.SCRAP_URL);
        const html = response.data;
        const $ = cheerio.load(html);
        const books = [];
        const existingBooks = [];

        console.log(`Category of Scraped Books: ${$('.page-header.action h1').text().trim()}`);

        for (const item of $('ol.row li').toArray()) {
            const title = $(item).find('h3').text().trim();
            const price = parseFloat($(item).find('p.price_color').text().trim().replace('£', ''));
            const rawRating = $(item).find('.product_pod p').attr('class').replace('star-rating ', '');
            const rating = ratingMap[rawRating] || 1;

            const relativeLink = $(item).find('.image_container a').attr('href');
            const baseBookUrl = 'http://books.toscrape.com/catalogue/';
            const bookDetailUrl = baseBookUrl + relativeLink.replace(/^(\.\.\/)+/, '');  

            const imgContainer = $(item).find('.image_container a img').attr('src');
            const cleanedImgPath = imgContainer.replace(/^(\.\.\/)+/, '');
            const baseUrl = 'http://books.toscrape.com/';
            const imageUrl = baseUrl + cleanedImgPath;

            const existingBook = await Book.findOne({ title });
            
            if (existingBook) {
                existingBooks.push(title);
                console.log(`Book "${title}" already exists in database`);
                continue;
            }

            books.push({ title, price, link: bookDetailUrl, Img: imageUrl, rating });
            console.log(`Book: ${title}, Price: £${price}, Rating: ${rating}, URL: ${bookDetailUrl}`);
        }

        let message = '';
        if (books.length > 0) {
            await Book.insertMany(books);
            message = `${books.length} new books saved to the database.`;
        }

        if (existingBooks.length > 0) {
            message += ` ${existingBooks.length} books were already in the database.`;
        }

        return res.send(new ApiResponse(200, message || 'No new books to save', {
            newBooks: books.length,
            existingBooks,
            totalProcessed: books.length + existingBooks.length
        }));

    } catch (err) {
        console.error('Error scraping website:', err);
        return res.status(500).send(new ApiResponse(500, 'Failed to scrape the website'));
    }
});

const Showbooks = asyncHandler(async (req, res) => {
    const length = parseInt(req.params.length, 10) || 10;

    const books = await Book.aggregate([
        {
            $project: { 
                _id: 1,
                title: 1,
                price: 1,
                link: 1,
                Img: 1,
                createdAt: 1,
                rating: 1 
            }
        },
        {
            $sort: { createdAt: -1 } 
        },
        {
            $limit: length 
        }
    ]);
    
    console.log('Books:', books);
    return res.send(new ApiResponse(200, 'Fetched books from database', books));    
});


const CACHE_FILE_PATH = './cache.json'; 

const saveCache = (cache) => {
  fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cache, null, 2));
};

const readCache = () => {
  if (fs.existsSync(CACHE_FILE_PATH)) {
    const data = fs.readFileSync(CACHE_FILE_PATH);
    return JSON.parse(data);
  }
  return {}; 
};

const scrapeWebsite = async (url) => {
  try {
    const response = await axios.get(url);
    console.log('Scraped content:', response.data);

    const $ = cheerio.load(response.data);
    const news = [];
    $('.content-list.content-list--two-column div.media-object').each((index, item) => {
      if (index >= 20) return false; 

      const titleElement = $(item).find('h6.list-object__heading a.h6__link.list-object__heading-link');
      const titleLink = 'https://www.channelnewsasia.com/' + titleElement.attr('href');
      const field = $(item).find('p.list-object__category a.link').text().trim();
      const time = $(item).find('div.list-object__datetime-duration span.timestamp.timeago').attr('data-lastupdated');
      const Img = $(item).find('picture.image img.image').attr('src');
      const title = titleElement.text().trim();

      console.log('Category:', field, 'Title:', title, 'Link:', titleLink, 'Time:', time, 'Img:', Img);
      news.push({ title, field, titleLink, time, Img });
    });
    return news;
  } catch (error) {
    console.error('Error scraping the website:', error);
    throw new Error('Error scraping the website');
  }
};

const ScrapNews = asyncHandler(async (req, res) => {
  const { scrap } = req.query;
  console.log("Scrap:", scrap);

  const url = process.env.NEWS_URL;
  console.log('Scraping URL:', url);

  let cachedData = await Redisclient.json.get('ScrappedNews', '$'); 

  if (scrap === 'true') {
    console.log('Scrap is true, fetching new data...');
    const news = await scrapeWebsite(url);
    await Redisclient.json.set('ScrappedNews', '$',{news});
    return res.send(new ApiResponse(200, 'Successfully scraped website', {}));
  } else {
    if (cachedData) {
      console.log('Using cached content from Redis:', url);
      return res.send(new ApiResponse(200, 'Using cached content', { news: cachedData }));
    }
    const news = await scrapeWebsite(url);
    console.log(news)
    await Redisclient.json.set('ScrappedNews', '$', {news});
    return res.send(new ApiResponse(200, 'Successfully scraped website', {}));
  }
});


const Crawling = asyncHandler(async (req, res) => {
  console.log("Crawling booss rn...");

  const browser=await puppeteer.launch({headless:false});
  const tab=await browser.newPage();

  await tab.goto('https://weather-app-react-two-theta.vercel.app/',{waitUntil:'networkidle2'});

  const html=await tab.content();

  const input=await tab.$('input');
  await input.type('pokhara',{delay:200});

  // const button=await tab.$('button')
  // await button.click();  css Selector 

  // const input=tab.locator('input[type="text"]')
  // await input.fill('pokhara');

  await tab.locator('button').click();

  // const img=await tab.screenshot()
  // fs.writeFileSync('weather.png',img);
  await tab.waitForNetworkIdle()
  console.log('Page loaded');

  return res.send(new ApiResponse(200, 'Successfully crawled website',));
  

});


const ScrapMaster=asyncHandler(async(req,res)=>{
  console.log("Scraping Master...");

  const browser=await puppeteer.launch({headless:false});
  const tab=await browser.newPage();

  await tab.goto('https://pptr.dev/guides/browser-management',{waitUntil:'networkidle2'});
  await tab.locator('[id="rcc-confirm-button"]').click();

  const target=tab.locator('theme-doc-markdown markdown')

  const heading=await tab.locator('//*[@id="__docusaurus_skipToContent_fallback"]/div/div/main/div/div/div/div/article/div[2]/header/h1').allTextContent();

  console.log(heading);

  return res.send(new ApiResponse(200, 'Successfully scraped Master',));
})


const Pagination=asyncHandler(async(req,res)=>{
  const limits=req.params.limits;
  const page=req.params.page

  const skip=(page-1)*limits;
  const totalBooks=await Book.countDocuments({});
  const books=await Book.find({})
  .skip(skip).limit(limits).sort({createdAt:-1});

  console.log(books);
  return res.send(new ApiResponse(200, 'Successfully fetched books', {totalBooks,books}));
})


const ScrapChesscom=asyncHandler(async(req,res)=>{
  console.log("scrapping chesscom boss")
  try{
      const reponsehai=await axios.get('https://www.chess.com/events/2025-freestyle-chess-grand-slam-weissenhaus-ko/01-01/Sindarov_Javokhir-Nakamura_Hikaru')
      const html=reponsehai.data;
      const $=cheerio.load(html);
      console.log(html);

      return res.send(new ApiResponse(200, 'Successfully fetched chesscom',html));

  }catch(err){  
    console.log(err)
  }
})

export {
    Scrapping,
    Showbooks,
    ScrapNews,
    Crawling,
    ScrapMaster,
    Pagination,
    ScrapChesscom
}