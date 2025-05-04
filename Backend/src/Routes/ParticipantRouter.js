import express from 'express'
import { CreateQr,VerifyQr} from '../Controller/Participation.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'
import {GetUsers} from '../Utils/SocketConnection.js'

const  ParticipantRouter=express.Router()

ParticipantRouter.get('/',(req,res)=>{
    return res.send('particaption router hitted')
})

ParticipantRouter.get('/qr',AuthMiddleware,CreateQr)
ParticipantRouter.post('/verify',AuthMiddleware,VerifyQr)

ParticipantRouter.get('/temp',(req,res)=>{
   console.log('hello bhai')
   return res.json(GetUsers())
})

export default ParticipantRouter