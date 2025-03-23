import express from 'express'
import { CreateQr,VerifyQr} from '../Controller/Participation.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'

const  ParticipantRouter=express.Router()

ParticipantRouter.get('/',(req,res)=>{
    return res.send('particaption router hitted')
})

ParticipantRouter.get('/qr',AuthMiddleware,CreateQr)
ParticipantRouter.post('/verify',AuthMiddleware,VerifyQr)

export default ParticipantRouter