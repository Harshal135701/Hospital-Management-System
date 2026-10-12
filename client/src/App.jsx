import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView, AppointmentsView } from './components/patients/PatientsView';
import { BloodBankView } from './components/bloodbank/BloodBankView';
import { DoctorsView } from './components/doctors/DoctorsView';
import { WardsView } from './components/wards/WardsView';
import { PlaceholderView } from './components/common/PlaceholderView';
import {
  UserCheck,
  Building2,
  Bed,
  FlaskConical,
  FileText,
  Settings
} from 'lucide-react';

export function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const renderCurrentView = () => {
    switch (currentRoute) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;
      case 'patients':
        return <PatientsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'bloodbank':
        return <BloodBankView />;
      case 'doctors':
        return <DoctorsView onBack={() => setCurrentRoute('dashboard')} onNavigate={setCurrentRoute} />;
      case 'departments':
        return (
          <PlaceholderView
            title="Hospital Departments & Clinical Wings"
            subtitle="Organization of clinical disciplines, outpatient departments, and ICU wings."
            icon={Building2}
            imageKey="hospitalReception"
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'rooms':
        return <WardsView onBack={() => setCurrentRoute('dashboard')} onNavigate={setCurrentRoute} />;
      case 'lab':
        return (
          <PlaceholderView
            title="Diagnostic Laboratory & Pathology"
            subtitle="Phlebotomy collection tubes, biochemical analyzers, and diagnostic reporting workbenches."
            icon={FlaskConical}
            imageKey="diagnosticLab"
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'reports':
        return (
          <PlaceholderView
            title="Clinical Audit Logs & Reports"
            subtitle="Immutable audit trail of component movements, patient transfers, and system actions."
            icon={FileText}
            imageKey="nurseCare"
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      case 'settings':
        return (
          <PlaceholderView
            title="Hospital System Configuration"
            subtitle="Tenant management, electronic signature policies, and clinical threshold settings."
            icon={Settings}
            imageKey="surgeonStaff"
            onBack={() => setCurrentRoute('dashboard')}
          />
        );
      default:
        return <DashboardView onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <AppShell currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderCurrentView()}
    </AppShell>
  );
}

export default App;
