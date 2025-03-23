import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import {GenerateQr,DecrptQr} from '../Utils/CreateQr.js';
import ApiError from '../Utils/ApiError.js'
import { v4 as uuidv4 } from 'uuid';
import Event from '../Schema/Event.js'
import QrCode from '../Schema/QrVerification.js'
import {getIo} from '../../index.js'


dotenv.config()
const CreateQr = asyncHandler(async (req, res) => {
    console.log('hello')
    const io=getIo()
    const eventId = '67dd36b46576d57e23faf542';
    const validTill = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existingQrDocument = await QrCode.findOne({ event: eventId });

    if (existingQrDocument && existingQrDocument.qrData.length > 0) {
        throw new ApiError(400, 'QR already generated for this event');
    }
    const event = await Event.findById(eventId)
        .populate('Participants', 'name email')
        .select('Participants _id date location');
    console.log(event)
    if (!event) {
        throw new ApiError(404, "Event not found");
    }
    const qrDocument = new QrCode({ event: eventId, qrData: [] });
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
      
      if (qrData) {
          const matchedCode = qrData.qrData.find(qr => qr.hashedCode === data._id);
      
          if (matchedCode) {
              console.log('The hashed code matches the secret code.');
          } else {
              console.log('No matching hashed code found.');
              throw new ApiError(400,'invalid qr code')
          }
        }
    return res.send(new ApiResponse(200, 'Successfully decrypted QR', data));
});
export {
    CreateQr,
    VerifyQr
}