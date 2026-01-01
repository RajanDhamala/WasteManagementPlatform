import express from 'express'
import { CreateQr,VerifyQr,GetUrQrs} from '../Controller/Participation.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'
import {GetUsers} from '../Utils/SocketConnection.js'

const  ParticipantRouter=express.Router()

ParticipantRouter.get('/',(req,res)=>{
    return res.send('particaption router hitted')
})

ParticipantRouter.get('/qr',AuthMiddleware,CreateQr)
ParticipantRouter.post('/verify',AuthMiddleware,VerifyQr)
ParticipantRouter.get('/get-qr/:eventId',AuthMiddleware,GetUrQrs)

export default ParticipantRouter