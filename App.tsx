import React, { useState, useCallback } from 'react';
import { getDiseasePrediction } from './services/geminiService';
import type { PredictionResult } from './types';
import { SYMPTOM_LIST } from './constants';
import SymptomSelector from './components/SymptomSelector';
import ResultDisplay from './components/ResultDisplay';
import Disclaimer from './components/Disclaimer';
import { Spinner } from './components/ui/Spinner';

const App: React.FC = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = useCallback(async () => {
    if (selectedSymptoms.length === 0 && otherSymptoms.trim() === '') {
      setError('Please select at least one symptom or describe your symptoms.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const result = await getDiseasePrediction(selectedSymptoms, otherSymptoms);
      setPredictionResult(result);
    } catch (err) {
      setError('Failed to get prediction. The model may be overloaded. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymptoms, otherSymptoms]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">
            Disease Predictor
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Enter your symptoms and let our tool suggest potential conditions.
          </p>
        </header>

        <Disclaimer />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-slate-700 dark:text-slate-200">1. Select Your Symptoms</h2>
            <SymptomSelector
              symptomsList={SYMPTOM_LIST}
              selectedSymptoms={selectedSymptoms}
              onToggleSymptom={handleToggleSymptom}
            />
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-slate-700 dark:text-slate-200">2. Describe Other Symptoms</h2>
            <textarea
              className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200"
              rows={4}
              placeholder="e.g., 'Mild headache for 2 days, feeling tired...'"
              value={otherSymptoms}
              onChange={(e) => setOtherSymptoms(e.target.value)}
            />

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full mt-6 py-3 px-6 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Analyzing...
                </>
              ) : (
                'Get Prediction'
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[300px] flex items-center justify-center">
            {isLoading && (
              <div className="text-center">
                <Spinner className="w-12 h-12" />
                <p className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">
                  Analyzing symptoms...
                </p>
                <p className="text-slate-500 dark:text-slate-400">This may take a moment.</p>
              </div>
            )}
            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
            {!isLoading && !error && !predictionResult && (
              <div className="text-center text-slate-500 dark:text-slate-400">
                <p className="text-xl">Your results will appear here.</p>
              </div>
            )}
            {predictionResult && <ResultDisplay result={predictionResult} />}
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; 2024 Disease Predictor. All rights reserved.</p>
          <p className="mt-1">This tool does not provide medical advice. Always consult with a healthcare professional.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;