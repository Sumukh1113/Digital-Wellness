const mongoose = require('mongoose');

const WellnessMetricsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalScreenTime: { type: Number, required: true },
  productivityScore: { type: Number, min: 0, max: 100 },
  stressLevel: { type: Number, min: 1, max: 10 },
  focusInterruptions: { type: Number, default: 0 },
  digitalDetoxTime: { type: Number, default: 0 },
  sleepQuality: { type: Number, min: 1, max: 10 },
  eyeStrainLevel: { type: Number, min: 1, max: 10 },
  socialMediaTime: { type: Number, default: 0 },
  predictedBurnout: { type: Number, min: 0, max: 100 }
});

module.exports = mongoose.model('WellnessMetrics', WellnessMetricsSchema);