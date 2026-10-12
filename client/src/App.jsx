import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BookAppointmentModal from './components/modals/BookAppointmentModal';
import QueueDisplayModal from './components/modals/QueueDisplayModal';
import PrintCardModal from './components/modals/PrintCardModal';
import DicomViewerModal from './components/modals/DicomViewerModal';

// Views
import AppointmentsView from './components/views/AppointmentsView';
import BillingView from './components/views/BillingView';
import InpatientBedMatrixView from './components/views/InpatientBedMatrixView';
import CoreMastersView from './components/views/CoreMastersView';
import SystemAdminRbacView from './components/views/SystemAdminRbacView';
import WorkOrdersView from './components/views/WorkOrdersView';
import ProfileSecurityView from './components/views/ProfileSecurityView';
import ClinicalSuiteView from './components/views/ClinicalSuiteView';
import DiagnosticsSuiteView from './components/views/DiagnosticsSuiteView';
import EmergencyTraumaView from './components/views/EmergencyTraumaView';
import SupplyChainView from './components/views/SupplyChainView';
import FrontDeskView from './components/views/FrontDeskView';
import FinanceInsuranceView from './components/views/FinanceInsuranceView';
import ExecutiveAnalyticsView from './components/views/ExecutiveAnalyticsView';

import { 
  APPOINTMENTS, 
  HOSPITAL_BRANCHES, 
  PATIENTS, 
  RADIOLOGY_STUDIES 
} from './data/mockData';
import { Search, X } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState('mod-3');
  const [appointmentsList, setAppointmentsList] = useState(APPOINTMENTS);
  const [currentBranch, setCurrentBranch] = useState(HOSPITAL_BRANCHES[0]);
  const [currentRole, setCurrentRole] = useState({ 
    id: 'cmo', 
    title: 'Chief Medical Officer (CMO)', 
    badge: 'Full Clinical & Ops' 
  });
  const [darkMode, setDarkMode] = useState(false);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isPrintCardOpen, setIsPrintCardOpen] = useState(false);
  const [selectedPatientForCard, setSelectedPatientForCard] = useState(PATIENTS[0]);
  const [isDicomModalOpen, setIsDicomModalOpen] = useState(false);
  const [selectedDicomStudy, setSelectedDicomStudy] = useState(RADIOLOGY_STUDIES[0]);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBookAppointmentSuccess = (newApt) => {
    setAppointmentsList([newApt, ...appointmentsList]);
  };

  const handleOpenPrintCard = (patient) => {
    setSelectedPatientForCard(patient);
    setIsPrintCardOpen(true);
  };

  const handleOpenDicomViewer = (study) => {
    setSelectedDicomStudy(study);
    setIsDicomModalOpen(true);
  };

  const renderActiveView = () => {
    switch (activeModule) {
      case 'mod-3':
        return (
          <AppointmentsView
            appointments={appointmentsList}
            onOpenBookModal={() => setIsBookModalOpen(true)}
            onOpenQueueDisplay={() => setIsQueueModalOpen(true)}
          />
        );
      case 'mod-4':
        return <BillingView />;
      case 'mod-17':
        return <InpatientBedMatrixView />;
      case 'mod-15':
        return <CoreMastersView />;
      case 'mod-29':
        return <SystemAdminRbacView />;
      case 'mod-30':
        return (
          <ProfileSecurityView
            currentBranch={currentBranch}
            onSelectBranch={setCurrentBranch}
            currentRole={currentRole}
            onSelectRole={setCurrentRole}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
        );
      case 'mod-31':
        return <WorkOrdersView />;
      case 'mod-6':
      case 'mod-12':
      case 'mod-21':
        return <ClinicalSuiteView />;
      case 'mod-19':
      case 'mod-27':
      case 'mod-5':
      case 'mod-10':
        return <DiagnosticsSuiteView onOpenDicomViewer={handleOpenDicomViewer} />;
      case 'mod-11':
      case 'mod-23':
      case 'mod-8':
        return <EmergencyTraumaView />;
      case 'mod-25':
      case 'mod-28':
      case 'mod-16':
      case 'mod-26':
      case 'mod-14':
      case 'mod-9':
      case 'mod-20':
        return <SupplyChainView />;
      case 'mod-24':
      case 'mod-22':
        return (
          <FrontDeskView
            onOpenPrintCard={handleOpenPrintCard}
            onOpenBookModal={() => setIsBookModalOpen(true)}
          />
        );
      case 'mod-7':
      case 'mod-13':
        return <FinanceInsuranceView />;
      case 'mod-32':
        return <ExecutiveAnalyticsView />;
      default:
        return (
          <AppointmentsView
            appointments={appointmentsList}
            onOpenBookModal={() => setIsBookModalOpen(true)}
            onOpenQueueDisplay={() => setIsQueueModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      {/* Enterprise Top Header */}
      <Header
        currentBranch={currentBranch}
        onSelectBranch={setCurrentBranch}
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        onOpenQueueDisplay={() => setIsQueueModalOpen(true)}
        onOpenBookAppointment={() => setIsBookModalOpen(true)}
        onSearchClick={() => setIsQuickSearchOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Workspace: Sidebar + Central Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Navigation Tree */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={setActiveModule}
        />

        {/* Dynamic Operational Screen Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Modals & Dialogs */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onBookSuccess={handleBookAppointmentSuccess}
      />

      <QueueDisplayModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
        appointments={appointmentsList}
      />

      <PrintCardModal
        isOpen={isPrintCardOpen}
        onClose={() => setIsPrintCardOpen(false)}
        patient={selectedPatientForCard}
      />

      <DicomViewerModal
        isOpen={isDicomModalOpen}
        onClose={() => setIsDicomModalOpen(false)}
        study={selectedDicomStudy}
      />

      {/* Quick Search Modal */}
      {isQuickSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search Patient UHID, Doctor, Admission, Invoice..."
                value={quickSearchQuery}
                onChange={e => setQuickSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white"
              />
              <button onClick={() => setIsQuickSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 text-xs max-h-80 overflow-y-auto space-y-1">
              <div className="p-2 text-slate-400 font-semibold uppercase text-[10px]">Suggested Matches</div>
              {PATIENTS.filter(p => p.full_name.toLowerCase().includes(quickSearchQuery.toLowerCase()) || p.uhid.toLowerCase().includes(quickSearchQuery.toLowerCase())).map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    handleOpenPrintCard(p);
                    setIsQuickSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{p.full_name}</span>
                    <span className="font-mono text-[11px] text-teal-600 ml-2">{p.uhid}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">View Patient Card</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
