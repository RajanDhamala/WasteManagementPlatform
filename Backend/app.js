import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import EventRouter from './src/Routes/EventRoutes.js';
import UserRoute from './src/Routes/UserRoutes.js';
import ScrapRouter from './src/Routes/ScrapperRoutes.js';

const app=express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials: true,
}));

app.get('/',(req,res)=>{
    console.log('Hello World');
    return res.send('Res from express server')
})

app.use('/event',EventRouter);
app.use('/user',UserRoute);
app.use('/scrap',ScrapRouter);

export default app;