import {CreatingChunks,CreatingRedis} from '../Controller/StreamsController.js'
import AuthMiddleware from '../Middleware/JwtMiddleware.js'
import express from 'express'

const StremRoutes=express.Router()

StremRoutes.get('/',AuthMiddleware,(req,res)=>{
    res.send("Stream Route hitted")
})

StremRoutes.get('/chunks',AuthMiddleware,CreatingChunks)

StremRoutes.get('/redis',CreatingRedis)


export default StremRoutes
