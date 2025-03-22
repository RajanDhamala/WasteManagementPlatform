import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import dotenv from 'dotenv'
import {GenerateQr,DecrptQr} from '../Utils/CreateQr.js';
import ApiError from '../Utils/ApiError.js'

dotenv.config()
 const CreateQr = asyncHandler(async (req, res) => {

    const QrData = {
        username: req.user?.username || 'tinku',
        _id: req.user?._id || 'sfsfsafafafaf',
        otp: Math.floor(100000 + Math.random() * 900000),
        eventId:'261ge1e81he'
    };
    const data=await GenerateQr(QrData)
    console.log(data)
    return res.send(new ApiResponse(200,'here is qr data',data))
});

const VerifyQr = asyncHandler(async (req, res) => {
    const user = req.user; 
    const { hashedQR } = req.body; 

    if (!user) throw new ApiError(400, 'Please include cookies and eventId in req');
    if (!hashedQR) throw new ApiError(401, 'QR data is not sent');
    
    const data = await DecrptQr(hashedQR);

    if (!data) {
        return res.status(400).json({ message: 'Failed to decrypt QR code data' });
    }
    console.log('Decrypted Data:', data);

    return res.send(new ApiResponse(200, 'Successfully decrypted QR', data));
});
export {
    CreateQr,
    VerifyQr
}