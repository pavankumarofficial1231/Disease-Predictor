import React from 'react';

interface SymptomSelectorProps {
  symptomsList: string[];
  selectedSymptoms: string[];
  onToggleSymptom: (symptom: string) => void;
}

const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  symptomsList,
  selectedSymptoms,
  onToggleSymptom,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {symptomsList.map(symptom => {
        const isSelected = selectedSymptoms.includes(symptom);
        return (
          <button
            key={symptom}
            onClick={() => onToggleSymptom(symptom)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
              transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800
              ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
              }
            `}
          >
            {symptom}
          </button>
        );
      })}
    </div>
  );
};

export default SymptomSelector;
