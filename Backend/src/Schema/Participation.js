import mongoose from 'mongoose';

const ParticipationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            time: {
                type: Date,
                default: Date.now
            },
            verifiedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },UUId:{
                type:String,
                unique:true
            }
        }
    ]
},{timestamps:true});

const Participation= mongoose.model('Participation', ParticipationSchema);

export default Participation
