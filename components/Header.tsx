import React from 'react';
import { RESORTS } from '../constants';

interface HeaderProps {
    selectedResort: string;
    onResortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    poolAttendant: string;
    onAttendantChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    selectedResort, 
    onResortChange,
    poolAttendant,
    onAttendantChange
}) => {
    return (
        <header className="mb-8 p-4 bg-white rounded-lg shadow-md print:shadow-none print:bg-transparent print:p-0 print:mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <h1 className="text-3xl font-bold text-gray-800 print:text-2xl">
                    Daily Readings
                </h1>
                {/* Screen view */}
                <div className="w-full sm:w-auto print:hidden">
                    <label htmlFor="resort-select" className="sr-only">Select Resort</label>
                    <select
                        id="resort-select"
                        value={selectedResort}
                        onChange={onResortChange}
                        className="w-full sm:w-64 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled>Select a Resort</option>
                        {RESORTS.map(resort => (
                            <option key={resort} value={resort}>{resort}</option>
                        ))}
                    </select>
                </div>
                {/* Print view */}
                <div className="hidden print:block text-right">
                    <p className="font-semibold text-lg">{selectedResort}</p>
                    {poolAttendant && <p className="text-sm">Attendant: {poolAttendant}</p>}
                </div>
            </div>
             <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 space-y-2 sm:space-y-0">
                <div className="print:text-lg">
                    <span>Date: {new Date().toLocaleDateString()}</span>
                </div>
                 <div className="w-full sm:w-64 print:hidden">
                    <label htmlFor="poolAttendant" className="sr-only">Pool Attendant</label>
                    <input
                        type="text"
                        id="poolAttendant"
                        name="poolAttendant"
                        value={poolAttendant}
                        onChange={onAttendantChange}
                        placeholder="Pool Attendant Name"
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
