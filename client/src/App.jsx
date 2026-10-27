import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HospitalStateProvider } from './context/HospitalStateContext';
import { LoginModal } from './components/auth/LoginModal';
import { LoginPage } from './components/auth/LoginPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/dashboard/DashboardView';
import { PatientsView } from './components/patients/PatientsView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { PurchaseView } from './components/purchase/PurchaseView';
import { AppointmentsView } from './components/appointments/AppointmentsView';
import { ClinicalsView } from './components/clinicals/ClinicalsView';
import { BillingView } from './components/billing/BillingView';
import { CreditBillingView } from './components/credit-billing/CreditBillingView';
import { BloodBankView } from './components/bloodbank/BloodBankView';
import { DoctorsView } from './components/doctors/DoctorsView';
import { DepartmentsView } from './components/departments/DepartmentsView';
import { WardsView } from './components/wards/WardsView';
import { DayCareView } from './components/daycare/DayCareView';
import { DietView } from './components/diet/DietView';
import { EmrView } from './components/emr/EmrView';
import { EmbryologyView } from './components/embryology/EmbryologyView';
import { EmergencyView } from './components/emergency/EmergencyView';
import { OperationTheatreView } from './components/ot/OperationTheatreView';
import { FinanceView } from './components/finance/FinanceView';
import { FixedAssetView } from './components/fixed-asset/FixedAssetView';
import { GeneralView } from './components/general/GeneralView';
import { InventoryView } from './components/inventory/InventoryView';
import { IpdView } from './components/ipd/IpdView';
import { IvfView } from './components/ivf/IvfView';
import { LaboratoryView } from './components/laboratory/LaboratoryView';
import { MrdView } from './components/mrd/MrdView';
import { NursingView } from './components/nursing/NursingView';
import { OpdView } from './components/opd/OpdView';
import { SubmodulesView } from './components/appointments/SubmodulesView';
import { RadiologyView } from './components/radiology/RadiologyView';
import { SUBMODULES } from './components/appointments/submoduleRegistry';
import { PlaceholderView } from './components/common/PlaceholderView';
import {
  Building2,
  FlaskConical,
  FileText,
  Settings,
} from 'lucide-react';

const NAVIGATION_STORAGE_KEY = 'medicsprime_active_route';

const VALID_ROUTE_BASES = new Set([
  'dashboard',
  'patients',
  'pharmacy',
  'purchase',
  'appointments',
  'radiology',
  'billing',
  'credit-billing',
  'insurance',
  'clinical',
  'bloodbank',
  'daycare',
  'dietary',
  'diet',
  'emr',
  'embryology',
  'ivf',
  'laboratory',
  'mrd',
  'nursing',
  'opd',
  'emergency',
  'ot',
  'finance',
  'submodule',
  'doctors',
  'departments',
  'rooms',
  'lab',
  'fixed-asset',
  'general',
  'inventory',
  'ipd',
  'reports',
  'settings',
  'login'
]);

const DEFAULT_ROUTE = 'dashboard';

function getInitialRoute() {
  if (typeof window === 'undefined') return DEFAULT_ROUTE;
  try {
    const saved = window.sessionStorage?.getItem(NAVIGATION_STORAGE_KEY) ||
      window.localStorage?.getItem(NAVIGATION_STORAGE_KEY);
    if (saved && typeof saved === 'string') {
      const base = saved.split(':')[0];
      if (VALID_ROUTE_BASES.has(base)) {
        return saved;
      }
    }
  } catch (e) {
    console.warn('[Navigation] Could not read persisted route:', e);
  }
  return DEFAULT_ROUTE;
}

