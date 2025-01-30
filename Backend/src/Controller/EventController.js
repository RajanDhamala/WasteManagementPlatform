import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import axios from 'axios'
import dotenv from 'dotenv'
import * as cheerio from 'cheerio'
import Book from '../Schema/Book.js' 
import fs from 'fs'
import upload2Cloudinary from '../Utils/CloundinaryImg.js'
import Event from '../Schema/Event.js'


dotenv.config()

const AddEvent = asyncHandler(async (req, res) => {
    console.log("some hit this controller")
    res.send(new ApiResponse(200, 'Event Added Successfully', null))
})

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

const ScrapNews = asyncHandler(async (req, res) => {
    const url = process.env.NEWS_URL; 
    console.log('Scraping URL:', url);
  
    let cache = readCache();
  
    if (cache[url]) {
      console.log('Using cached content for:', url);
      const cachedData = cache[url];
  
      const $ = cheerio.load(cachedData);
      const news = [];
  
      $('.content-list.content-list--two-column div.media-object').each((index, item) => {
        if (index >= 20) return false; // Stop after 20 items
  
        const titleElement = $(item).find('h6.list-object__heading a.h6__link.list-object__heading-link');
        
        const titleLink = 'https://www.channelnewsasia.com/' + titleElement.attr('href');
        const field = $(item).find('p.list-object__category a.link').text().trim();
        const time = $(item).find('div.list-object__datetime-duration span.timestamp.timeago').attr('data-lastupdated');
        const Img = $(item).find('picture.image img.image').attr('src');
        const title = titleElement.text().trim();
  
        console.log('Category:', field, 'Title:', title, 'Link:', titleLink, 'Time:', time, 'Img:', Img);
        news.push({ title, field, titleLink, time, Img });  
      });
  
      return res.send(new ApiResponse(200, 'Using cached content', { news }));
    }
  
    try {
      const response = await axios.get(url);
      console.log('Scraped content:', response.data);
      
      cache[url] = response.data;
      saveCache(cache);
  
      return res.send(new ApiResponse(200, 'Successfully scraped website', {}));
    } catch (error) {
      console.error('Error scraping the website:', error);
      return res.status(500).send(new ApiResponse(500, 'Error scraping the website', {}));
    }
  });



  const EventForm = asyncHandler(async (req, res) => {
    try {
      const { title, date, time, location, description, requiredVolunteers, problemStatement } = req.body;
      const images = req.files;
      console.log("Title:", title, "Date:", date, "Time:", time, "Location:", location,
        "Description:", description, "Required Volunteers:", requiredVolunteers, "Problem Statement:", problemStatement);
      console.log("Images:", images);

      const slug = title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  
      const imgPaths = [];
  
      for (const img of images) {
        const { path } = img;
        const { uploadResult, optimizeUrl } = await upload2Cloudinary(path);
        imgPaths.push(optimizeUrl);
      }
      const event = new Event({
        title: title,
        slug: slug,
        time: time,
        date: date,
        location: location,
        description: description,
        VolunteersReq: requiredVolunteers,
        problemStatement: problemStatement,
        EventImg: imgPaths
      });
  
      await event.save();
      return res.send(new ApiResponse(200, 'Event Form Submitted Successfully', imgPaths));
    } catch (err) {
      console.log("Error in Event Form", err);
      return res.status(500).send(new ApiResponse(500, 'Error in Event Form', null));
    }
  });

  const Eventinfo=asyncHandler(async(req,res)=>{
    const {title}=req.params;
    
    const isValidTitle = /^[a-zA-Z0-9\s\-'&]+$/.test(title);
    
    if (!isValidTitle) {
        return res.status(400).json({ error: "Invalid event title" });
    }
    
      console.log("Title:",title);  
    try{
        const response=await Event.findOne({title}).select('title date time location description VolunteersReq problemStatement EventImg');

        if(!response){
            return res.send(new ApiResponse(404,'Event not found',null))
        }
        return res.send(new ApiResponse(200,'Event Info',response))

    }catch(err){
        console.log("Error in Event Info",err);
        return res.send(new ApiResponse(500,'Error in retriving info',null))
    }

  })
  
  
export {
    AddEvent,
    Scrapping,
    Showbooks,
    ScrapNews,
    EventForm,
    Eventinfo
}
