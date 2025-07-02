// Simple behavioral prediction using moving averages and trend analysis
class BehaviorPredictor {
  static async predictNextWeekUsage(userId) {
    const ScreenTimeData = require('../models/ScreenTimeData');
    
    // Get last 4 weeks of data
    const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const data = await ScreenTimeData.find({
      userId,
      timestamp: { $gte: fourWeeksAgo }
    });
    
    // Group by day of week and calculate averages
    const weeklyPatterns = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    data.forEach(entry => {
      const dayOfWeek = entry.timestamp.getDay();
      const dayName = days[dayOfWeek];
      
      if (!weeklyPatterns[dayName]) {
        weeklyPatterns[dayName] = [];
      }
      weeklyPatterns[dayName].push(entry.duration);
    });
    
    // Calculate predictions with trend analysis
    const predictions = {};
    Object.keys(weeklyPatterns).forEach(day => {
      const durations = weeklyPatterns[day];
      const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      // Simple trend calculation (last week vs previous weeks)
      const lastWeek = durations.slice(-7);
      const previousWeeks = durations.slice(0, -7);
      
      const lastWeekAvg = lastWeek.reduce((sum, d) => sum + d, 0) / lastWeek.length;
      const previousAvg = previousWeeks.reduce((sum, d) => sum + d, 0) / previousWeeks.length;
      
      const trend = lastWeekAvg - previousAvg;
      predictions[day] = Math.max(0, average + (trend * 0.3)); // Apply 30% of trend
    });
    
    return predictions;
  }
  
  static async detectAnomalies(userId) {
    const ScreenTimeData = require('../models/ScreenTimeData');
    
    const lastWeek = await ScreenTimeData.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const dailyTotals = {};
    lastWeek.forEach(entry => {
      const date = entry.timestamp.toDateString();
      dailyTotals[date] = (dailyTotals[date] || 0) + entry.duration;
    });
    
    const values = Object.values(dailyTotals);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    
    const anomalies = [];
    Object.keys(dailyTotals).forEach(date => {
      const value = dailyTotals[date];
      const zScore = Math.abs(value - mean) / stdDev;
      
      if (zScore > 2) { // More than 2 standard deviations
        anomalies.push({
          date,
          usage: value,
          type: value > mean ? 'unusually_high' : 'unusually_low',
          severity: zScore > 3 ? 'extreme' : 'moderate'
        });
      }
    });
    
    return anomalies;
  }
}

module.exports = BehaviorPredictor;