import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BedDouble,
  Search,
  Building2,
  CalendarDays
} from 'lucide-react';
import { Badge, Input } from '../common/UIPrimitives';
import { IPD_GROUPS, ALL_IPD_SUBMODULES } from './ipdConstants';

// Group 1: Semen Analysis & Cryopreservation
import { SemenAnalysisEntry } from '../billing/andrology/SemenAnalysisEntry';
import { SemenFreezingView } from '../billing/andrology/SemenFreezingView';
import { SampleThawUsageView } from '../billing/andrology/SampleThawUsageView';
import { DonorRegistryView } from '../billing/andrology/DonorRegistryView';

// Group 2: Dashboard & Device Configuration
import { WidgetsConfigView } from '../billing/config/WidgetsConfigView';
import { PrinterSettingsView } from '../billing/config/PrinterSettingsView';
import { ScannerSetupView } from '../billing/config/ScannerSetupView';
import { ExternalApiStatusView } from '../billing/config/ExternalApiStatusView';

// Group 3: Appointment & Scheduling
import { BookRescheduleView } from '../appointments/BookRescheduleView';
import { DoctorRosterView } from '../appointments/DoctorRosterView';
import { TokenQueueDisplayView } from '../appointments/TokenQueueDisplayView';
import { RemindersAlertsView } from '../appointments/RemindersAlertsView';

// Group 4: Patient Billing & Cashier
import { OpdBillingPosView } from '../billing/operations/OpdBillingPosView';
import { IpdRunningBillView } from '../billing/operations/IpdRunningBillView';
import { DischargeFinalBillView } from '../billing/operations/DischargeFinalBillView';
import { AdvanceDepositView } from '../billing/operations/AdvanceDepositView';
import { MyRefundsView } from '../billing/operations/MyRefundsView';
import { CashierSettlementView } from '../billing/operations/CashierSettlementView';

// Group 5: Blood Bank Management
import { BloodBankView } from '../bloodbank/BloodBankView';

// Group 6: Clinical Consultation & Documentation
import { ClinicalsView } from '../clinicals/ClinicalsView';

// Group 7: TPA & Insurance
import { CreditBillingView } from '../credit-billing/CreditBillingView';

// Group 8: Day Care Management
import { DayCareView } from '../daycare/DayCareView';

// Group 9: Diet & Nutrition
import { DietView } from '../diet/DietView';

// Group 10: IVF & Embryology
import { EmbryologyView } from '../embryology/EmbryologyView';

// Group 11: Emergency & Trauma
import { EmergencyView } from '../emergency/EmergencyView';

// Group 12: Patient Records & E-Prescription
import { EmrView } from '../emr/EmrView';

// Group 13: Finance & General Ledger
import { FinanceView } from '../finance/FinanceView';

// Group 14: Fixed Asset Management
import { FixedAssetView } from '../fixed-asset/FixedAssetView';

// Group 15: Hospital & Administration Setup
import { GeneralView } from '../general/GeneralView';

// Group 16: Inventory & Store Management
import { StoreManagementGroup } from '../inventory/modules/StoreManagementGroup';

// Group 17: Inpatient Admission & Bed Management
import { InpatientBedGroup } from '../inventory/modules/InpatientBedGroup';

