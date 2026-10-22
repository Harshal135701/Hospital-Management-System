import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { ClinicalsView } from './components/clinicals/ClinicalsView';
import { BillingView } from './components/billing/BillingView';
import { CreditBillingView } from './components/credit-billing/CreditBillingView';
import { BloodBankView } from './components/bloodbank/BloodBankView';
import { DoctorsView } from './components/doctors/DoctorsView';
import { WardsView } from './components/wards/WardsView';
import { DayCareView } from './components/daycare/DayCareView';
import { DietView } from './components/diet/DietView';
import { EmrView } from './components/emr/EmrView';
import { EmbryologyView } from './components/embryology/EmbryologyView';
import { EmergencyView } from './components/emergency/EmergencyView';
import { SubmodulesView } from './components/appointments/SubmodulesView';
import { SUBMODULES } from './components/appointments/submoduleRegistry';
import { PlaceholderView } from './components/common/PlaceholderView';
import {
  Building2,
  FlaskConical,
  FileText,
  Settings,
} from 'lucide-react';

export function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const renderCurrentView = () => {
    const routeBase = typeof currentRoute === 'string' ? currentRoute.split(':')[0] : currentRoute;
    const routeSubtab = typeof currentRoute === 'string' && currentRoute.includes(':')
      ? currentRoute.slice(currentRoute.indexOf(':') + 1)
      : null;

    switch (routeBase) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;

      case 'patients':
        return <PatientsView />;

      case 'appointments':
        return <AppointmentsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'billing':
        return <BillingView initialSubtab={routeSubtab || '4.1'} onNavigate={setCurrentRoute} />;

      case 'credit-billing':
      case 'insurance':
        return <CreditBillingView initialSubtab={routeSubtab || '7.1'} onNavigate={setCurrentRoute} />;

      case 'clinical':
        return <ClinicalsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'bloodbank':
        return <BloodBankView />;

      case 'daycare':
        return <DayCareView initialSubtab={routeSubtab || '8.1'} onNavigate={setCurrentRoute} />;

      case 'dietary':
      case 'diet':
        return <DietView initialSubtab={routeSubtab || '9.1'} onNavigate={setCurrentRoute} />;

      case 'emr':
        return <EmrView initialSubtab={routeSubtab || '12.1'} onNavigate={setCurrentRoute} />;

      case 'embryology':
      case 'ivf':
        return <EmbryologyView initialSubtab={routeSubtab || 'overview'} onNavigate={setCurrentRoute} />;

      case 'emergency':
        return <EmergencyView initialSubtab={routeSubtab || '11.1'} onNavigate={setCurrentRoute} />;

      case 'submodule': {
        if (routeSubtab && (routeSubtab.startsWith('1.') || routeSubtab.startsWith('2.') || routeSubtab.startsWith('4.'))) {
          return <BillingView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('7.')) {
          return <CreditBillingView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('8.')) {
          return <DayCareView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('9.')) {
          return <DietView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('10.') || routeSubtab === '10.0')) {
          return <EmbryologyView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('11.')) {
          return <EmergencyView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('12.')) {
          return <EmrView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        const sub = SUBMODULES.find(s => s.id === routeSubtab) || SUBMODULES[0];
        return (
          <SubmodulesView
            submodule={sub}
            onBack={() => setCurrentRoute('dashboard')}
            onNavigateSubmodule={(id) => setCurrentRoute(`submodule:${id}`)}
          />
        );
      }

      case 'doctors':
        return (
          <DoctorsView
            onBack={() => setCurrentRoute('dashboard')}
            onNavigate={setCurrentRoute}
          />
        );

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
        return (
          <WardsView
            onBack={() => setCurrentRoute('dashboard')}
            onNavigate={setCurrentRoute}
          />
        );

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
    <AuthProvider>
      <AppShell
        currentRoute={currentRoute}
        onNavigate={setCurrentRoute}
      >
        {renderCurrentView()}
      </AppShell>

      <LoginModal />
    </AuthProvider>
  );
}

export default App;
