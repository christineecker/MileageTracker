import { LeaseInfo, OdometerLog, TripLog } from './types';

export const DEFAULT_LEASE: LeaseInfo = {
  carModel: 'BMW X1 sDrive20i M Sport',
  startDate: '2025-08-01',
  termMonths: 12,
  totalAllowedKm: 15000,
  initialOdometer: 0,
  monthlyAllocation: 1250,
};

export const DEFAULT_ODOMETER_LOGS: OdometerLog[] = [];

export const DEFAULT_TRIP_LOGS: TripLog[] = [];

// List of aesthetic locations in Tokyo for simulated logs
export const TOKYO_LOCATIONS = [
  'Downtown Studio',
  'Tsutaya Books Daikanyama',
  'Nezu Museum',
  'Aoyama Creative Hub',
  'Roppongi Hills Meeting',
  'Shinjuku Gyoen National Garden',
  'Omotesando Hills',
  'Meguro River Park',
  'Haneda Airport Terminal 3',
  'Ginza Six Art Gallery',
  'Yoyogi Park West',
  'Kagurazaka Cafe',
];
