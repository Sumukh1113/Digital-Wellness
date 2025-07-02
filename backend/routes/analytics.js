const express = require('express');
const router = express.Router();
const AnalyticsEngine = require('../services/analyticsEngine');
const BehaviorPredictor = require('../ml/behaviorPredictor');
const ScreenTimeData = require('../models/ScreenTimeData');

// Get screen time data for a user
router.get('/screen-time/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const data = await ScreenTimeData.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get personalized recommendations
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const recommendations = await AnalyticsEngine.generateRecommendations(userId);
    const burnoutRisk = await AnalyticsEngine.predictBurnoutRisk(userId);
    
    res.json({ recommendations, burnoutRisk });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get productivity patterns
router.get('/productivity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const patterns = await AnalyticsEngine.calculateProductivityPatterns(userId);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get anomalies
router.get('/anomalies/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const anomalies = await BehaviorPredictor.detectAnomalies(userId);
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record new screen time data
router.post('/screen-time', async (req, res) => {
  try {
    const screenTimeEntry = new ScreenTimeData(req.body);
    await screenTimeEntry.save();
    res.status(201).json(screenTimeEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;