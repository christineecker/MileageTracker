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

      {/* NEW SECTION: App Launcher & PWA Customizer */}
      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)] flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-secondary" />
          <h3 className="font-sans text-[15px] font-bold tracking-[0.05em] text-primary uppercase">
            Launcher Icon & Home Screen
          </h3>
        </div>

        <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed">
          Your MileageTracker is designed as an offline-first progressive web application (PWA). It fits perfectly on an iPhone screen, dynamically adjusting padding around the top notch and bottom home indicator.
        </p>

        {/* Dynamic Icon Customizer / Selector */}
        <div className="flex flex-col gap-4 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/10">
          <span className="text-[10px] font-bold text-on-surface-variant/85 uppercase tracking-[0.05em] block">
            Select App Tile Alternative
          </span>
          
          <AppIconCustomizer />
        </div>

        {/* Implementation guides */}
        <div className="border-t border-outline-variant/20 pt-4 flex flex-col gap-4">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.05em] block">
            PWA Configuration & Setup Guide
          </span>

          <div className="flex flex-col gap-3 text-[12px] text-on-surface-variant">
            {/* Step 1: iPhone setup */}
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-secondary-container/35 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                1
              </span>
              <div>
                <h5 className="font-bold text-primary">Safari "Add to Home Screen"</h5>
                <p className="text-[11.5px] text-on-surface-variant/90 leading-relaxed mt-0.5">
                  Open your published live application in **Safari on iOS**. Tap the **Share button** at the bottom of Safari, scroll down, and select **"Add to Home Screen"** for a seamless, distraction-free, app-like native workspace experience with responsive, touch-friendly navigation.
                </p>
              </div>
            </div>

            {/* Step 2: GitHub Pages issue */}
            <div className="flex gap-2.5 items-start">
              <span className="w-5 h-5 rounded-full bg-secondary-container/35 text-secondary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                2
              </span>
              <div>
                <h5 className="font-bold text-primary">Fixing "No GitHub Page Site"</h5>
                <p className="text-[11.5px] text-on-surface-variant/90 leading-relaxed mt-0.5">
                  If iOS says there isn't a GitHub Page, please ensure that you have **enabled GitHub Pages** on your repository:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-on-surface-variant/80 mt-1.5 space-y-1 pl-1">
                  <li>Go to your GitHub Repository **Settings** tab.</li>
                  <li>In the sidebar, click on **Pages**.</li>
                  <li>Under Build & Deployment, select Source: **GitHub Actions**.</li>
                  <li>Run the workflow in your repository's **Actions** tab to build and host the app at your custom subfolder URL.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Interactive Subcomponent for App Icon Choices and Live Mockup Render
