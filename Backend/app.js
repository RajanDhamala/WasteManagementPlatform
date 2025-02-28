import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import EventRouter from './src/Routes/EventRoutes.js';
import UserRoute from './src/Routes/UserRoutes.js';
import ScrapRouter from './src/Routes/ScrapperRoutes.js';
import CommunityRoute from './src/Routes/CommunityRoutes.js';
import { rateLimit } from 'express-rate-limit';
import useragent from 'express-useragent';
import dotenv from 'dotenv';
import ReviewRouter from './src/Routes/ReviewRotes.js';
import StreamRoutes from './src/Routes/StreamRoutes.js';
import EventReportRouter from './src/Routes/EventReport.js';


dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(useragent.express());

app.get('/', (req, res) => {
  console.log('Hello World');
  return res.send('Response from Express server');
});

app.use('/event', EventRouter);
app.use('/user', UserRoute);
app.use('/scrap', ScrapRouter);
app.use('/review', ReviewRouter);
app.use('/stream', StreamRoutes);
app.use('/community', CommunityRoute);
app.use('/report', EventReportRouter);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export default app;
