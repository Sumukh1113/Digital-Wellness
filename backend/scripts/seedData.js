const mongoose = require('mongoose');
const ScreenTimeData = require('../models/ScreenTimeData');
const WellnessMetrics = require('../models/WellnessMetrics');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/digitalwellness');

const generateSampleData = async (userId) => {
  const apps = [
    { name: 'Chrome', category: 'productivity' },
    { name: 'Instagram', category: 'social' },
    { name: 'Netflix', category: 'entertainment' },
    { name: 'Coursera', category: 'education' },
    { name: 'Slack', category: 'productivity' },
    { name: 'YouTube', category: 'entertainment' },
    { name: 'Twitter', category: 'social' }
  ];

  const emotionalStates = ['focused', 'distracted', 'stressed', 'relaxed'];
  const devices = ['desktop', 'mobile', 'tablet'];

  // Generate 30 days of data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Generate 5-15 sessions per day
    const sessionsPerDay = Math.floor(Math.random() * 10) + 5;

    for (let j = 0; j < sessionsPerDay; j++) {
      const app = apps[Math.floor(Math.random() * apps.length)];
      const sessionTime = new Date(date);
      sessionTime.setHours(Math.floor(Math.random() * 16) + 7); // 7 AM to 11 PM
      sessionTime.setMinutes(Math.floor(Math.random() * 60));

      const screenTimeEntry = new ScreenTimeData({
        userId,
        timestamp: sessionTime,
        appName: app.name,
        duration: Math.floor(Math.random() * 120) + 5, // 5-125 minutes
        category: app.category,
        deviceType: devices[Math.floor(Math.random() * devices.length)],
        emotionalState: emotionalStates[Math.floor(Math.random() * emotionalStates.length)],
        location: ['home', 'work', 'commute'][Math.floor(Math.random() * 3)],
        batteryLevel: Math.floor(Math.random() * 100) + 1,
        notificationCount: Math.floor(Math.random() * 50)
      });

      await screenTimeEntry.save();
    }
  }

  console.log('Sample data generated successfully!');
  mongoose.connection.close();
};

// Run with: node seedData.js [userId]
const userId = process.argv[2] || '507f1f77bcf86cd799439011';
generateSampleData(userId);