export function App() {
  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const base = typeof currentRoute === 'string' ? currentRoute.split(':')[0] : '';
      if (VALID_ROUTE_BASES.has(base)) {
        window.sessionStorage?.setItem(NAVIGATION_STORAGE_KEY, currentRoute);
        window.localStorage?.setItem(NAVIGATION_STORAGE_KEY, currentRoute);
      }
    } catch (e) {
      console.warn('[Navigation] Could not persist route:', e);
    }
  }, [currentRoute]);

  const renderCurrentView = () => {
    const routeParts = typeof currentRoute === 'string' ? currentRoute.split(':') : [];
    const routeBase = routeParts[0] || currentRoute;
    const routeSubtab = routeParts[1] || null;
    const routeSubsubtab = routeParts[2] || null;

    switch (routeBase) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentRoute} />;

      case 'patients':
        return <PatientsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'pharmacy':
        return <PharmacyView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'purchase':
        return <PurchaseView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'appointments':
        return <AppointmentsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'radiology':
        return <RadiologyView initialSubtab={routeSubtab || '27.1'} onNavigate={setCurrentRoute} />;

      case 'billing':
        return <BillingView initialSubtab={routeSubtab || '4.1'} onNavigate={setCurrentRoute} />;

      case 'credit-billing':
      case 'insurance':
        return <CreditBillingView initialSubtab={routeSubtab || '7.1'} onNavigate={setCurrentRoute} />;

      case 'clinical':
        return <ClinicalsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;

      case 'bloodbank':
        return <BloodBankView initialTab={routeSubtab || 'donors'} initialSubtab={routeSubtab || 'donors'} onNavigate={setCurrentRoute} />;

      case 'daycare':
        return <DayCareView initialSubtab={routeSubtab || '8.1'} onNavigate={setCurrentRoute} />;

      case 'dietary':
      case 'diet':
        return <DietView initialSubtab={routeSubtab || '9.1'} onNavigate={setCurrentRoute} />;

      case 'emr':
        return <EmrView initialSubtab={routeSubtab || '12.1'} onNavigate={setCurrentRoute} />;

      case 'embryology':
        return <EmbryologyView initialSubtab={routeSubtab || 'overview'} onNavigate={setCurrentRoute} />;

      case 'ivf':
        return <IvfView initialSubtab={routeSubtab || '18.1'} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;

      case 'laboratory':
      case 'lab':
        return <LaboratoryView initialSubtab={routeSubtab || '19.1'} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;

      case 'mrd':
        return <MrdView initialSubtab={routeSubtab || '20.1'} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;

      case 'nursing':
        return <NursingView initialSubtab={routeSubtab || '21.1'} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;

      case 'opd':
        return <OpdView initialSubtab={routeSubtab || '22.1'} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;

      case 'emergency':
        return <EmergencyView initialSubtab={routeSubtab || '11.1'} onNavigate={setCurrentRoute} />;

      case 'ot':
        return <OperationTheatreView initialSubtab={routeSubtab || '23.1'} onNavigate={setCurrentRoute} />;

      case 'finance':
        return <FinanceView initialSubtab={routeSubtab || '13.1'} onNavigate={setCurrentRoute} />;

      case 'fixed-asset':
        return <FixedAssetView initialSubtab={routeSubtab || '14.1'} onNavigate={setCurrentRoute} />;

      case 'general':
        return <GeneralView initialSubtab={routeSubtab || '15.1'} onNavigate={(subtab) => setCurrentRoute(`general:${subtab}`)} />;

      case 'inventory':
        return <InventoryView initialSubtab={routeSubtab || '16.1'} onNavigate={setCurrentRoute} />;

      case 'ipd':
        return <IpdView initialSubtab={routeSubtab || '17.1'} onNavigate={setCurrentRoute} />;

      case 'submodule': {
        if (routeSubtab && (routeSubtab.startsWith('1.') || routeSubtab.startsWith('2.') || routeSubtab.startsWith('4.'))) {
          return <BillingView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && routeSubtab.startsWith('5.')) {
          return <BloodBankView initialTab={routeSubtab} initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
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
        if (routeSubtab && routeSubtab.startsWith('13.')) {
          return <FinanceView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('18.') || routeSubtab === '18')) {
          return <IvfView initialSubtab={routeSubtab} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('19.') || routeSubtab === '19')) {
          return <LaboratoryView initialSubtab={routeSubtab} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('20.') || routeSubtab === '20')) {
          return <MrdView initialSubtab={routeSubtab} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('21.') || routeSubtab === '21')) {
          return <NursingView initialSubtab={routeSubtab} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('22.') || routeSubtab === '22')) {
          return <OpdView initialSubtab={routeSubtab} initialSubsubtab={routeSubsubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('23.') || routeSubtab === '23')) {
          return <OperationTheatreView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('24.') || routeSubtab === '24')) {
          return <PatientsView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('25.') || routeSubtab === '25')) {
          return <PharmacyView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('27.') || routeSubtab === '27')) {
          return <RadiologyView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (routeSubtab.startsWith('26.') || routeSubtab.startsWith('28.') || routeSubtab.startsWith('29.') || routeSubtab.startsWith('30.') || routeSubtab.startsWith('31.') || routeSubtab.startsWith('32.') || ['26','28','29','30','31','32'].includes(routeSubtab))) {
          return <PurchaseView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
        }
        if (routeSubtab && (parseInt(routeSubtab, 10) >= 16 && parseInt(routeSubtab, 10) <= 32)) {
          return <InventoryView initialSubtab={routeSubtab} onNavigate={setCurrentRoute} />;
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
          <DepartmentsView
            onBack={() => setCurrentRoute('dashboard')}
            onNavigate={setCurrentRoute}
          />
        );

      case 'rooms':
        return (
          <WardsView
            onBack={() => setCurrentRoute('dashboard')}
            onNavigate={setCurrentRoute}
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

      case 'login':
        return <LoginPage onLoginSuccess={() => setCurrentRoute('dashboard')} />;

      default:
        return <DashboardView onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <AuthProvider>
      <HospitalStateProvider>
        {currentRoute === 'login' ? (
          <LoginPage onLoginSuccess={() => setCurrentRoute('dashboard')} />
        ) : (
          <AppShell
            currentRoute={currentRoute}
            onNavigate={setCurrentRoute}
          >
            {renderCurrentView()}
          </AppShell>
        )}

        <LoginModal />
      </HospitalStateProvider>
    </AuthProvider>
  );
}

export default App;
