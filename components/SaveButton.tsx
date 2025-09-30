import React from 'react';

interface SaveButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto mt-8 px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out print:hidden disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Save Readings
    </button>
  );
};

export default SaveButton;
