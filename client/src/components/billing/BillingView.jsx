import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Receipt,
  FlaskConical,
  Settings,
  Calendar,
  CreditCard,
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../common/UIPrimitives';
import { BILLING_GROUPS, ALL_BILLING_SUBMODULES } from './billingConstants';

// Group 1 — IVF & Andrology Operations
import { SemenAnalysisEntry } from './andrology/SemenAnalysisEntry';
import { SemenFreezingView } from './andrology/SemenFreezingView';
import { SampleThawUsageView } from './andrology/SampleThawUsageView';
import { DonorRegistryView } from './andrology/DonorRegistryView';

// Group 2 — Configuration & Integrations
import { WidgetsConfigView } from './config/WidgetsConfigView';
import { PrinterSettingsView } from './config/PrinterSettingsView';
import { ScannerSetupView } from './config/ScannerSetupView';
import { ExternalApiStatusView } from './config/ExternalApiStatusView';

// Group 3 — Appointments & Patient Flow (Reused authentic HMS modules)
import { BookRescheduleView } from '../appointments/BookRescheduleView';
import { DoctorRosterView } from '../appointments/DoctorRosterView';
import { TokenQueueDisplayView } from '../appointments/TokenQueueDisplayView';
import { RemindersAlertsView } from '../appointments/RemindersAlertsView';

// Group 4 — Financial Billing Operations
import { OpdBillingPosView } from './operations/OpdBillingPosView';
import { IpdRunningBillView } from './operations/IpdRunningBillView';
import { DischargeFinalBillView } from './operations/DischargeFinalBillView';
import { AdvanceDepositView } from './operations/AdvanceDepositView';
import { MyRefundsView } from './operations/MyRefundsView';
import { CashierSettlementView } from './operations/CashierSettlementView';

// Common Print / Tax Invoice Modal
import { ReceiptModal } from './common/ReceiptModal';

export function BillingView({ initialSubtab = '4.1', onNavigate }) {
  // Normalize subtab string
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '4.1';
    // Support aliases if passed
    if (tab === 'opd') return '4.1';
    if (tab === 'interim') return '4.2';
    if (tab === 'discharge') return '4.3';
    if (tab === 'deposits') return '4.4';
    if (tab === 'refunds') return '4.5';
    if (tab === 'settlement') return '4.6';
    const clean = tab.replace('billing:', '').replace('submodule:', '');
    const found = ALL_BILLING_SUBMODULES.find(s => s.id === clean);
    return found ? found.id : '4.1';
  }, []);

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [submoduleSearch, setSubmoduleSearch] = useState('');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceiptData, setSelectedReceiptData] = useState(null);

  // Sync prop updates
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab, normalizeSubtab]);

  // Current active submodule and its group
  const activeSubmodule = useMemo(() => {
    return ALL_BILLING_SUBMODULES.find(s => s.id === activeSubtab) || ALL_BILLING_SUBMODULES[0];
  }, [activeSubtab]);

  const activeGroup = useMemo(() => {
    return BILLING_GROUPS.find(g => g.id === activeSubmodule.group) || BILLING_GROUPS[3];
  }, [activeSubmodule]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`billing:${id}`);
    }
  };

  const handleSelectGroup = (groupId) => {
    const group = BILLING_GROUPS.find(g => g.id === groupId);
    if (group && group.submodules.length > 0) {
      handleSelectSubmodule(group.submodules[0].id);
    }
  };

  const handleOpenReceiptModal = (receiptData) => {
    setSelectedReceiptData(receiptData);
    setIsReceiptModalOpen(true);
  };

  // Render workspace content based on the 16 submodules
  const renderSubmoduleContent = () => {
    switch (activeSubtab) {
      // Group 1 — IVF & Andrology Operations
      case '1.1':
        return <SemenAnalysisEntry />;
      case '1.2':
        return <SemenFreezingView />;
      case '1.3':
        return <SampleThawUsageView />;
      case '1.4':
        return <DonorRegistryView />;

      // Group 2 — Configuration & Integrations
      case '2.1':
        return <WidgetsConfigView />;
      case '2.2':
        return <PrinterSettingsView />;
      case '2.3':
        return <ScannerSetupView />;
      case '2.4':
        return <ExternalApiStatusView />;

      // Group 3 — Appointments & Patient Flow
      case '3.1':
        return <BookRescheduleView onNavigate={handleSelectSubmodule} />;
      case '3.2':
        return <DoctorRosterView />;
      case '3.3':
        return <TokenQueueDisplayView />;
      case '3.4':
        return <RemindersAlertsView />;

      // Group 4 — Financial Billing Operations
      case '4.1':
        return <OpdBillingPosView onOpenReceiptModal={handleOpenReceiptModal} />;
      case '4.2':
        return <IpdRunningBillView onOpenReceiptModal={handleOpenReceiptModal} />;
      case '4.3':
        return <DischargeFinalBillView onOpenReceiptModal={handleOpenReceiptModal} />;
      case '4.4':
        return <AdvanceDepositView onOpenReceiptModal={handleOpenReceiptModal} />;
      case '4.5':
        return <MyRefundsView />;
      case '4.6':
        return <CashierSettlementView />;

      default:
        return <OpdBillingPosView onOpenReceiptModal={handleOpenReceiptModal} />;
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
            onClick={() => handleSelectSubmodule('4.1')}
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
            <Receipt size={14} />
            <span>Billing Workspace</span>
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

        {/* Global Submodule Search in Billing */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Input
            placeholder="Jump to any submodule..."
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
                maxHeight: '260px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--color-border)',
                zIndex: 200,
                padding: '6px'
              }}
            >
              {ALL_BILLING_SUBMODULES.filter(s =>
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

      {/* Primary Category Switcher (The 4 Groups) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px'
        }}
      >
        {BILLING_GROUPS.map((grp) => {
          const isGroupActive = grp.id === activeGroup.id;
          return (
            <button
              type="button"
              key={grp.id}
              onClick={() => handleSelectGroup(grp.id)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: isGroupActive ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: isGroupActive ? '#FFFFFF' : '#F9FAFB',
                boxShadow: isGroupActive ? 'var(--shadow-card)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: isGroupActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)' }}>
                  {grp.groupNumber}
                </span>
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: isGroupActive ? 'var(--color-bg-pale-aqua)' : '#E5E7EB', color: isGroupActive ? 'var(--color-primary-teal)' : '#4B5563', fontWeight: '600' }}>
                  {grp.submodules.length} Modules
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: isGroupActive ? '700' : '600', color: isGroupActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {grp.title}
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
          const SubIcon = sub.icon;
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
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: isSubActive ? '1px solid var(--color-primary-teal)' : '1px solid #E5E7EB',
                backgroundColor: isSubActive ? 'var(--color-primary-teal)' : '#F9FAFB',
                color: isSubActive ? '#FFFFFF' : 'var(--color-text-primary)',
                fontSize: '0.78rem',
                fontWeight: isSubActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              <SubIcon size={14} />
              <span>{sub.title}</span>
            </button>
          );
        })}
      </div>

      {/* Dedicated Submodule Workbench Content Area */}
      <div style={{ minHeight: '600px' }}>
        {renderSubmoduleContent()}
      </div>

      {/* Common Receipt / Tax Invoice Print Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        data={selectedReceiptData}
        type={selectedReceiptData?.admission_number ? 'deposit_receipt' : 'opd_receipt'}
      />
    </div>
  );
}

export default BillingView;
