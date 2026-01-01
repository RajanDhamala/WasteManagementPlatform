import mongoose from "mongoose";

const QrDataSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    qrData: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            hashedCode: {
                type: String,
                required: true
            },
            isUsed: {
                type: Boolean,
                default: false
            },
            wholeHash: {
                type: String,
                required: true
            }
        }
    ]
});

const QrCode= mongoose.model("QrData", QrDataSchema);

export default QrCode
