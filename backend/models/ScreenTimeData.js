const mongoose = require('mongoose');

const ScreenTimeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  appName: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  category: { type: String, enum: ['social', 'productivity', 'entertainment', 'education', 'other'] },
  deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  emotionalState: { type: String, enum: ['focused', 'distracted', 'stressed', 'relaxed'] },
  location: { type: String }, // work, home, commute
  batteryLevel: { type: Number }, // for mobile devices
  notificationCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('ScreenTimeData', ScreenTimeSchema);