import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface ApiKeySelectorProps {
  onSelectKey: () => void;
  error?: string | null;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSelectKey, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="max-w-lg w-full text-center shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">API Key Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            To use this application, you need to select a Google Gemini API key. 
            Your key is used only for this session and is not stored.
          </p>
          {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
          <button
            onClick={onSelectKey}
            className="w-full py-3 px-6 text-lg font-semibold text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 transition-all duration-300 transform hover:scale-105"
          >
            Select API Key
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            For information on billing, please visit the{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
              official documentation
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeySelector;
