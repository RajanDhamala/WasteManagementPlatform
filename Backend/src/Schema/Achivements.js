import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ["point-milestone", "custom"],
    required: true
  },
  criteria: {
    type: Object,
    default: {}
  },
  basePoints: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ""
  },
  iconName: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const Achievement = mongoose.model('Achievement', AchievementSchema);

export default Achievement;