import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  Plus,
  RotateCcw,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Button, Badge } from '../common/UIPrimitives';
import {
  OT_SUBMODULES,
  OT_MODULE_GROUPS,
  ALL_OT_SUBMODULES,
  findOtGroupBySubmoduleId,
  findOtSubmoduleById
} from './otConstants';
import { INITIAL_OT_CASES } from './otMockData';
import { OtOverviewDesk } from './OtOverviewDesk';
import { PacAssessmentDesk } from './PacAssessmentDesk';
import { WhoChecklistDesk } from './WhoChecklistDesk';
import { IntraOpNotesDesk } from './IntraOpNotesDesk';
import { PacuRecoveryDesk } from './PacuRecoveryDesk';

// Existing module view imports for seamless cross-group navigation
import { EmrView } from '../emr/EmrView';
import { FinanceView } from '../finance/FinanceView';
import { FixedAssetView } from '../fixed-asset/FixedAssetView';
import { GeneralView } from '../general/GeneralView';
import { IpdView } from '../ipd/IpdView';
import { IvfView } from '../ivf/IvfView';
import { LaboratoryView } from '../laboratory/LaboratoryView';
import { MrdView } from '../mrd/MrdView';
import { NursingView } from '../nursing/NursingView';
import { OpdView } from '../opd/OpdView';
import { InventoryView } from '../inventory/InventoryView';
import { BillingView } from '../billing/BillingView';
import { BloodBankView } from '../bloodbank/BloodBankView';
import { CreditBillingView } from '../credit-billing/CreditBillingView';
import { DayCareView } from '../daycare/DayCareView';
import { DietView } from '../diet/DietView';
import { EmbryologyView } from '../embryology/EmbryologyView';
import { EmergencyView } from '../emergency/EmergencyView';
import { SubmodulesView } from '../appointments/SubmodulesView';

