export interface Readings {
  chlorine: string;
  ph: string;
  temperature: string;
  flow: string;
  influent: string;
  effluent: string;
  alkalinity: string;
  calciumHardness: string;
  tds: string;
  saturationIndex: string;
}

export type AllReadings = {
  [poolName: string]: Readings;
};

export interface ResortReadingsPayload {
  poolAttendant: string;
  readings: AllReadings;
}
