import React, { useState, useMemo } from 'react';
import { History, Check, Trash2, Calendar, Pencil } from 'lucide-react';
import { OdometerLog, LeaseInfo } from '../types';

interface LogViewProps {
  lease: LeaseInfo;
  odometerLogs: OdometerLog[];
  tripLogs: any[]; // Kept in signature for compatibility
  onAddOdometerLog: (value: number, date: string) => void;
  onAddTripLog?: any; // Kept in signature for compatibility
  onDeleteOdometerLog: (id: string) => void;
  onUpdateOdometerLog?: (id: string, value: number, date: string) => void;
  onDeleteTripLog?: any; // Kept in signature for compatibility
}

export default function LogView({
  lease,
  odometerLogs,
  onAddOdometerLog,
  onDeleteOdometerLog,
  onUpdateOdometerLog,
}: LogViewProps) {
  // Odometer states
  const [odometerInput, setOdometerInput] = useState<string>('');
  const [odometerDate, setOdometerDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [odometerSuccess, setOdometerSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Editing state for checkpoints
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  const handleStartEdit = (log: OdometerLog) => {
    setEditingId(log.id);
    setEditValue(log.value.toString());
    setEditDate(log.date);
  };

  const handleSaveEdit = (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val <= 0) return;
    if (onUpdateOdometerLog) {
      onUpdateOdometerLog(id, val, editDate);
    }
    setEditingId(null);
  };

  // Current Odometer: get the sum of all odometer logs once data is entered, otherwise lease.initialOdometer
  const currentOdometer = useMemo(() => {
    if (odometerLogs.length === 0) return lease.initialOdometer;
    return odometerLogs.reduce((acc, log) => acc + log.value, 0);
  }, [odometerLogs, lease]);

  // Odometer reading calculations
  const lastOdometerLog = useMemo(() => {
    if (odometerLogs.length === 0) return null;
    const sorted = [...odometerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0];
  }, [odometerLogs]);

  const formattedLastLogDate = useMemo(() => {
    if (!lastOdometerLog) return 'No entries';
    const date = new Date(lastOdometerLog.date);
    return `${lastOdometerLog.value.toLocaleString()} km on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }, [lastOdometerLog]);

  // Numpad handlers for Odometer Log
  const handleNumpadClick = (val: string) => {
    setErrorMsg('');
    if (val === '.') {
      if (odometerInput.includes('.')) return;
      if (odometerInput === '') {
        setOdometerInput('0.');
        return;
      }
    }
    if (odometerInput.length >= 8) return;
    setOdometerInput(prev => prev + val);
  };

  const handleBackspace = () => {
    setErrorMsg('');
    setOdometerInput(prev => prev.slice(0, -1));
  };

  const handleConfirmOdometer = () => {
    const val = parseFloat(odometerInput);
    if (isNaN(val) || val <= 0) return;

    onAddOdometerLog(val, odometerDate);
    
    setOdometerSuccess(true);
    setOdometerInput('');
    setErrorMsg('');
    setTimeout(() => {
      setOdometerSuccess(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col items-center px-6 pb-16 max-w-md mx-auto w-full animate-fade-in">
      {/* Title Section */}
      <section className="w-full text-center mb-6">
        <h2 className="font-sans text-[24px] font-medium tracking-tight text-on-surface mb-2">
          Readings [KM]
        </h2>
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant">
          <History className="w-4 h-4 mr-2 text-on-surface-variant" />
          <p className="font-sans text-[13px]">
            Last log: {formattedLastLogDate}
          </p>
        </div>
      </section>

      {/* Input Section */}
      <section className="w-full mb-4 flex flex-col gap-4">
        <div className="flex flex-col items-center justify-center p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)]">
          <span className="font-sans text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase mb-2">
            CURRENT READING (KM)
          </span>
          <div className="font-sans text-[42px] font-medium text-primary tracking-tight">
            {odometerInput || <span>{currentOdometer.toLocaleString()}</span>}
          </div>
        </div>

        {/* Elegant Date Picker */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-[0_4px_40px_-12px_rgba(0,0,0,0.03)] flex flex-col gap-2">
          <label className="font-sans text-[11px] font-bold tracking-[0.1em] text-on-surface-variant uppercase flex items-center gap-1.5">
            <Calendar className="w-4.5 h-4.5 text-on-surface-variant" />
            Log Date / Month
          </label>
          <input
            type="date"
            value={odometerDate}
            onChange={(e) => {
              setErrorMsg('');
              setOdometerDate(e.target.value);
            }}
            className="w-full px-4 py-3 bg-surface-container-low border-none rounded-xl font-sans text-[14px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </section>

      {/* Inline Error Message */}
      {errorMsg && (
        <div className="w-full mb-4 p-3.5 bg-error-container/20 border border-error/20 text-error font-sans text-[12px] font-medium rounded-xl leading-relaxed text-center animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Custom Numpad */}
      <section className="w-full grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleNumpadClick(num.toString())}
            className="h-16 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-[20px] font-medium text-on-surface shadow-sm"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleNumpadClick('.')}
          className="h-16 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-[20px] font-medium text-on-surface shadow-sm"
        >
          .
        </button>
        <button
          onClick={() => handleNumpadClick('0')}
          className="h-16 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-[20px] font-medium text-on-surface shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleBackspace}
          className="h-16 flex items-center justify-center rounded-xl bg-surface-container hover:bg-surface-container-high active:bg-surface-container-highest transition-colors text-on-surface shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </section>

      {/* Action Button */}
      <button
        onClick={handleConfirmOdometer}
        disabled={!odometerInput || odometerSuccess}
        className={`w-full py-4 rounded-full font-sans font-medium text-[16px] shadow-sm transition-all duration-300 ${
          odometerSuccess
            ? 'bg-secondary text-on-secondary cursor-default'
            : odometerInput
            ? 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98]'
            : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed'
        }`}
      >
        {odometerSuccess ? (
          <span className="flex items-center justify-center gap-2">
            <Check className="w-5 h-5" /> Logged Successfully
          </span>
        ) : (
          'Confirm Odometer Log'
        )}
      </button>

      {/* History Log Table */}
      <section className="w-full mt-10">
        <h3 className="font-sans text-[12px] font-bold tracking-[0.1em] text-on-surface-variant uppercase mb-4">
          RECENT ODOMETER CHECKPOINTS
        </h3>
        <div className="flex flex-col gap-3">
          {odometerLogs.slice(0, 10).map(log => {
            const isEditing = editingId === log.id;
            return (
              <div 
                key={log.id} 
                className={`flex flex-col gap-3 bg-surface-container-lowest px-4 py-3 rounded-xl border border-outline-variant/20 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.01)] animate-fade-in ${
                  isEditing ? 'ring-1 ring-primary/30 border-primary/20' : ''
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-[0.05em] text-primary uppercase">
                        Edit Checkpoint
                      </span>
                      <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold">
                        {log.isMonthlyCheck ? 'Checkpoint' : 'Auto'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                          Odometer (km)
                        </label>
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold tracking-[0.05em] text-on-surface-variant uppercase">
                          Log Date
                        </label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-3 py-2 bg-surface-container-low border-none rounded-lg font-sans text-[13px] text-primary focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-[11px] font-medium text-on-surface-variant/80 hover:text-primary rounded-lg hover:bg-surface-container transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(log.id)}
                        className="px-3 py-1.5 text-[11px] font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <p className="font-sans text-[14px] font-medium text-primary">
                        {log.value.toLocaleString()} km
                      </p>
                      <p className="font-sans text-[11px] text-on-surface-variant">
                        {new Date(log.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-surface-container text-[10px] font-bold tracking-[0.05em] text-on-surface-variant rounded-full uppercase mr-1">
                        {log.isMonthlyCheck ? 'Checkpoint' : 'Auto'}
                      </span>
                      <button 
                        onClick={() => handleStartEdit(log)}
                        className="text-on-surface-variant/40 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-surface-container"
                        title="Edit entry"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => onDeleteOdometerLog(log.id)}
                        className="text-on-surface-variant/40 hover:text-error transition-colors p-1.5 rounded-lg hover:bg-surface-container"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {odometerLogs.length === 0 && (
            <p className="font-sans text-[12px] text-on-surface-variant/60 text-center italic py-4">
              No recent checkpoints found. Use the numpad above to make an entry.
            </p>
          )}
        </div>
      </section>

      {/* Subtle Note */}
      <p className="mt-8 text-center font-sans text-[12px] text-on-surface-variant italic">
        Entries are synced to your digital fleet record.
      </p>
    </div>
  );
}
