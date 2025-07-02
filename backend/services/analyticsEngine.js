const ScreenTimeData = require('../models/ScreenTimeData');
const WellnessMetrics = require('../models/WellnessMetrics');

class AnalyticsEngine {
  // Calculate productivity patterns
  static async calculateProductivityPatterns(userId, timeRange = 30) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (timeRange * 24 * 60 * 60 * 1000));
    
    const data = await ScreenTimeData.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Group by hour to find peak productivity times
    const hourlyProductivity = {};
    data.forEach(entry => {
      const hour = entry.timestamp.getHours();
      if (!hourlyProductivity[hour]) {
        hourlyProductivity[hour] = { productive: 0, total: 0 };
      }
      
      hourlyProductivity[hour].total += entry.duration;
      if (entry.category === 'productivity') {
        hourlyProductivity[hour].productive += entry.duration;
      }
    });
    
    // Calculate productivity score for each hour
    const productivityByHour = Object.keys(hourlyProductivity).map(hour => ({
      hour: parseInt(hour),
      productivityRatio: hourlyProductivity[hour].productive / hourlyProductivity[hour].total,
      totalTime: hourlyProductivity[hour].total
    }));
    
    return productivityByHour.sort((a, b) => b.productivityRatio - a.productivityRatio);
  }
  
  // Predict digital burnout risk
  static async predictBurnoutRisk(userId) {
    const recentData = await ScreenTimeData.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Calculate risk factors
    const totalScreenTime = recentData.reduce((sum, entry) => sum + entry.duration, 0);
    const avgDailyScreenTime = totalScreenTime / 7;
    const stressedSessions = recentData.filter(entry => entry.emotionalState === 'stressed').length;
    const highNotificationDays = recentData.filter(entry => entry.notificationCount > 50).length;
    
    // Simple burnout prediction algorithm
    let burnoutScore = 0;
    if (avgDailyScreenTime > 480) burnoutScore += 30; // 8+ hours
    if (stressedSessions > 10) burnoutScore += 25;
    if (highNotificationDays > 3) burnoutScore += 20;
    
    // Add pattern-based scoring
    const lateNightUsage = recentData.filter(entry => 
      entry.timestamp.getHours() > 23 || entry.timestamp.getHours() < 6
    ).length;
    
    if (lateNightUsage > 5) burnoutScore += 25;
    
    return Math.min(burnoutScore, 100);
  }
  
  // Generate personalized recommendations
  static async generateRecommendations(userId) {
    const burnoutRisk = await this.predictBurnoutRisk(userId);
    const productivityPatterns = await this.calculateProductivityPatterns(userId);
    
    const recommendations = [];
    
    if (burnoutRisk > 70) {
      recommendations.push({
        type: 'urgent',
        title: 'High Burnout Risk Detected',
        description: 'Consider taking a digital detox break',
        action: 'Schedule 2-hour device-free periods daily'
      });
    }
    
    if (productivityPatterns.length > 0) {
      const peakHour = productivityPatterns[0];
      recommendations.push({
        type: 'optimization',
        title: 'Optimize Your Peak Hours',
        description: `Your most productive time is ${peakHour.hour}:00`,
        action: 'Schedule important tasks during this time'
      });
    }
    
    return recommendations;
  }
}

module.exports = AnalyticsEngine;