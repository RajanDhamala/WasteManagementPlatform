import express from 'express';
import { RegisterUser } from '../Controller/UserController.js';

const UserRoute=express.Router();

UserRoute.get('/',(req,res)=>{
    console.log('User Route hitted')
    return res.send('User Route hitted')
})

UserRoute.get('/register',RegisterUser)

export default UserRoute;