export function IpdView({ initialSubtab = '17.1', onNavigate }) {
  // Normalize subtab string
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '17.1';
    const clean = tab.replace('ipd:', '').replace('submodule:', '');
    const found = ALL_IPD_SUBMODULES.find(s => s.id === clean);
    return found ? found.id : '17.1';
  }, []);

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [submoduleSearch, setSubmoduleSearch] = useState('');

  // Sync prop updates
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab, normalizeSubtab]);

  // Current active submodule and its parent group
  const activeSubmodule = useMemo(() => {
    return ALL_IPD_SUBMODULES.find(s => s.id === activeSubtab) || ALL_IPD_SUBMODULES[0];
  }, [activeSubtab]);

  const activeGroup = useMemo(() => {
    return IPD_GROUPS.find(g => g.id === activeSubmodule.group) || IPD_GROUPS[0];
  }, [activeSubmodule]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`ipd:${id}`);
    }
  };

  const handleSelectGroup = (groupId) => {
    const group = IPD_GROUPS.find(g => g.id === groupId);
    if (group && group.submodules.length > 0) {
      handleSelectSubmodule(group.submodules[0].id);
    }
  };

  // Render workspace content based on active group and submodule
  const renderGroupContent = () => {
    const groupId = activeGroup.id;
    switch (groupId) {
      case '1': {
        // Group 1: Semen Analysis & Cryopreservation
        if (activeSubtab === '1.1') return <SemenAnalysisEntry />;
        if (activeSubtab === '1.2') return <SemenFreezingView />;
        if (activeSubtab === '1.3') return <SampleThawUsageView />;
        if (activeSubtab === '1.4') return <DonorRegistryView />;
        return <SemenAnalysisEntry />;
      }

      case '2': {
        // Group 2: Dashboard & Device Configuration
        if (activeSubtab === '2.1') return <WidgetsConfigView />;
        if (activeSubtab === '2.2') return <PrinterSettingsView />;
        if (activeSubtab === '2.3') return <ScannerSetupView />;
        if (activeSubtab === '2.4') return <ExternalApiStatusView />;
        return <WidgetsConfigView />;
      }

      case '3': {
        // Group 3: Appointment & Scheduling
        if (activeSubtab === '3.1') return <BookRescheduleView />;
        if (activeSubtab === '3.2') return <DoctorRosterView />;
        if (activeSubtab === '3.3') return <TokenQueueDisplayView />;
        if (activeSubtab === '3.4') return <RemindersAlertsView />;
        return <BookRescheduleView />;
      }

      case '4': {
        // Group 4: Patient Billing & Cashier
        if (activeSubtab === '4.1') return <OpdBillingPosView />;
        if (activeSubtab === '4.2') return <IpdRunningBillView />;
        if (activeSubtab === '4.3') return <DischargeFinalBillView />;
        if (activeSubtab === '4.4') return <AdvanceDepositView />;
        if (activeSubtab === '4.5') return <MyRefundsView />;
        if (activeSubtab === '4.6') return <CashierSettlementView />;
        return <IpdRunningBillView />;
      }

      case '5': {
        // Group 5: Blood Bank Management
        const bloodBankTabMap = {
          '5.1': 'donors',
          '5.2': 'collection',
          '5.3': 'inventory',
          '5.4': 'serology',
          '5.5': 'requisitions'
        };
        const targetTab = bloodBankTabMap[activeSubtab] || 'donors';
        return <BloodBankView initialTab={targetTab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '6': {
        // Group 6: Clinical Consultation & Documentation
        const clinicalTabMap = {
          '6.1': 'consultation',
          '6.2': 'vitals',
          '6.3': 'history',
          '6.4': 'orders',
          '6.5': 'notes'
        };
        const targetSubtab = clinicalTabMap[activeSubtab] || 'consultation';
        return <ClinicalsView initialSubtab={targetSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '7': {
        // Group 7: TPA & Insurance
        return <CreditBillingView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '8': {
        // Group 8: Day Care Management
        return <DayCareView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '9': {
        // Group 9: Diet & Nutrition
        return <DietView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '10': {
        // Group 10: IVF & Embryology
        return <EmbryologyView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '11': {
        // Group 11: Emergency & Trauma
        return <EmergencyView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '12': {
        // Group 12: Patient Records & E-Prescription
        return <EmrView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '13': {
        // Group 13: Finance & General Ledger
        return <FinanceView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '14': {
        // Group 14: Fixed Asset Management
        return <FixedAssetView initialSubtab={activeSubtab} onNavigate={(route) => onNavigate && onNavigate(route)} />;
      }

      case '15': {
        // Group 15: Hospital & Administration Setup
        return <GeneralView initialSubtab={activeSubtab} onNavigate={(subtab) => handleSelectSubmodule(subtab)} />;
      }

      case '16': {
        // Group 16: Inventory & Store Management
        return <StoreManagementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      }

      case '17': {
        // Group 17: Inpatient Admission & Bed Management
        return <InpatientBedGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      }

      default:
        return <InpatientBedGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Quick Actions Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectSubmodule('17.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <BedDouble size={14} />
            <span>IPD Inpatient Workspace</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => handleSelectGroup(activeGroup.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {activeGroup.title}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {activeSubmodule.title}
          </span>
        </nav>

        {/* Global Submodule Search in IPD */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Input
            placeholder="Search across all 17 IPD groups..."
            icon={Search}
            value={submoduleSearch}
            onChange={(e) => setSubmoduleSearch(e.target.value)}
          />

          {submoduleSearch.trim().length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                maxHeight: '280px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--color-border)',
                zIndex: 200,
                padding: '6px'
              }}
            >
              {ALL_IPD_SUBMODULES.filter(s =>
                s.title.toLowerCase().includes(submoduleSearch.toLowerCase()) ||
                s.groupTitle.toLowerCase().includes(submoduleSearch.toLowerCase()) ||
                s.description.toLowerCase().includes(submoduleSearch.toLowerCase())
              ).map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => {
                    handleSelectSubmodule(sub.id);
                    setSubmoduleSearch('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: sub.id === activeSubtab ? 'var(--color-bg-pale-aqua)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      {sub.groupTitle}
                    </div>
                  </div>
                  <Badge variant="teal" size="sm">{sub.id}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Category Switcher (The 17 Groups inside IPD) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '8px',
          maxHeight: '220px',
          overflowY: 'auto',
          padding: '4px',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FAFDFD'
        }}
      >
        {IPD_GROUPS.map((grp) => {
          const isGroupActive = grp.id === activeGroup.id;
          const GroupIcon = grp.icon || BedDouble;

          return (
            <button
              type="button"
              key={grp.id}
              onClick={() => handleSelectGroup(grp.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: isGroupActive ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: isGroupActive ? '#FFFFFF' : '#FFFFFF',
                boxShadow: isGroupActive ? '0 2px 6px rgba(8, 127, 140, 0.15)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isGroupActive ? 'var(--color-bg-pale-aqua)' : '#F3F4F6',
                  color: isGroupActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <GroupIcon size={16} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.66rem', fontWeight: '700', textTransform: 'uppercase', color: isGroupActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)' }}>
                  {grp.groupNumber} ({grp.submodules.length})
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: isGroupActive ? '700' : '600', color: isGroupActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {grp.shortTitle || grp.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary Submodule Navigation Bar (Within the active group) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 12px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <span style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginRight: '4px', whiteSpace: 'nowrap' }}>
          Submodules:
        </span>
        {activeGroup.submodules.map((sub) => {
          const SubIcon = sub.icon || BedDouble;
          const isSubActive = sub.id === activeSubtab;

          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => handleSelectSubmodule(sub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: isSubActive ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isSubActive ? '700' : '500',
                fontSize: '0.76rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              <SubIcon size={13} />
              <span>{sub.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Display of the Active Submodule */}
      {renderGroupContent()}
    </div>
  );
}
