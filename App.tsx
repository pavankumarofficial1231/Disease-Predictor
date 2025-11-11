import React, { useState, useCallback, useEffect } from 'react';
import { getDiseasePrediction } from './services/geminiService';
import type { PredictionResult } from './types';
import { SYMPTOM_LIST } from './constants';
import SymptomSelector from './components/SymptomSelector';
import ResultDisplay from './components/ResultDisplay';
import Disclaimer from './components/Disclaimer';
import { Spinner } from './components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import ApiKeySelector from './components/ApiKeySelector';

// FIX: Removed conflicting global type declaration for `window.aistudio` to resolve a compilation error.
// The type is expected to be provided by the execution environment.

const App: React.FC = () => {
  const [isKeyReady, setIsKeyReady] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsKeyReady(hasKey);
      } catch (e) {
        console.error("Error checking for API key:", e);
        setIsKeyReady(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    setApiKeyError(null);
    try {
      await window.aistudio.openSelectKey();
      setIsKeyReady(true);
    } catch (e) {
      console.error("Error opening key selector:", e);
      setApiKeyError("Could not open the API key selector. Please try again.");
    }
  };

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
      // FIX: Create a new GoogleGenAI instance right before making an API call.
      const result = await getDiseasePrediction(selectedSymptoms, otherSymptoms);
      setPredictionResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const lowerCaseMessage = errorMessage.toLowerCase();
      
      if (lowerCaseMessage.includes("api key not valid") || lowerCaseMessage.includes("requested entity was not found") || lowerCaseMessage.includes("api key is missing")) {
        setApiKeyError("Your API key appears to be invalid. Please select a different key.");
        setIsKeyReady(false);
      } else if (lowerCaseMessage.includes("model is overloaded")) {
        setError("The prediction service is currently experiencing high traffic. Please wait a moment and try again.");
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymptoms, otherSymptoms]);

  if (!isKeyReady) {
    return <ApiKeySelector onSelectKey={handleSelectKey} error={apiKeyError} />;
  }


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
              <CardTitle>Enter Your Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
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
