import React, { useState } from 'react';
import { Settings, Info, Save, Car, Calendar, Euro, ArrowRight } from 'lucide-react';
import { LeaseInfo } from '../types';

interface LeaseViewProps {
  lease: LeaseInfo;
  onUpdateLease: (updatedLease: LeaseInfo) => void;
}

export default function LeaseView({ lease, onUpdateLease }: LeaseViewProps) {
  const [carModel, setCarModel] = useState<string>(lease.carModel);
  const [startDate, setStartDate] = useState<string>(lease.startDate);
  const [termMonths, setTermMonths] = useState<string>(lease.termMonths.toString());
  
  // Calculate initial allowed km per year based on current totalAllowedKm and termMonths
  const initialAllowedKmPerYear = lease.termMonths > 0 
    ? Math.round((lease.totalAllowedKm / lease.termMonths) * 12).toString()
    : "15000";
  const [allowedKmPerYear, setAllowedKmPerYear] = useState<string>(initialAllowedKmPerYear);
  const [initialOdometer, setInitialOdometer] = useState<string>(lease.initialOdometer.toString());
  const [excessCharge, setExcessCharge] = useState<string>(() => localStorage.getItem('mileage_tracker_excess_charge') || "0.15"); // standard $0.15 / km Excess

  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Safe numerical parsing for logic & display computations
  const termMonthsNum = parseInt(termMonths, 10) || 0;
  const allowedKmPerYearNum = parseInt(allowedKmPerYear, 10) || 0;
  const initialOdometerNum = parseInt(initialOdometer, 10) || 0;
  const excessChargeNum = parseFloat(excessCharge) || 0;

  // Compute total allowed km based on terms (months) and allowed distance per year:
  const totalAllowedKmNum = Math.round((allowedKmPerYearNum / 12) * termMonthsNum);

  const calculatedMonthlyAllocation = Math.round(totalAllowedKmNum / Math.max(1, termMonthsNum));
  const calculatedDailyAllocation = (totalAllowedKmNum / (Math.max(1, termMonthsNum) * 30.4375)).toFixed(1);

  // Compute lease end date based on start date and term
  const calculatedEndDate = React.useMemo(() => {
    if (!startDate) return "—";
    const date = new Date(startDate);
    if (isNaN(date.getTime())) return "—";
    date.setMonth(date.getMonth() + termMonthsNum);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, [startDate, termMonthsNum]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mileage_tracker_excess_charge', excessCharge);
    onUpdateLease({
      carModel,
      startDate,
      termMonths: termMonthsNum || 1,
      totalAllowedKm: totalAllowedKmNum,
      initialOdometer: initialOdometerNum,
      monthlyAllocation: calculatedMonthlyAllocation,
    });
    
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-md mx-auto w-full px-6 animate-fade-in">
      
      {/* Premium Car Display Header */}
      <section className="flex flex-col gap-3">
        <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.05)] bg-surface-container-low h-52 relative group">
          <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=1000')` 
            }}
          />
        </div>
        <div className="px-1 flex justify-between items-baseline">
          <div>
            <h2 className="font-sans text-[20px] font-medium tracking-tight text-primary">
              {lease.carModel}
            </h2>
            <p className="font-sans text-[12px] text-on-surface-variant">
              Active Digital Lease Contract
            </p>
          </div>
          <span className="px-2.5 py-0.5 bg-secondary-container/20 text-secondary text-[11px] font-bold rounded-full uppercase tracking-wider">
            Premium
          </span>
        </div>
      </section>

      {/* Contract Parameters Summary Indicators */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">
            DAILY PERMITTED
          </span>
          <p className="font-sans text-[18px] font-medium text-primary">
            {calculatedDailyAllocation} km
          </p>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col gap-1">
          <span className="font-sans text-[10px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">
            MONTHLY BUDGET
          </span>
          <p className="font-sans text-[18px] font-medium text-primary">
            {calculatedMonthlyAllocation.toLocaleString()} km
          </p>
        </div>
      </section>

      {/* Lease Settings Form */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-on-surface-variant" />
          <h3 className="font-sans text-[15px] font-bold tracking-[0.05em] text-primary uppercase">
            Lease Specifications
          </h3>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Section 1: User Inputs */}
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-bold text-on-surface-variant/70 tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Enter Contract Details
            </div>

            {/* Car Model input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                Car Model Name
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[14px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                required
              />
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Lease Start Date */}
              <div className="flex flex-col">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase h-9 flex items-end pb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Lease Term */}
              <div className="flex flex-col">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase h-9 flex items-end pb-1">
                  Term (Months)
                </label>
                <input
                  type="number"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Allowed Distance per Year */}
              <div className="flex flex-col">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase h-9 flex items-end pb-1">
                  Allowed Distance / Year (km)
                </label>
                <input
                  type="number"
                  value={allowedKmPerYear}
                  onChange={(e) => setAllowedKmPerYear(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  min="0"
                  required
                />
              </div>

              {/* Initial Odometer */}
              <div className="flex flex-col">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase h-9 flex items-end pb-1">
                  Initial Odo (km)
                </label>
                <input
                  type="number"
                  value={initialOdometer}
                  onChange={(e) => setInitialOdometer(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Excess Mileage Charge rate */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                Excess Mileage Fee (per km)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={excessCharge}
                  onChange={(e) => setExcessCharge(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[14px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  step="0.01"
                  min="0"
                  required
                />
                <Euro className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Section 2: Computed Results Block */}
          <div className="flex flex-col gap-3">
            <div className="text-[10px] font-bold text-secondary tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              Calculated Projections (Read Only)
            </div>

            <div className="bg-secondary-container/10 border border-secondary/20 rounded-2xl p-4 flex flex-col gap-4 shadow-inner">
              
              {/* Row 1: End Date & Total Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/70 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-secondary" /> Projected End Date
                  </span>
                  <p className="font-sans text-[13px] font-semibold text-primary">
                    {calculatedEndDate}
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/70 uppercase flex items-center gap-1">
                    <Car className="w-3 h-3 text-secondary" /> Total Contract Km
                  </span>
                  <p className="font-sans text-[13px] font-semibold text-primary">
                    {totalAllowedKmNum.toLocaleString()} km
                  </p>
                  <span className="text-[9px] text-on-surface-variant/60 font-medium">
                    {allowedKmPerYearNum.toLocaleString()} km/yr × {termMonthsNum} mo
                  </span>
                </div>
              </div>

              <div className="border-t border-outline-variant/10"></div>

              {/* Row 2: Allocations */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/70 uppercase">
                    Monthly Budget
                  </span>
                  <p className="font-sans text-[13px] font-bold text-secondary">
                    {calculatedMonthlyAllocation.toLocaleString()} km
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="font-sans text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/70 uppercase">
                    Daily Budget
                  </span>
                  <p className="font-sans text-[13px] font-bold text-secondary">
                    {calculatedDailyAllocation} km
                  </p>
                </div>
              </div>

            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3.5 bg-primary hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-sans text-[13px] font-bold tracking-[0.05em] transition-all flex items-center justify-center gap-1.5 uppercase shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Specifications
          </button>
        </form>

        {isSaved && (
          <div className="mt-4 p-3 bg-secondary-container/20 border border-secondary/20 rounded-xl text-center font-sans text-[12px] text-secondary font-medium animate-fade-in">
            Specifications successfully saved to device registry.
          </div>
        )}
      </section>

      {/* Terms & Conditions Simulated Box */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)]">
        <div className="flex gap-2.5 items-start">
          <Info className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans text-[13px] font-bold text-primary mb-1">
              Excess Wear & Mileage
            </h4>
            <p className="font-sans text-[12px] text-on-surface-variant leading-relaxed mb-3">
              Standard contract stipulates a charge of <span className="font-bold text-primary">€{excessChargeNum.toFixed(2)}</span> for every kilometer driven over the total allowed <span className="font-bold text-primary">{totalAllowedKmNum.toLocaleString()} km</span> at contract expiry. 
            </p>
            <div className="p-3 bg-surface-container-low rounded-xl flex justify-between items-center text-[11px] font-medium text-on-surface-variant">
              <span>Excess Mileage Charge rate</span>
              <span className="font-bold text-primary">€{excessChargeNum.toFixed(2)} / km</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
