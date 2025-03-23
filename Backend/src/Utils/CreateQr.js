import QRCode from 'qrcode'
import CryptoJS from 'crypto-js';
import dotenv from 'dotenv'

dotenv.config()
const SECRET_KEY = process.env.QR_SECRET; 

const GenerateQr = async (payload) => {
    try {
        const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
        console.log(encryptedData)
        const url = await QRCode.toDataURL(encryptedData);
        return {
            url,encryptedData
        };
    } catch (err) {
        throw new Error('Error generating QR code');
    }
}

const DecrptQr=async(hashedQr)=>{
    try{
        const bytes = CryptoJS.AES.decrypt(hashedQr, SECRET_KEY);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) throw new Error("Invalid QR code data");
        return JSON.parse(decryptedData);
    }catch(err){
        console.log("error decrypting the qr data")
        return null
    }
}

export {
    GenerateQr,
    DecrptQr
}
