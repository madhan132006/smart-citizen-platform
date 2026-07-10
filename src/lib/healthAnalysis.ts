import { HealthData, AIAnalysis } from '../types';

export const analyzeHealth = (data: HealthData): AIAnalysis => {
  let score = 100;
  const recommendations: string[] = [];

  // Rules-based analysis (simplified)
  if (Number(data.bloodPressure.systolic) > 140 || Number(data.bloodPressure.diastolic) > 90) {
    score -= 20;
    recommendations.push("High blood pressure detected. Reduce salt intake.");
  }
  if (Number(data.sugar) > 140) {
    score -= 20;
    recommendations.push("High sugar level. Consult your doctor.");
  }
  if (Number(data.water) < 8) {
    score -= 10;
    recommendations.push("Drink more water.");
  }
  if (Number(data.sleep) < 7) {
    score -= 10;
    recommendations.push("Improve your sleep.");
  }
  if (data.smoking) {
    score -= 20;
    recommendations.push("Quit smoking.");
  }

  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (score < 50) riskLevel = 'High';
  else if (score < 80) riskLevel = 'Medium';

  return {
    healthScore: Math.max(0, score),
    riskLevel,
    recommendations
  };
};
