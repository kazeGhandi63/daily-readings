import React, { useState, useEffect } from 'react';
import { Readings, AllReadings, ResortReadingsPayload } from './types';
import { calculateSaturationIndex } from './services/saturationIndex';
import { RESORTS, POOLS_BY_RESORT } from './constants';
import Header from './components/Header';
import InputField from './components/InputField';
import PrintButton from './components/PrintButton';
import SaveButton from './components/SaveButton';
import TreatmentMessage from './components/TreatmentMessage';

const initialReading: Readings = {
  chlorine: '',
  ph: '',
  temperature: '',
  flow: '',
  influent: '',
  effluent: '',
  alkalinity: '',
  calciumHardness: '',
  tds: '',
  saturationIndex: 'N/A',
};

const chunk = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );

const App: React.FC = () => {
  const [selectedResort, setSelectedResort] = useState<string>('');
  const [allReadings, setAllReadings] = useState<AllReadings>({});
  const [poolAttendant, setPoolAttendant] = useState<string>('');
  const [availablePools, setAvailablePools] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Initialize or load readings when resort changes
  useEffect(() => {
    if (selectedResort) {
      const pools = POOLS_BY_RESORT[selectedResort] || [];
      setAvailablePools(pools);
      
      const fetchReadings = async () => {
        setIsLoading(true);
        try {
          const today = new Date().toISOString().split('T')[0];
          const response = await fetch(`/api/readings?resort=${encodeURIComponent(selectedResort)}&date=${today}`);
          
          if (response.ok) {
            const data: ResortReadingsPayload = await response.json();
            setPoolAttendant(data.poolAttendant || '');
            const readingsForResort: AllReadings = {};
            pools.forEach(pool => {
              readingsForResort[pool] = data.readings?.[pool] || { ...initialReading };
            });
            setAllReadings(readingsForResort);
          } else {
            // No data found for today, initialize fresh
            const initialResortReadings: AllReadings = {};
            pools.forEach(pool => {
              initialResortReadings[pool] = { ...initialReading };
            });
            setAllReadings(initialResortReadings);
            setPoolAttendant('');
          }
        } catch (error) {
          console.error("Failed to fetch readings from API", error);
           alert('Could not fetch readings. Please check your connection.');
          const initialResortReadings: AllReadings = {};
            pools.forEach(pool => {
                initialResortReadings[pool] = { ...initialReading };
            });
          setAllReadings(initialResortReadings);
          setPoolAttendant('');
        } finally {
          setIsLoading(false);
        }
      };

      fetchReadings();

    } else {
      setAvailablePools([]);
      setAllReadings({});
      setPoolAttendant('');
    }
  }, [selectedResort]);

  const handleResortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedResort(e.target.value);
  };
  
  const handleAttendantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPoolAttendant(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, poolName: string) => {
    const { name, value } = e.target;
    setAllReadings(prev => ({
      ...prev,
      [poolName]: {
        ...prev[poolName],
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedResort) {
      alert('Please select a resort before saving.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const payload: { resort: string; date: string; data: ResortReadingsPayload } = {
        resort: selectedResort,
        date: today,
        data: {
          poolAttendant,
          readings: allReadings
        }
      };

      const response = await fetch('/api/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('All readings for this resort have been saved!');
        return;
      }
      
      // Handle non-ok responses by trying to parse a JSON error message from the body
      let errorMessage = `Failed to save readings. Server responded with status ${response.status}.`;
      try {
          const errorData = await response.json();
          // Use a more specific error message from the API if available
          errorMessage = errorData.message || errorMessage;
      } catch (e) {
          // This catch block will be executed if response.json() fails,
          // which is what happened in the user's screenshot.
          // We'll stick with the generic error message.
          console.error("Could not parse error response from server.", e);
      }
      throw new Error(errorMessage);

    } catch (error) {
      console.error("Failed to save readings to database", error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      alert(`Failed to save readings: ${message}`);
    }
  };


  // Calculate Saturation Index for all pools
  useEffect(() => {
    // Avoid re-calculation during data loading or if no readings are present
    if (isLoading || Object.keys(allReadings).length === 0) return;

    const updatedReadings: AllReadings = JSON.parse(JSON.stringify(allReadings));
    let hasChanged = false;

    Object.keys(updatedReadings).forEach(poolName => {
      const readings = updatedReadings[poolName];
      if (!readings) return;
      
      const ph = parseFloat(readings.ph);
      const temperature = parseFloat(readings.temperature);
      const alkalinity = parseFloat(readings.alkalinity);
      const calciumHardness = parseFloat(readings.calciumHardness);
      
      let newSi = 'N/A';
      if (!isNaN(ph) && !isNaN(temperature) && !isNaN(alkalinity) && !isNaN(calciumHardness)) {
        newSi = calculateSaturationIndex(ph, temperature, alkalinity, calciumHardness).toString();
      }
      
      if (readings.saturationIndex !== newSi) {
        updatedReadings[poolName].saturationIndex = newSi;
        hasChanged = true;
      }
    });

    if (hasChanged) {
      setAllReadings(updatedReadings);
    }
  }, [allReadings, isLoading]);

  const isResortSelected = !!selectedResort;
  const poolChunks = chunk(availablePools, 2);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans print:bg-white print:p-0">
      <main className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg print:shadow-none print:rounded-none">
        <Header 
          selectedResort={selectedResort} 
          onResortChange={handleResortChange}
          poolAttendant={poolAttendant}
          onAttendantChange={handleAttendantChange}
        />
        
        <form onSubmit={(e) => e.preventDefault()}>
          {isLoading ? (
             <div className="text-center py-16 text-gray-500">
              <p className="text-lg">Loading readings...</p>
            </div>
          ) : isResortSelected ? (
            <div className="space-y-10">
              {poolChunks.map((chunk, pageIndex) => (
                <div key={pageIndex} className={pageIndex < poolChunks.length - 1 ? 'print-page-break' : ''}>
                  {chunk.map(poolName => {
                    const readings = allReadings[poolName];
                    if (!readings) return null;
                    const siValue = readings.saturationIndex !== 'N/A' ? parseFloat(readings.saturationIndex) : null;

                    return (
                      <section key={poolName} className="p-4 border border-gray-200 rounded-lg print:border-none print:p-0 print:mb-4 mb-10" style={{ pageBreakInside: 'avoid' }}>
                        <h2 className="text-2xl font-bold mb-4 text-blue-700 print:text-xl">{poolName}</h2>
                        
                        <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-2 mb-4 text-gray-700">
                          Daily Readings
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <InputField label="Chlorine (ppm)" id={`chlorine-${poolName}`} name="chlorine" value={readings.chlorine} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 3.0" type="number" />
                          <InputField label="pH" id={`ph-${poolName}`} name="ph" value={readings.ph} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 7.4" type="number" />
                          <InputField label="Temperature (°F)" id={`temperature-${poolName}`} name="temperature" value={readings.temperature} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 82" type="number" unit="°F" />
                          <InputField label="Flow (GPM)" id={`flow-${poolName}`} name="flow" value={readings.flow} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 250" type="number" />
                          <InputField label="Influent (PSI)" id={`influent-${poolName}`} name="influent" value={readings.influent} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 15" type="number" />
                          <InputField label="Effluent (PSI)" id={`effluent-${poolName}`} name="effluent" value={readings.effluent} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 20" type="number" />
                        </div>
                        
                        <h3 className="text-xl font-semibold border-b-2 border-blue-200 pb-2 mb-4 mt-6 text-gray-700">
                          Weekly Readings (TDS Days)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                          <InputField label="Alkalinity (ppm)" id={`alkalinity-${poolName}`} name="alkalinity" value={readings.alkalinity} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 100" type="number" />
                          <InputField label="Calcium Hardness (ppm)" id={`calciumHardness-${poolName}`} name="calciumHardness" value={readings.calciumHardness} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 250" type="number" />
                          <InputField label="TDS (ppm)" id={`tds-${poolName}`} name="tds" value={readings.tds} onChange={(e) => handleInputChange(e, poolName)} placeholder="e.g., 900" type="number" />
                          <div className="col-span-2 md:col-span-1">
                            <InputField label="Saturation Index (SI)" id={`saturationIndex-${poolName}`} name="saturationIndex" value={readings.saturationIndex} onChange={() => {}} readOnly={true} />
                          </div>
                        </div>
                        <TreatmentMessage si={siValue} />
                      </section>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">Please select a resort to view or enter readings.</p>
            </div>
          )}
        
          <div className="flex justify-center space-x-4 mt-8">
            <SaveButton onClick={handleSave} disabled={!isResortSelected || isLoading} />
            <PrintButton />
          </div>
        </form>
      </main>
    </div>
  );
};

export default App;