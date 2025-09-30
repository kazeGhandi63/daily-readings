// Langelier Saturation Index (LSI) Calculation based on Florida Pool and Spa regulation guidelines.
// Formula: SI = pH + TF + CF + AF - TDSF

const getTemperatureFactor = (tempF: number): number => {
  if (tempF <= 32) return 0.0;
  if (tempF <= 38) return 0.1;
  if (tempF <= 46) return 0.2;
  if (tempF <= 53) return 0.3;
  if (tempF <= 60) return 0.4;
  if (tempF <= 66) return 0.5;
  if (tempF <= 76) return 0.6;
  if (tempF <= 84) return 0.7;
  if (tempF <= 94) return 0.8;
  return 0.9; // for temp > 94 up to 105
};

const getCalciumHardnessFactor = (ch: number): number => {
  if (ch <= 25) return 1.0;
  if (ch <= 50) return 1.3;
  if (ch <= 75) return 1.5;
  if (ch <= 100) return 1.6;
  if (ch <= 150) return 1.8;
  if (ch <= 200) return 1.9;
  if (ch <= 300) return 2.1;
  if (ch <= 400) return 2.2;
  if (ch <= 800) return 2.5;
  return 2.5; // for ch > 800
};

const getAlkalinityFactor = (alk: number): number => {
  if (alk <= 25) return 1.4;
  if (alk <= 50) return 1.7;
  if (alk <= 75) return 1.9;
  if (alk <= 100) return 2.0;
  if (alk <= 150) return 2.2;
  if (alk <= 200) return 2.3;
  if (alk <= 300) return 2.5;
  if (alk <= 400) return 2.6;
  return 2.6; // for alk > 400
};

// The TDS factor is a constant based on TDS levels. 
// A common value for pools is ~12.1 for TDS < 1000 ppm.
const TDS_FACTOR = 12.1;

export const calculateSaturationIndex = (
  ph: number,
  temperature: number,
  alkalinity: number,
  calciumHardness: number
): number => {
  const tf = getTemperatureFactor(temperature);
  const cf = getCalciumHardnessFactor(calciumHardness);
  const af = getAlkalinityFactor(alkalinity);

  const si = ph + tf + cf + af - TDS_FACTOR;
  
  return parseFloat(si.toFixed(2)); // Return rounded to 2 decimal places
};