function AppIconCustomizer() {
  const [selectedIcon, setSelectedIcon] = useState<'slate' | 'zen' | 'vector'>('slate');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Raw SVG codes for download
  const iconSVGs = {
    slate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#181e1a" />
  <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256 C 230 332, 156 332, 156 256 Z" fill="none" stroke="#4a654e" stroke-width="24" stroke-linecap="round" opacity="0.3" />
  <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" />
  <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256" fill="none" stroke="#181e1a" stroke-width="3" stroke-dasharray="10 8" />
</svg>`,
    zen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#f9f9f8" />
  <circle cx="256" cy="256" r="160" fill="none" stroke="#e6e6e2" stroke-width="12" />
  <path d="M 142 370 A 160 160 0 1 1 370 370" fill="none" stroke="#4a654e" stroke-width="16" stroke-linecap="round" />
  <line x1="256" y1="256" x2="330" y2="182" stroke="#d4a373" stroke-width="10" stroke-linecap="round" />
  <circle cx="256" cy="256" r="24" fill="#4a654e" />
  <circle cx="256" cy="256" r="10" fill="#f9f9f8" />
</svg>`,
    vector: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="128" fill="#0f1110" />
  <circle cx="256" cy="256" r="180" fill="none" stroke="#1c2c21" stroke-width="4" />
  <circle cx="256" cy="256" r="140" fill="none" stroke="#4a654e" stroke-width="8" stroke-dasharray="12 10" opacity="0.6" />
  <path d="M 120 280 C 150 280, 160 270, 180 240 C 210 200, 240 180, 290 180 C 330 180, 350 200, 370 230 C 390 260, 400 270, 420 275 L 420 300 C 420 305, 415 310, 410 310 L 110 310 Z" fill="#ffffff" />
  <circle cx="170" cy="310" r="22" fill="#0f1110" stroke="#4a654e" stroke-width="6" />
  <circle cx="340" cy="310" r="22" fill="#0f1110" stroke="#4a654e" stroke-width="6" />
  <circle cx="170" cy="310" r="6" fill="#ffffff" />
  <circle cx="340" cy="310" r="6" fill="#ffffff" />
</svg>`
  };

  const handleDownloadSVG = () => {
    const element = document.createElement("a");
    const file = new Blob([iconSVGs[selectedIcon]], { type: 'image/svg+xml' });
    element.href = URL.createObjectURL(file);
    element.download = "icon.svg";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Visual selectors */}
      <div className="grid grid-cols-3 gap-3">
        {/* Slate loop */}
        <button
          onClick={() => setSelectedIcon('slate')}
          className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
            selectedIcon === 'slate' 
              ? 'bg-secondary-container/10 border-secondary ring-1 ring-secondary' 
              : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant'
          }`}
        >
          <div className="w-11 h-11 bg-[#181e1a] rounded-xl flex items-center justify-center p-1.5 shadow-md">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256 C 230 332, 156 332, 156 256 Z" fill="none" stroke="#4a654e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
              <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-primary">Slate Loop</span>
        </button>

        {/* Zen Gauge */}
        <button
          onClick={() => setSelectedIcon('zen')}
          className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
            selectedIcon === 'zen' 
              ? 'bg-secondary-container/10 border-secondary ring-1 ring-secondary' 
              : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant'
          }`}
        >
          <div className="w-11 h-11 bg-[#f9f9f8] rounded-xl flex items-center justify-center p-1.5 shadow-md border border-outline-variant/10">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <circle cx="256" cy="256" r="160" fill="none" stroke="#e6e6e2" strokeWidth="16" />
              <path d="M 142 370 A 160 160 0 1 1 370 370" fill="none" stroke="#4a654e" strokeWidth="20" strokeLinecap="round" />
              <line x1="256" y1="256" x2="330" y2="182" stroke="#d4a373" strokeWidth="15" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-primary">Zen Gauge</span>
        </button>

        {/* Sleek Vector */}
        <button
          onClick={() => setSelectedIcon('vector')}
          className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer ${
            selectedIcon === 'vector' 
              ? 'bg-secondary-container/10 border-secondary ring-1 ring-secondary' 
              : 'bg-surface-container-lowest border-outline-variant/10 hover:border-outline-variant'
          }`}
        >
          <div className="w-11 h-11 bg-[#0f1110] rounded-xl flex items-center justify-center p-1.5 shadow-md">
            <svg viewBox="0 0 512 512" className="w-full h-full">
              <circle cx="256" cy="256" r="140" fill="none" stroke="#4a654e" strokeWidth="16" strokeDasharray="12 10" opacity="0.6" />
              <path d="M 120 280 C 150 280, 160 270, 180 240 C 210 200, 240 180, 290 180 C 330 180, 350 200, 370 230 C 390 260, 400 270, 420 275 Z" fill="#ffffff" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-primary">Sleek Vector</span>
        </button>
      </div>

      {/* Simulated iPhone Home Screen Preview Mockup */}
      <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5 relative shadow-inner flex flex-col items-center overflow-hidden h-44">
        {/* Status indicator pill (iPhone Dynamic Island) */}
        <div className="w-20 h-4.5 bg-black rounded-full mb-3 border border-white/5 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full absolute left-[45%]"></div>
        </div>

        {/* App Dock with floating icons on background desktop wallpaper */}
        <div className="flex gap-4 items-center justify-center mt-3 scale-[0.95]">
          {/* Mock App 1 */}
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-10 h-10 bg-blue-500 rounded-[22%] shadow-sm"></div>
            <span className="text-[7.5px] font-medium text-white/75">Mail</span>
          </div>

          {/* Active app icon alternative */}
          <div className="flex flex-col items-center gap-1.5 relative">
            <div className="w-12 h-12 rounded-[22%] shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden transform scale-105 active:scale-98 transition-transform">
              {selectedIcon === 'slate' && (
                <div className="w-full h-full bg-[#181e1a] p-1.5">
                  <svg viewBox="0 0 512 512" className="w-full h-full">
                    <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256 C 230 332, 156 332, 156 256 Z" fill="none" stroke="#4a654e" strokeWidth="24" strokeLinecap="round" opacity="0.3" />
                    <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
                    <path d="M 156 256 C 156 180, 230 180, 256 256 C 282 332, 356 332, 356 256 C 356 180, 282 180, 256 256" fill="none" stroke="#181e1a" strokeWidth="3" strokeDasharray="10 8" />
                  </svg>
                </div>
              )}
              {selectedIcon === 'zen' && (
                <div className="w-full h-full bg-[#f9f9f8] p-1.5">
                  <svg viewBox="0 0 512 512" className="w-full h-full">
                    <circle cx="256" cy="256" r="160" fill="none" stroke="#e6e6e2" strokeWidth="12" />
                    <path d="M 142 370 A 160 160 0 1 1 370 370" fill="none" stroke="#4a654e" strokeWidth="16" strokeLinecap="round" />
                    <line x1="256" y1="256" x2="330" y2="182" stroke="#d4a373" strokeWidth="10" strokeLinecap="round" />
                    <circle cx="256" cy="256" r="24" fill="#4a654e" />
                    <circle cx="256" cy="256" r="10" fill="#f9f9f8" />
                  </svg>
                </div>
              )}
              {selectedIcon === 'vector' && (
                <div className="w-full h-full bg-[#0f1110] p-1.5">
                  <svg viewBox="0 0 512 512" className="w-full h-full">
                    <circle cx="256" cy="256" r="180" fill="none" stroke="#1c2c21" strokeWidth="4" />
                    <circle cx="256" cy="256" r="140" fill="none" stroke="#4a654e" strokeWidth="8" strokeDasharray="12 10" opacity="0.6" />
                    <path d="M 120 280 C 150 280, 160 270, 180 240 C 210 200, 240 180, 290 180 C 330 180, 350 200, 370 230 C 390 260, 400 270, 420 275 L 420 300 C 420 305, 415 310, 410 310 L 110 310 Z" fill="#ffffff" />
                    <circle cx="170" cy="310" r="22" fill="#0f1110" stroke="#4a654e" strokeWidth="6" />
                    <circle cx="340" cy="310" r="22" fill="#0f1110" stroke="#4a654e" strokeWidth="6" />
                    <circle cx="170" cy="310" r="6" fill="#ffffff" />
                    <circle cx="340" cy="310" r="6" fill="#ffffff" />
                  </svg>
                </div>
              )}
            </div>
            {/* Pulsing indicator of home icon */}
            <span className="text-[8.5px] font-bold text-white tracking-wide">Mileage</span>
          </div>

          {/* Mock App 2 */}
          <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-10 h-10 bg-indigo-600 rounded-[22%] shadow-sm"></div>
            <span className="text-[7.5px] font-medium text-white/75">Maps</span>
          </div>
        </div>
      </div>

      {/* Button to download the selected SVG icon */}
      <button
        onClick={handleDownloadSVG}
        className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high active:scale-95 text-primary rounded-xl font-sans text-[11px] font-bold tracking-[0.05em] transition-all flex items-center justify-center gap-2 uppercase border border-outline-variant/10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-secondary">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download {selectedIcon.toUpperCase()} icon.svg code
      </button>

      {downloadSuccess && (
        <div className="p-2 bg-secondary/15 border border-secondary/20 rounded-lg text-center font-sans text-[11px] text-secondary font-semibold animate-fade-in">
          SVG successfully compiled and dispatched for download.
        </div>
      )}
    </div>
  );
}

