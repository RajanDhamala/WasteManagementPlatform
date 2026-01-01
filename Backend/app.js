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
import ParticipantRouter from './src/Routes/ParticipantRouter.js'
import NanoMiddle from './src/Middleware/NanoMiddle.js';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { createStream } from 'rotating-file-stream';
import logger from './src/Utils/WistonConfig.js';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('trust proxy', true);

const logDirectory = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Create rotating stream
const accessLogStream = createStream('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory,
});

// Console logging
app.use(morgan('dev'));

app.use(morgan('combined', { stream: accessLogStream }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

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
app.use('/participate',ParticipantRouter)

app.use((err, req, res, next) => {
  logger.error(`${err.message}\n${err.stack}`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
});


export default app;