export function OperationTheatreView({ initialSubtab = '23.1', onNavigate }) {
  // Normalize incoming tab
  const normalizeSubtab = (tab) => {
    if (!tab) return '23.1';
    const cleaned = String(tab).replace('ot:', '').replace('submodule:', '');
    const found = ALL_OT_SUBMODULES.some(s => s.id === cleaned);
    return found ? cleaned : '23.1';
  };

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [cases, setCases] = useState(INITIAL_OT_CASES);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Sync with prop when external route changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Handle Tab Navigation
  const handleSelectSubtab = (subtabId) => {
    setActiveSubtab(subtabId);
    if (onNavigate) {
      onNavigate(`ot:${subtabId}`);
    }
  };

  const handleUpdateCase = (updatedCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    showToast(`Case ${updatedCase.id} (${updatedCase.patientName}) updated successfully.`);
  };

  const handleCreateCase = (newCase) => {
    setCases(prev => [newCase, ...prev]);
    showToast(`Surgery slot scheduled: ${newCase.id} (${newCase.patientName}).`);
  };

  const handleResetData = () => {
    setCases(INITIAL_OT_CASES);
    showToast('Operation Theatre demonstration data reset to standard baseline.');
  };

  // Active group & submodule resolution
  const currentSubmodule = useMemo(() => {
    return findOtSubmoduleById(activeSubtab) || ALL_OT_SUBMODULES.find(s => s.id === '23.1') || ALL_OT_SUBMODULES[0];
  }, [activeSubtab]);

  const currentGroup = useMemo(() => {
    return findOtGroupBySubmoduleId(activeSubtab) || OT_MODULE_GROUPS.find(g => g.id === '23') || OT_MODULE_GROUPS[0];
  }, [activeSubtab]);

  // Tab Badge counts
  const tabBadges = useMemo(() => {
    return {
      '23.1': `${cases.length} Slots`,
      '23.2': `${cases.filter(c => c.pacStatus.includes('Cleared')).length} Cleared`,
      '23.3': `${cases.filter(c => c.whoChecklistStatus.includes('Completed')).length} Verified`,
      '23.4': `${cases.filter(c => c.status === 'in_surgery' || c.status === 'in_pacu').length} Notes`,
      '23.5': `${cases.filter(c => c.status === 'in_pacu').length} In PACU`
    };
  }, [cases]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching Appointment / Emergency style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
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
            onClick={() => handleSelectSubtab('23.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Activity size={13} />
            <span>Operation Theatre</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => {
              const firstSub = currentGroup.submodules[0]?.id || '23.1';
              handleSelectSubtab(firstSub);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
            title={currentGroup.name}
          >
            {currentGroup.name}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {currentSubmodule.label || currentSubmodule.shortLabel}
          </span>
          {currentSubmodule.badge && (
            <Badge variant="teal" size="sm">
              {currentSubmodule.badge}
            </Badge>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Desk Ref: #{currentSubmodule.id}
          </span>
        </div>
      </div>

      {/* Group 23: Operation Theatre Main Clinical Workspace */}
      {activeSubtab.startsWith('23.') && (
        <>
          {/* Main Module Header matching Appointment & Emergency */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingBottom: '4px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Operation Theatre (OT) Management
                </h1>
                <Badge variant="teal">Module 23</Badge>
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: '0.84rem',
                  color: 'var(--color-text-secondary)'
                }}
              >
                Surgical Suite Scheduling, Pre-Anesthesia Checkup (PAC), WHO Surgical Safety Checklist, Intra-Operative Notes, and PACU Recovery Monitoring.
              </p>
            </div>

            {/* Global Actions Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleResetData}
                title="Reset to clean baseline surgical seed data"
              >
                Reset Demo Data
              </Button>

              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={loading}
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    showToast('OT schedule census synchronized.');
                  }, 600);
                }}
                title="Sync Live OT Telemetry"
              >
                Sync Census
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => handleSelectSubtab('23.1')}
              >
                Schedule Surgery
              </Button>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                border: '1px solid var(--color-success-border)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* 5 Submodule Tab Navigation Bar */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '2px solid var(--color-border)',
              marginBottom: '4px',
              overflowX: 'auto',
              paddingBottom: '2px'
            }}
          >
            {OT_SUBMODULES.map((submodule) => {
              const isActive = activeSubtab === submodule.id;
              const Icon = submodule.icon;
              const badgeText = tabBadges[submodule.id];

              return (
                <button
                  type="button"
                  key={submodule.id}
                  onClick={() => handleSelectSubtab(submodule.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    border: 'none',
                    borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'} />
                  <span>{submodule.shortLabel}</span>
                  {badgeText && (
                    <span
                      style={{
                        backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : 'var(--color-border-subtle)',
                        color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontSize: '0.70rem',
                        fontWeight: '700'
                      }}
                    >
                      {badgeText}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Submodule Workspace Render */}
          <div>
            {activeSubtab === '23.1' && (
              <OtOverviewDesk
                cases={cases}
                onUpdateCase={handleUpdateCase}
                onCreateCase={handleCreateCase}
                onNavigateSubtab={handleSelectSubtab}
              />
            )}

            {activeSubtab === '23.2' && (
              <PacAssessmentDesk
                cases={cases}
                onUpdateCase={handleUpdateCase}
              />
            )}

            {activeSubtab === '23.3' && (
              <WhoChecklistDesk
                cases={cases}
                onUpdateCase={handleUpdateCase}
              />
            )}

            {activeSubtab === '23.4' && (
              <IntraOpNotesDesk
                cases={cases}
                onUpdateCase={handleUpdateCase}
              />
            )}

            {activeSubtab === '23.5' && (
              <PacuRecoveryDesk
                cases={cases}
                onUpdateCase={handleUpdateCase}
              />
            )}
          </div>
        </>
      )}

      {/* Integration with other module workspaces when selected from the OT 23-group sidebar */}
      {activeSubtab.startsWith('4.') && (
        <BillingView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('billing:', ''))} />
      )}

      {activeSubtab.startsWith('5.') && (
        <BloodBankView initialTab={activeSubtab} initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('bloodbank:', ''))} />
      )}

      {activeSubtab.startsWith('7.') && (
        <CreditBillingView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('credit-billing:', ''))} />
      )}

      {activeSubtab.startsWith('8.') && (
        <DayCareView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('daycare:', ''))} />
      )}

      {activeSubtab.startsWith('9.') && (
        <DietView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('dietary:', ''))} />
      )}

      {activeSubtab.startsWith('10.') && (
        <EmbryologyView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('embryology:', ''))} />
      )}

      {activeSubtab.startsWith('11.') && (
        <EmergencyView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('emergency:', ''))} />
      )}

      {activeSubtab.startsWith('12.') && (
        <EmrView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('emr:', ''))} />
      )}

      {activeSubtab.startsWith('13.') && (
        <FinanceView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('finance:', ''))} />
      )}

      {activeSubtab.startsWith('14.') && (
        <FixedAssetView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('fixed-asset:', ''))} />
      )}

      {activeSubtab.startsWith('15.') && (
        <GeneralView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('general:', ''))} />
      )}

      {activeSubtab.startsWith('16.') && (
        <InventoryView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('inventory:', ''))} />
      )}

      {activeSubtab.startsWith('17.') && (
        <IpdView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('ipd:', ''))} />
      )}

      {activeSubtab.startsWith('18.') && (
        <IvfView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('ivf:', ''))} />
      )}

      {activeSubtab.startsWith('19.') && (
        <LaboratoryView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('laboratory:', ''))} />
      )}

      {activeSubtab.startsWith('20.') && (
        <MrdView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('mrd:', ''))} />
      )}

      {activeSubtab.startsWith('21.') && (
        <NursingView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('nursing:', ''))} />
      )}

      {activeSubtab.startsWith('22.') && (
        <OpdView initialSubtab={activeSubtab} onNavigate={(sub) => handleSelectSubtab(String(sub).replace('opd:', ''))} />
      )}

      {/* Clean Fallback for Groups 1, 2, 3, 6, etc. using SubmodulesView */}
      {!activeSubtab.startsWith('23.') &&
       !activeSubtab.startsWith('4.') &&
       !activeSubtab.startsWith('5.') &&
       !activeSubtab.startsWith('7.') &&
       !activeSubtab.startsWith('8.') &&
       !activeSubtab.startsWith('9.') &&
       !activeSubtab.startsWith('10.') &&
       !activeSubtab.startsWith('11.') &&
       !activeSubtab.startsWith('12.') &&
       !activeSubtab.startsWith('13.') &&
       !activeSubtab.startsWith('14.') &&
       !activeSubtab.startsWith('15.') &&
       !activeSubtab.startsWith('16.') &&
       !activeSubtab.startsWith('17.') &&
       !activeSubtab.startsWith('18.') &&
       !activeSubtab.startsWith('19.') &&
       !activeSubtab.startsWith('20.') &&
       !activeSubtab.startsWith('21.') &&
       !activeSubtab.startsWith('22.') && (
        <SubmodulesView
          submodule={{
            id: currentSubmodule.id,
            title: currentSubmodule.label,
            groupName: currentGroup.name,
            subtitle: currentSubmodule.label,
            icon: currentSubmodule.icon
          }}
          onBack={() => handleSelectSubtab('23.1')}
          onNavigateSubmodule={handleSelectSubtab}
        />
      )}
    </div>
  );
}
