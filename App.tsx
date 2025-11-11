import React, { useState, useCallback } from 'react';
import { getDiseasePrediction } from './services/geminiService';
import type { PredictionResult } from './types';
import { SYMPTOM_LIST } from './constants';
import SymptomSelector from './components/SymptomSelector';
import ResultDisplay from './components/ResultDisplay';
import Disclaimer from './components/Disclaimer';
import { Spinner } from './components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
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
    if (!apiKey.trim()) {
      setError('Please enter your API key to get a prediction.');
      return;
    }
    if (selectedSymptoms.length === 0 && otherSymptoms.trim() === '') {
      setError('Please select at least one symptom or describe your symptoms.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      const result = await getDiseasePrediction(selectedSymptoms, otherSymptoms, apiKey);
      setPredictionResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const lowerCaseMessage = errorMessage.toLowerCase();
      
      if (lowerCaseMessage.includes("api key not valid") || lowerCaseMessage.includes("api key is missing") || lowerCaseMessage.includes("requested entity was not found")) {
        setError("Your API key seems invalid. Please check it and try again.");
      } else if (lowerCaseMessage.includes("model is overloaded")) {
        setError("The prediction service is currently experiencing high traffic. Please wait a moment and try again.");
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymptoms, otherSymptoms, apiKey]);

  const isApiKeySet = apiKey.trim() !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 mb-2">
            Disease Predictor
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Enter your symptoms to get a list of potential conditions.
          </p>
        </header>

        <main className="space-y-8">
          <Disclaimer />
          
           <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white font-bold">1</span>
                  <span>Provide API Key</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-400">
                      Please enter your Google AI API key. This is required to power the symptom analysis model and is not stored.
                  </p>
                  <input
                    id="api-key-input"
                    type="password"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter your Gemini API Key"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Gemini API Key"
                  />
                  <div className="flex justify-end pt-2">
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm underline hover:text-blue-500">
                          Get an API Key from Google AI Studio
                      </a>
                  </div>
              </CardContent>
           </Card>

          <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isApiKeySet ? 'bg-cyan-500' : 'bg-slate-400'} text-white font-bold transition-colors duration-300`}>
                  2
                </span>
                <span>Enter Your Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset disabled={!isApiKeySet} className="space-y-6 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Common Symptoms
                  </label>
                  <SymptomSelector
                    symptomsList={SYMPTOM_LIST}
                    selectedSymptoms={selectedSymptoms}
                    onToggleSymptom={handleToggleSymptom}
                  />
                </div>
                <div>
                  <label htmlFor="other-symptoms" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Other Symptoms (Optional)
                  </label>
                  <textarea
                    id="other-symptoms"
                    rows={4}
                    value={otherSymptoms}
                    onChange={(e) => setOtherSymptoms(e.target.value)}
                    placeholder="Describe any other symptoms you're experiencing, e.g., 'mild fever for 2 days, sharp pain in my left side'."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
                  />
                </div>
              </fieldset>
            </CardContent>
          </Card>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !isApiKeySet}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-lg shadow-md" role="alert">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          )}

          {isLoading && (
             <div className="text-center p-8 space-y-4">
                <div className="flex justify-center items-center">
                   <Spinner className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 animate-pulse">
                    Consulting medical knowledge base...
                </p>
            </div>
          )}

          {predictionResult && <ResultDisplay result={predictionResult} />}

        </main>

        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>Powered by a predictive model. Not for medical use.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;