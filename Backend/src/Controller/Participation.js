import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import {GenerateQr,DecrptQr} from '../Utils/CreateQr.js';
import ApiError from '../Utils/ApiError.js'
import { v4 as uuidv4 } from 'uuid';
import Event from '../Schema/Event.js'
import QrCode from '../Schema/QrVerification.js'
import {getIo} from '../../index.js'
import Participation from '../Schema/Participation.js'

dotenv.config()
const CreateQr = asyncHandler(async (req, res) => {
    const io=getIo()
    const eventId = '67dd36b46576d57e23faf542';
    const validTill = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const event = await Event.findById(eventId)
        .populate('Participants', 'name email')
        .select('Participants _id date location');
    console.log(event)
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    const exists = await QrCode.exists({ event: eventId });
    if(exists){
        throw new ApiError(400,'event qr already created')
    }
    const qrDocument = new QrCode({ event: eventId, qrData: [] });
    const participants=new Participation({event:eventId})
    const qrResults = await Promise.all(
        event.Participants.map(async (user) => {
            const qrId = uuidv4();
            const QrData = {
                user_id: user._id,
                _id: qrId,
                eventId: eventId,
                expiryDate: validTill,
            };

            console.log("Generating QR for user:", user._id);
            const { url: data, encryptedData } = await GenerateQr(QrData);
            qrDocument.qrData.push({
                user: user._id,
                hashedCode: qrId,
                isUsed: false,
                wholeHash: encryptedData
            });
            io.emit('qr-data', {
                user: user._id,
                name: user.name,
                email: user.email,
                data,
                encryptedData,
                QrData
            });
           
            return { user: user._id, name: user.name, email: user.email, data };
        })
    );
    await qrDocument.save();
    await participants.save()
    console.log(qrResults);
    return res.send(new ApiResponse(200, 'Here are the QR codes', { qrResults, eventDate: event.date }));
});

const VerifyQr = asyncHandler(async (req, res) => {

    const user = req.user; 
    const { hashedQR } = req.body; 
    if (!user) throw new ApiError(400, 'Please include cookies and eventId in req');
    if (!hashedQR) throw new ApiError(401, 'QR data is not sent');
    console.log("decrypting data haai")
    const data = await DecrptQr(hashedQR);
    if (!data) {
        return res.status(400).json({ message: 'Failed to decrypt QR code data' });
    }
    console.log('Decrypted Data:', data);
    if (data.expiryDate && new Date(data.expiryDate) < new Date()) throw new ApiError(400,'qr code has been expired');

    const qrData = await QrCode.findOne({
        event: data.eventId,
        "qrData.hashedCode": data._id
      });
      
      if(!qrData) throw new ApiError(400, 'invalid qr or already used');

      
      const participate=await Participation.findOne({event:data.eventId})
      if(!participate) throw new ApiError('participation not found')

        participate.participants.push({
         user:data.user_id,
        verifiedBy:req.user._id,
        UUId:data._id
     })
        
        await QrCode.updateOne(
            { event: data.eventId },
            { $pull: { qrData: { hashedCode: data._id } } }
        );
        await participate.save()
      console.log('QR code entry deleted successfully.');
  
      return res.send(new ApiResponse(200, 'Successfully decrypted and deleted QR', data));
});

const GetUrQrs=asyncHandler(async(req,res)=>{
    const user=req.user;
    if(!user) throw new ApiError(400,'Please include cookies and eventId in req')
    const eventId = req.query.eventId;
    if (!eventId) throw new ApiError(400, 'Event ID is required');
    
})



export {
    CreateQr,
    VerifyQr
}