import React, { useState, useCallback, useEffect } from 'react';
import { getDiseasePrediction } from './services/geminiService';
import type { PredictionResult } from './types';
import { SYMPTOM_LIST } from './constants';
import SymptomSelector from './components/SymptomSelector';
import ResultDisplay from './components/ResultDisplay';
import Disclaimer from './components/Disclaimer';
import { Spinner } from './components/ui/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';

// New inline component for the banner
const ApiKeyBanner: React.FC<{ onSelectKey: () => void; error?: string | null }> = ({ onSelectKey, error }) => (
  <div className="bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500 text-cyan-800 dark:text-cyan-200 p-4 rounded-lg mb-6 shadow-md" role="alert">
    <div className="flex">
        <div className="py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m0-4h2a2 2 0 012 2v2H9V7a2 2 0 012-2zm0 8h2a2 2 0 012 2v2H9v-2a2 2 0 012-2z" />
            </svg>
        </div>
        <div className="ml-3 flex-grow">
          <p className="font-bold">API Key Required</p>
          <p className="text-sm">Please select an API key to enable the symptom predictor.</p>
          {error && <p className="text-red-500 text-sm mt-1 font-semibold">{error}</p>}
        </div>
    </div>
    <div className="mt-3 flex justify-end items-center">
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs underline hover:text-blue-500 mr-4">
            Billing Information
        </a>
        <button
            onClick={onSelectKey}
            className="py-2 px-4 text-sm font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 transition-all duration-300 transform hover:scale-105"
        >
            Select API Key
        </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [otherSymptoms, setOtherSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      if (typeof window.aistudio !== 'undefined' && window.aistudio) {
        setIsReady(true);
        clearInterval(checkInterval);
      } else {
        attempts++;
        if (attempts > 10) { // Wait for up to 1 second
          setInitError('Could not connect to the application environment. Please try refreshing the page.');
          clearInterval(checkInterval);
        }
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (isReady) {
      const checkApiKey = async () => {
        try {
          const keyStatus = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(keyStatus);
        } catch (e) {
          console.error("Error checking for API key:", e);
          setInitError("Could not verify API key status. Please refresh the page.");
        }
      };
      checkApiKey();
    }
  }, [isReady]);

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSelectKey = async () => {
    setError(null);
    setApiKeyError(null);
    try {
      await window.aistudio.openSelectKey();
      // Assume success and update UI immediately to avoid race conditions.
      setHasApiKey(true);
    } catch (selectKeyError) {
      console.error("Error opening key selector:", selectKeyError);
      // User may have closed the dialog. The banner will just remain.
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!hasApiKey) {
      setError('Please select an API key before getting a prediction.');
      return;
    }
    if (selectedSymptoms.length === 0 && otherSymptoms.trim() === '') {
      setError('Please select at least one symptom or describe your symptoms.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setApiKeyError(null);
    setPredictionResult(null);

    try {
      const result = await getDiseasePrediction(selectedSymptoms, otherSymptoms);
      setPredictionResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      const lowerCaseMessage = errorMessage.toLowerCase();
      
      if (lowerCaseMessage.includes("api key not valid") || lowerCaseMessage.includes("requested entity was not found") || lowerCaseMessage.includes("api key is missing")) {
        const keyErrorMsg = "Your API key seems invalid or was not found. Please select a new one.";
        setError(keyErrorMsg);
        setApiKeyError(keyErrorMsg);
        setHasApiKey(false);
      } else if (lowerCaseMessage.includes("model is overloaded")) {
        setError("The prediction service is currently experiencing high traffic. Please wait a moment and try again.");
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymptoms, otherSymptoms, hasApiKey]);

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
         <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-6 rounded-lg shadow-md max-w-md w-full text-center" role="alert">
            <h2 className="font-bold text-lg mb-2">Initialization Failed</h2>
            <p>{initError}</p>
        </div>
      </div>
    );
  }

  if (!isReady || hasApiKey === null) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <Spinner className="h-10 w-10 text-blue-500" />
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-lg">Initializing Application...</p>
        </div>
    );
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
            <CardContent>
              {!hasApiKey && <ApiKeyBanner onSelectKey={handleSelectKey} error={apiKeyError} />}
              <fieldset disabled={!hasApiKey} className="space-y-6 transition-opacity duration-300 disabled:opacity-50">
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
              disabled={isLoading || !hasApiKey}
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
