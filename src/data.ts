import { LeaseInfo, OdometerLog, TripLog } from './types';

export const DEFAULT_LEASE: LeaseInfo = {
  carModel: 'BMW X1 sDrive20i M Sport',
  startDate: '2025-08-01',
  termMonths: 12,
  totalAllowedKm: 17500,
  initialOdometer: 0,
  monthlyAllocation: 1458,
  freeExcessKm: 2500,
  carRegistration: '',
  firstRegistrationDate: '',
  parkingPermitValidFrom: '',
  parkingPermitValidTo: '',
  leaseContractNumber: '',
  leaseCustomerNumber: '',
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

// Popular lease/subscription car models for quick selection
export const POPULAR_CAR_MODELS = [
  'BMW X1 sDrive20i M Sport',
  'BMW iX1 xDrive30',
  'Tesla Model Y Long Range',
  'Tesla Model 3 Highland',
  'Audi Q4 e-tron Sportback',
  'Volkswagen ID.4 Pro',
  'Volkswagen Golf GTI',
  'Mercedes-Benz EQA 250',
  'Porsche Taycan 4S',
  'Volvo XC40 Recharge',
];

// Dynamically match a beautiful Unsplash car photo to the chosen model
export function getCarImageUrl(modelName: string): string {
  if (!modelName) {
    return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000';
  }
  const name = modelName.toLowerCase();
  if (name.includes('tesla')) {
    return 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('bmw')) {
    if (name.includes('ix1') || name.includes('ix3') || name.includes('i4')) {
      return 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1000';
    }
    return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('audi')) {
    return 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('mercedes') || name.includes('benz') || name.includes('eqs') || name.includes('eqa') || name.includes('eqb')) {
    return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('volkswagen') || name.includes('golf') || name.includes('id.4') || name.includes('id.3') || name.includes('vw')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('porsche') || name.includes('taycan') || name.includes('911')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000';
  }
  if (name.includes('volvo')) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000';
  }
  // Fallback high-quality headlights premium car photo
  return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000';
}

