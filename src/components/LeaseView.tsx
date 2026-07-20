import React, { useState } from 'react';
import { Settings, Info, Save, Car, Calendar, Euro, ArrowRight, Bell, RotateCcw } from 'lucide-react';
import { LeaseInfo } from '../types';
import { DEFAULT_LEASE } from '../data';

interface LeaseViewProps {
  lease: LeaseInfo;
  onUpdateLease: (updatedLease: LeaseInfo) => void;
  onResetAllData?: () => void;
}

export default function LeaseView({ lease, onUpdateLease, onResetAllData }: LeaseViewProps) {
  const [carModel, setCarModel] = useState<string>(lease.carModel);
  const [startDate, setStartDate] = useState<string>(lease.startDate);
  const [termMonths, setTermMonths] = useState<string>(lease.termMonths.toString());
  
  const initialFreeExcessKm = lease.freeExcessKm !== undefined ? lease.freeExcessKm : 2500;
  const [freeExcessKm, setFreeExcessKm] = useState<string>(initialFreeExcessKm.toString());

  const [carRegistration, setCarRegistration] = useState<string>(lease.carRegistration || '');
  const [firstRegistrationDate, setFirstRegistrationDate] = useState<string>(lease.firstRegistrationDate || '');
  const [parkingPermitValidFrom, setParkingPermitValidFrom] = useState<string>(lease.parkingPermitValidFrom || '');
  const [parkingPermitValidTo, setParkingPermitValidTo] = useState<string>(lease.parkingPermitValidTo || '');
  const [leaseContractNumber, setLeaseContractNumber] = useState<string>(lease.leaseContractNumber || '');
  const [leaseCustomerNumber, setLeaseCustomerNumber] = useState<string>(lease.leaseCustomerNumber || '');

  // Calculate initial allowed km per year based on current base allowed km (totalAllowedKm - freeExcessKm if present) and termMonths
  const baseAllowedKm = lease.freeExcessKm !== undefined 
    ? (lease.totalAllowedKm - lease.freeExcessKm) 
    : lease.totalAllowedKm;

  const initialAllowedKmPerYear = lease.termMonths > 0 
    ? Math.round((baseAllowedKm / lease.termMonths) * 12).toString()
    : "15000";
  const [allowedKmPerYear, setAllowedKmPerYear] = useState<string>(initialAllowedKmPerYear);
  const [initialOdometer, setInitialOdometer] = useState<string>(lease.initialOdometer.toString());
  const [excessCharge, setExcessCharge] = useState<string>(() => localStorage.getItem('mileage_tracker_excess_charge') || "0.15"); // standard $0.15 / km Excess

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all odometer/trip history logs AND reset car/lease specifications to default settings?")) {
      setCarModel(DEFAULT_LEASE.carModel);
      setStartDate(DEFAULT_LEASE.startDate);
      setTermMonths(DEFAULT_LEASE.termMonths.toString());
      setFreeExcessKm((DEFAULT_LEASE.freeExcessKm !== undefined ? DEFAULT_LEASE.freeExcessKm : 2500).toString());
      setCarRegistration(DEFAULT_LEASE.carRegistration || '');
      setFirstRegistrationDate(DEFAULT_LEASE.firstRegistrationDate || '');
      setParkingPermitValidFrom(DEFAULT_LEASE.parkingPermitValidFrom || '');
      setParkingPermitValidTo(DEFAULT_LEASE.parkingPermitValidTo || '');
      setLeaseContractNumber(DEFAULT_LEASE.leaseContractNumber || '');
      setLeaseCustomerNumber(DEFAULT_LEASE.leaseCustomerNumber || '');
      setAllowedKmPerYear("15000"); // 15000 base + 2500 free excess = 17500 totalAllowedKm
      setInitialOdometer(DEFAULT_LEASE.initialOdometer.toString());
      setExcessCharge("0.15");
      localStorage.setItem('mileage_tracker_excess_charge', "0.15");

      // Notify parent to reset lease details
      onUpdateLease(DEFAULT_LEASE);

      // Trigger resetting all logs (as requested)
      if (onResetAllData) {
        onResetAllData();
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  // Safe numerical parsing for logic & display computations
  const termMonthsNum = parseInt(termMonths, 10) || 0;
  const allowedKmPerYearNum = parseInt(allowedKmPerYear, 10) || 0;
  const initialOdometerNum = parseInt(initialOdometer, 10) || 0;
  const excessChargeNum = parseFloat(excessCharge) || 0;
  const freeExcessKmNum = parseInt(freeExcessKm, 10) || 0;

  // Compute total allowed km based on terms (months), allowed distance per year, plus free excess km:
  const baseTotalAllowedKmNum = Math.round((allowedKmPerYearNum / 12) * termMonthsNum);
  const totalAllowedKmNum = baseTotalAllowedKmNum + freeExcessKmNum;

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
      freeExcessKm: freeExcessKmNum,
      carRegistration,
      firstRegistrationDate,
      parkingPermitValidFrom,
      parkingPermitValidTo,
      leaseContractNumber,
      leaseCustomerNumber,
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

      {/* Active Lease Info Metadata Cards */}
      {(lease.carRegistration || lease.firstRegistrationDate || lease.parkingPermitValidFrom || lease.parkingPermitValidTo || lease.leaseContractNumber || lease.leaseCustomerNumber) && (
        <section className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
            <Car className="w-4 h-4 text-secondary animate-pulse" />
            <h3 className="font-sans text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
              Car & Contract Registry
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-[12px]">
            {lease.carRegistration && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/75 uppercase">Registration (Kennzeichen)</span>
                <span className="font-mono text-primary font-semibold tracking-wider bg-surface-container/40 px-2 py-0.5 rounded border border-outline-variant/10 w-fit">{lease.carRegistration}</span>
              </div>
            )}
            
            {lease.firstRegistrationDate && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/75 uppercase">Erstzulassung</span>
                <span className="text-primary font-medium">
                  {lease.firstRegistrationDate ? new Date(lease.firstRegistrationDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                </span>
              </div>
            )}

            {lease.leaseContractNumber && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/75 uppercase">Contract No. (Vertragsnr.)</span>
                <span className="font-mono text-primary font-medium">{lease.leaseContractNumber}</span>
              </div>
            )}

            {lease.leaseCustomerNumber && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/75 uppercase">Customer No. (Kundennr.)</span>
                <span className="font-mono text-primary font-medium">{lease.leaseCustomerNumber}</span>
              </div>
            )}

            {(lease.parkingPermitValidFrom || lease.parkingPermitValidTo) && (
              <div className="col-span-2 flex flex-col gap-0.5 mt-1 pt-2 border-t border-outline-variant/10">
                <span className="text-[9px] font-bold tracking-[0.05em] text-on-surface-variant/75 uppercase">Resident Parking Permit (Bewohnerparkausweis)</span>
                <div className="flex items-center gap-1.5 text-primary font-medium">
                  <span>{lease.parkingPermitValidFrom ? new Date(lease.parkingPermitValidFrom).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant/65" />
                  <span>{lease.parkingPermitValidTo ? new Date(lease.parkingPermitValidTo).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

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
          <div className="flex flex-col gap-5">
            
            {/* 1.1 Vehicle Specifications */}
            <div className="text-[10px] font-bold text-on-surface-variant/70 tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Vehicle Specifications
            </div>

            {/* Car Model input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                Car Model Name
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[14px] text-primary focus:ring-1 focus:ring-primary focus:outline-none w-full"
                placeholder="e.g. BMW X1 sDrive20i"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Car Registration */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Registration / Kennzeichen
                </label>
                <input
                  type="text"
                  value={carRegistration}
                  onChange={(e) => setCarRegistration(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. M-CE 1234"
                />
              </div>

              {/* First Registration */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Erstzulassung
                </label>
                <input
                  type="date"
                  value={firstRegistrationDate}
                  onChange={(e) => setFirstRegistrationDate(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* 1.2 Resident Parking Permit */}
            <div className="text-[10px] font-bold text-on-surface-variant/70 tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Resident Parking / Bewohnerparkausweis
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valid From */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Valid From / Gültig von
                </label>
                <input
                  type="date"
                  value={parkingPermitValidFrom}
                  onChange={(e) => setParkingPermitValidFrom(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Valid To */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Valid To / Gültig bis
                </label>
                <input
                  type="date"
                  value={parkingPermitValidTo}
                  onChange={(e) => setParkingPermitValidTo(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* 1.3 Lease Account Details */}
            <div className="text-[10px] font-bold text-on-surface-variant/70 tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Contract & Account Numbers
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Lease Contract Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Contract No. / Vertragsnr.
                </label>
                <input
                  type="text"
                  value={leaseContractNumber}
                  onChange={(e) => setLeaseContractNumber(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. L-902384"
                />
              </div>

              {/* Customer Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Customer No. / Kundennr.
                </label>
                <input
                  type="text"
                  value={leaseCustomerNumber}
                  onChange={(e) => setLeaseCustomerNumber(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  placeholder="e.g. KD-48204"
                />
              </div>
            </div>

            {/* 1.4 Mileage & Term Specifications */}
            <div className="text-[10px] font-bold text-on-surface-variant/70 tracking-[0.1em] uppercase flex items-center gap-1.5 border-b border-outline-variant/20 pb-1 mt-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Term & Mileage Allocation
            </div>

            {/* Grid fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Lease Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
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
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
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
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Allowed Distance / Yr (km)
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
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
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

            {/* Excess and Free Excess Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Free Excess Mileage */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Free Excess Mileage (km)
                </label>
                <input
                  type="number"
                  value={freeExcessKm}
                  onChange={(e) => setFreeExcessKm(e.target.value)}
                  className="px-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  min="0"
                  required
                />
              </div>

              {/* Excess Mileage Charge rate */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-bold tracking-[0.05em] text-on-surface-variant uppercase min-h-[2.25rem] flex items-end pb-1">
                  Excess Fee (per km)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={excessCharge}
                    onChange={(e) => setExcessCharge(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-surface-container-low border border-outline-variant/10 rounded-xl font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    step="0.01"
                    min="0"
                    required
                  />
                  <Euro className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant/50 pointer-events-none" />
                </div>
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
                    {baseTotalAllowedKmNum.toLocaleString()} km base + {freeExcessKmNum.toLocaleString()} km free excess
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
            className="mt-2 w-full py-3.5 bg-primary hover:opacity-90 active:scale-[0.98] text-on-primary rounded-xl font-sans text-[13px] font-bold tracking-[0.05em] transition-all flex items-center justify-center gap-1.5 uppercase shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Specifications
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="mt-3 w-full py-3.5 bg-error/5 hover:bg-error/10 active:scale-[0.98] text-error border border-error/20 hover:border-error/30 rounded-xl font-sans text-[13px] font-bold tracking-[0.05em] transition-all flex items-center justify-center gap-1.5 uppercase shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Clear All Data & Logs
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

      {/* Reminders Panel */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)] flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-outline-variant/20 pb-2">
          <Bell className="w-4 h-4 text-secondary animate-bounce" style={{ animationDuration: '3s' }} />
          <h3 className="font-sans text-[11px] font-bold tracking-[0.1em] text-primary uppercase">
            Active Reminders & Deadlines
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Resident Parking Permit Reminder */}
          <div className="flex gap-3 items-start bg-surface-container-low/40 p-3.5 rounded-xl border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5"></span>
            <div className="flex flex-col gap-0.5 text-[12px]">
              <span className="font-bold text-primary">Resident Parking Permit Renewal</span>
              {lease.parkingPermitValidTo ? (
                <p className="text-on-surface-variant leading-relaxed">
                  Your permit is valid until <span className="font-bold text-primary">{new Date(lease.parkingPermitValidTo).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>. Please apply for renewal before this date to prevent parking tickets.
                </p>
              ) : (
                <p className="text-on-surface-variant/60 italic leading-relaxed">
                  Expiration date not set. Enter your resident parking permit validity in the specification registry to activate renewal deadlines.
                </p>
              )}
            </div>
          </div>

          {/* First Hauptuntersuchung (TÜV) Reminder */}
          <div className="flex gap-3 items-start bg-surface-container-low/40 p-3.5 rounded-xl border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5"></span>
            <div className="flex flex-col gap-0.5 text-[12px]">
              <span className="font-bold text-primary">First Main Inspection (HU / TÜV)</span>
              {lease.firstRegistrationDate ? (
                (() => {
                  const tuvDate = new Date(lease.firstRegistrationDate);
                  tuvDate.setFullYear(tuvDate.getFullYear() + 3);
                  const formattedTuvDate = tuvDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                  return (
                    <p className="text-on-surface-variant leading-relaxed">
                      First main inspection (TÜV) is due on <span className="font-bold text-primary">{formattedTuvDate}</span> (36 months/3 years after the Erstzulassung).
                    </p>
                  );
                })()
              ) : (
                <p className="text-on-surface-variant/60 italic leading-relaxed">
                  First registration date not set. Enter your vehicle's Erstzulassung above to automatically calculate your first TÜV inspection due date.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

