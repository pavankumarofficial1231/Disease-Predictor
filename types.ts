export interface Prediction {
  condition: string;
  confidence: number; // A percentage from 0 to 100
  description: string;
  nextSteps: string;
}

export interface PredictionResult {
  predictions: Prediction[];
}
