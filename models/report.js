import mongoose from "mongoose";
const { Schema, model } = mongoose;


const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedVideo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reel', 
    required: true
  },
  reportType: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});


export default model('Report', reportSchema);
