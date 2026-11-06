import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GradingTableModal from './components/GradingTableModal';
import Home from './pages/Home';
import SGPACalculator from './pages/SGPACalculator';
import CGPACalculator from './pages/CGPACalculator';
import PercentageCalculator from './pages/PercentageCalculator';
import ReportsHistory from './pages/ReportsHistory';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSavedReportAlert = () => {
    setSavedNotification(true);
    setTimeout(() => {
      setSavedNotification(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenGradingModal={() => setIsGradingModalOpen(true)}
      />

      {/* Floating Save Notification */}
      {savedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></div>
          <div>
            <p className="text-xs font-bold">Calculation Saved!</p>
            <p className="text-[11px] text-emerald-100">View anytime in Saved Reports.</p>
          </div>
          <button
            onClick={() => {
              setActivePage('history');
              setSavedNotification(false);
            }}
            className="ml-2 text-xs underline font-bold hover:text-emerald-200"
          >
            View
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activePage === 'home' && (
          <Home
            setActivePage={setActivePage}
            onOpenGradingModal={() => setIsGradingModalOpen(true)}
          />
        )}
        {activePage === 'sgpa' && (
          <SGPACalculator onSavedReportAlert={handleSavedReportAlert} />
        )}
        {activePage === 'cgpa' && (
          <CGPACalculator onSavedReportAlert={handleSavedReportAlert} />
        )}
        {activePage === 'percentage' && (
          <PercentageCalculator />
        )}
        {activePage === 'history' && (
          <ReportsHistory setActivePage={setActivePage} />
        )}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* VTU 10-Point CBCS Scale Modal */}
      <GradingTableModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
      />

    </div>
  );
}

