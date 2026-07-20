/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LayoutGrid, PlusCircle, Activity, Car, Leaf, Github, Sun, Moon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { LeaseInfo, OdometerLog, TripLog, PurposeType } from './types';
import { DEFAULT_LEASE } from './data';

import StatusView from './components/StatusView';
import LogView from './components/LogView';
import StatsView from './components/StatsView';
import LeaseView from './components/LeaseView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('status');
  const [hoveredButton, setHoveredButton] = useState<'github' | 'theme' | 'update' | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mileage_tracker_theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Load state from local storage or fallback to defaults (starting empty of tracking logs)
  const [lease, setLease] = useState<LeaseInfo>(() => {
    const saved = localStorage.getItem('mileage_tracker_lease') || localStorage.getItem('zen_lease');
    return saved ? JSON.parse(saved) : DEFAULT_LEASE;
  });

  const [odometerLogs, setOdometerLogs] = useState<OdometerLog[]>(() => {
    const saved = localStorage.getItem('mileage_tracker_odometer_logs') || localStorage.getItem('zen_odometer_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tripLogs, setTripLogs] = useState<TripLog[]>(() => {
    const saved = localStorage.getItem('mileage_tracker_trip_logs') || localStorage.getItem('zen_trip_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Hardcoded specific GitHub profile information as requested
  const githubUsername = 'christineecker';
  const githubRepoUrl = 'https://github.com/christineecker/MileageTracker';

  // Theme Sync effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mileage_tracker_theme', theme);
  }, [theme]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('mileage_tracker_lease', JSON.stringify(lease));
  }, [lease]);

  useEffect(() => {
    localStorage.setItem('mileage_tracker_odometer_logs', JSON.stringify(odometerLogs));
  }, [odometerLogs]);

  useEffect(() => {
    localStorage.setItem('mileage_tracker_trip_logs', JSON.stringify(tripLogs));
  }, [tripLogs]);

  // Handlers
  const handleUpdateLease = (updatedLease: LeaseInfo) => {
    setLease(updatedLease);
  };

  const handleAddOdometerLog = (value: number, date: string) => {
    const newLog: OdometerLog = {
      id: `odo-${Date.now()}`,
      date,
      value,
      isMonthlyCheck: true,
    };
    setOdometerLogs(prev => [newLog, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleAddTripLog = (distance: number, purpose: PurposeType, destination: string, date: string) => {
    const newLog: TripLog = {
      id: `trip-${Date.now()}`,
      date,
      distance,
      purpose,
      destination,
    };
    
    // Add the trip log
    setTripLogs(prev => [newLog, ...prev]);

    // Automatically update the odometer log to make entries fully integrated
    // Get current odometer reading, add the trip distance, and append as a cumulative log
    const lastOdoValue = odometerLogs.length > 0 
      ? [...odometerLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].value 
      : lease.initialOdometer;
    
    const newOdoValue = Math.round((lastOdoValue + distance) * 10) / 10;
    
    // Create new odometer checkpoint matching the trip log date
    const newOdoLog: OdometerLog = {
      id: `odo-auto-${Date.now()}`,
      date,
      value: newOdoValue,
      isMonthlyCheck: false,
    };
    setOdometerLogs(prev => [newOdoLog, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteOdometerLog = (id: string) => {
    setOdometerLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleUpdateOdometerLog = (id: string, value: number, date: string) => {
    setOdometerLogs(prev => prev.map(log => log.id === id ? { ...log, value, date } : log).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDeleteTripLog = (id: string) => {
    setTripLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleResetAllData = () => {
    localStorage.removeItem('mileage_tracker_odometer_logs');
    localStorage.removeItem('zen_odometer_logs');
    localStorage.removeItem('mileage_tracker_trip_logs');
    localStorage.removeItem('zen_trip_logs');
    setOdometerLogs([]);
    setTripLogs([]);
  };

  // Tab switching renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'status':
        return (
          <StatusView 
            lease={lease} 
            odometerLogs={odometerLogs} 
            tripLogs={tripLogs} 
            onNavigate={setActiveTab} 
          />
        );
      case 'log':
        return (
          <LogView
            lease={lease}
            odometerLogs={odometerLogs}
            tripLogs={tripLogs}
            onAddOdometerLog={handleAddOdometerLog}
            onAddTripLog={handleAddTripLog}
            onDeleteOdometerLog={handleDeleteOdometerLog}
            onUpdateOdometerLog={handleUpdateOdometerLog}
            onDeleteTripLog={handleDeleteTripLog}
          />
        );
      case 'stats':
        return (
          <StatsView 
            lease={lease} 
            odometerLogs={odometerLogs} 
            tripLogs={tripLogs} 
            onNavigate={setActiveTab} 
          />
        );
      case 'lease':
        return (
          <LeaseView 
            lease={lease} 
            onUpdateLease={handleUpdateLease} 
            onResetAllData={handleResetAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom,0px))] relative max-w-md mx-auto w-full border-x border-surface-container-high/40 shadow-2xl">
      
      {/* Top App Bar */}
      <header className="bg-background/90 backdrop-blur-md sticky top-0 z-40 w-full flex justify-between items-center px-6 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-4 border-b border-surface-container-high/20">
        <div 
          onClick={() => setActiveTab('status')}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer select-none"
        >
          <Car className="w-5 h-5 text-secondary" />
          <h1 className="font-sans text-[20px] font-medium tracking-tighter text-primary">
            MileageTracker
          </h1>
        </div>
        
        {/* Top actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              onMouseEnter={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                  setHoveredButton('theme');
                }
              }}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4.5 h-4.5" />
              ) : (
                <Sun className="w-4.5 h-4.5" />
              )}
            </button>
            <AnimatePresence>
              {hoveredButton === 'theme' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-11 z-50 bg-neutral-900 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-white/10"
                >
                  Switch to {theme === 'light' ? 'dark' : 'light'} design mode
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              onMouseEnter={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                  setHoveredButton('update');
                }
              }}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-primary transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              aria-label="Refresh and Update App"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <AnimatePresence>
              {hoveredButton === 'update' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-11 z-50 bg-neutral-900 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-white/10"
                >
                  Reload and check for updates
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <a 
              href={githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => {
                if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
                  setHoveredButton('github');
                }
              }}
              onMouseLeave={() => setHoveredButton(null)}
              className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant/70 hover:text-primary transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="GitHub Repository"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
            <AnimatePresence>
              {hoveredButton === 'github' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-11 z-50 bg-neutral-900 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-white/10"
                >
                  View source code on GitHub
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content View Container with smooth tab transition animations */}
      <main className="flex-1 w-full pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Floating Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] px-6 border-t border-surface-container shadow-lg max-w-md mx-auto rounded-t-3xl flex justify-around items-center">
        {/* Lease Tab */}
        <button
          onClick={() => setActiveTab('lease')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'lease'
              ? 'text-secondary bg-secondary-container/20 font-bold scale-100'
              : 'text-on-surface-variant/60 hover:text-on-surface hover:opacity-100 scale-95'
          }`}
        >
          <Car className="w-5 h-5" />
          <span className="font-sans text-[10px] font-bold tracking-[0.05em] uppercase">
            Lease
          </span>
        </button>

        {/* Log Tab */}
        <button
          onClick={() => setActiveTab('log')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'log'
              ? 'text-secondary bg-secondary-container/20 font-bold scale-100'
              : 'text-on-surface-variant/60 hover:text-on-surface hover:opacity-100 scale-95'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-sans text-[10px] font-bold tracking-[0.05em] uppercase">
            Log
          </span>
        </button>

        {/* Status Tab */}
        <button
          onClick={() => setActiveTab('status')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'status'
              ? 'text-secondary bg-secondary-container/20 font-bold scale-100'
              : 'text-on-surface-variant/60 hover:text-on-surface hover:opacity-100 scale-95'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="font-sans text-[10px] font-bold tracking-[0.05em] uppercase">
            Status
          </span>
        </button>

        {/* Stats Tab (Renamed to Analytics) */}
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all duration-300 ${
            activeTab === 'stats'
              ? 'text-secondary bg-secondary-container/20 font-bold scale-100'
              : 'text-on-surface-variant/60 hover:text-on-surface hover:opacity-100 scale-95'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="font-sans text-[10px] font-bold tracking-[0.05em] uppercase">
            Analytics
          </span>
        </button>
      </nav>

    </div>
  );
}
