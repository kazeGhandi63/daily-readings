import React from 'react';

const PrintButton: React.FC = () => {
  return (
    <button
      onClick={() => window.print()}
      className="w-full sm:w-auto mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out print:hidden"
    >
      Print Log
    </button>
  );
};

export default PrintButton;
