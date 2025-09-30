import React from 'react';

interface TreatmentMessageProps {
  si: number | null;
}

const TreatmentMessage: React.FC<TreatmentMessageProps> = ({ si }) => {
  if (si === null || isNaN(si)) {
    return null; // Don't render anything if SI is not a valid number
  }

  let message = '';
  let screenStyleClasses = '';
  let printStyleClasses = '';
  let title = '';

  if (si > 0.2) {
    title = 'Scale-Forming';
    message = 'Water is scale-forming. Treatment is recommended to lower the Saturation Index.';
    screenStyleClasses = 'bg-yellow-100 border-yellow-500 text-yellow-700';
    printStyleClasses = 'border-gray-500 text-black';
  } else if (si < -0.2) {
    title = 'Corrosive';
    message = 'Water is corrosive. Treatment is recommended to raise the Saturation Index.';
    screenStyleClasses = 'bg-red-100 border-red-500 text-red-700';
    printStyleClasses = 'border-gray-500 text-black';
  } else {
    title = 'Balanced';
    message = 'Water is balanced. No treatment needed.';
    screenStyleClasses = 'bg-green-100 border-green-500 text-green-700';
    printStyleClasses = 'border-gray-500 text-black';
  }

  return (
    <div className={`${screenStyleClasses} p-4 mt-6 rounded-md border-l-4 print:border print:bg-white print:p-2 print:mt-4 ${printStyleClasses}`} role="alert">
      <p className="font-bold">Water Balance Status: {title}</p>
      <p>{message}</p>
    </div>
  );
};

export default TreatmentMessage;