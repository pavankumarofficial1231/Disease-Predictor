import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { PredictionResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ResultDisplayProps {
  result: PredictionResult;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'];

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result || result.predictions.length === 0) {
    return <p>No predictions available.</p>;
  }

  const topPrediction = result.predictions[0];
  const chartData = result.predictions.map(p => ({
    name: p.condition,
    confidence: p.confidence,
  }));

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100">Analysis Complete</h2>
      
      <Card className="w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800 dark:to-slate-900 border-blue-200 dark:border-blue-700 shadow-xl">
        <CardHeader>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Most Likely Condition</p>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100">{topPrediction.condition}</CardTitle>
          <div className="text-lg font-bold text-blue-500">{topPrediction.confidence}% Confidence</div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Description</h4>
            <p className="text-slate-600 dark:text-slate-400">{topPrediction.description}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 dark:text-slate-300">Recommended Next Steps</h4>
            <p className="text-slate-600 dark:text-slate-400 font-medium">{topPrediction.nextSteps}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Confidence Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs" />
                <YAxis unit="%" tick={{ fill: 'currentColor' }} />
                <Tooltip
                  cursor={{fill: 'rgba(100, 116, 139, 0.1)'}}
                  contentStyle={{
                    backgroundColor: 'rgba(30, 41, 59, 0.9)',
                    borderColor: 'rgba(100, 116, 139, 0.5)',
                    color: '#fff',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                    {chartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultDisplay;
