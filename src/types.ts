export type PurposeType = 'business' | 'personal';

export interface LeaseInfo {
  carModel: string;
  startDate: string; // YYYY-MM-DD
  termMonths: number;
  totalAllowedKm: number;
  initialOdometer: number;
  monthlyAllocation: number;
}

export interface OdometerLog {
  id: string;
  date: string; // YYYY-MM-DD
  value: number; // Odometer reading in km
  isMonthlyCheck: boolean;
}

export interface TripLog {
  id: string;
  date: string; // YYYY-MM-DD
  distance: number; // km
  purpose: PurposeType;
  destination: string;
}

export interface AppState {
  lease: LeaseInfo;
  odometerLogs: OdometerLog[];
  tripLogs: TripLog[];
}
