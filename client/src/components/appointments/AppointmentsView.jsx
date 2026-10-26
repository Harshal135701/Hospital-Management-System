import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '../common/UIPrimitives';
import { BookRescheduleView } from './BookRescheduleView';
import { DoctorRosterView } from './DoctorRosterView';
import { TokenQueueDisplayView } from './TokenQueueDisplayView';
import { RemindersAlertsView } from './RemindersAlertsView';
import { GroupDashboardView } from './GroupDashboardView';
import { BillingView } from '../billing/BillingView';
import { DayCareView } from '../daycare/DayCareView';
import { DietView } from '../diet/DietView';
import { EmrView } from '../emr/EmrView';
import { EmbryologyView } from '../embryology/EmbryologyView';
import { EmergencyView } from '../emergency/EmergencyView';
import { FinanceView } from '../finance/FinanceView';
import { PatientsView } from '../patients/PatientsView';
import { SubmodulesView } from './SubmodulesView';
import { MODULE_GROUPS, SUBMODULES } from './submoduleRegistry';

/**
 * Strips leading numeric indices such as "10. ", "3.1 ", "4.5 "
 * so labels render cleanly in bullet style without visible numeric prefixes.
 */
export const stripNumericPrefix = (text) => {
  if (!text) return '';
  return text.replace(/^\d+(\.\d+)*\s*[-–.]?\s*/, '').trim();
};

export function AppointmentsView({ initialSubtab, onNavigate }) {
  // If initialSubtab specifies a group dashboard view, e.g. "group:3"
  const [activeGroupId, setActiveGroupId] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('group:')) {
      return initialSubtab.replace('group:', '');
    }
    return null;
  });

  // Active submodule state
  const [selectedSubmoduleId, setSelectedSubmoduleId] = useState(() => {
    if (!initialSubtab) return '3.1';
    if (initialSubtab.startsWith('group:')) {
      const gId = initialSubtab.replace('group:', '');
      const first = SUBMODULES.find(s => s.groupId === gId);
      return first ? first.id : '3.1';
    }
    const clean = initialSubtab.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === clean);
    return found ? found.id : '3.1';
  });

  // Synchronize state with initialSubtab prop changes
  useEffect(() => {
    if (!initialSubtab) {
      setActiveGroupId(null);
      setSelectedSubmoduleId('3.1');
      return;
    }
    if (initialSubtab.startsWith('group:')) {
      const gId = initialSubtab.replace('group:', '');
      setActiveGroupId(gId);
      const first = SUBMODULES.find(s => s.groupId === gId);
      if (first) {
        setSelectedSubmoduleId(first.id);
      }
      return;
    }
    setActiveGroupId(null);
    const clean = initialSubtab.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === clean);
    if (found) {
      setSelectedSubmoduleId(found.id);
    }
  }, [initialSubtab]);

  // Active Submodule and Group resolution
  const activeSubmodule = useMemo(() => {
    return SUBMODULES.find(s => s.id === selectedSubmoduleId) || SUBMODULES[0];
  }, [selectedSubmoduleId]);

  const activeGroup = useMemo(() => {
    return MODULE_GROUPS.find(g => g.id === activeSubmodule.groupId) || MODULE_GROUPS[0];
  }, [activeSubmodule]);

  const handleSelectSubmodule = (subId) => {
    const cleanId = subId.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === cleanId);
    if (found) {
      setActiveGroupId(null);
      setSelectedSubmoduleId(found.id);
      if (onNavigate) {
        onNavigate(`appointments:${found.id}`);
      }
    }
  };

  const handleSelectGroupHeader = (groupId) => {
    setActiveGroupId(groupId);
    if (onNavigate) {
      onNavigate(`appointments:group:${groupId}`);
    }
  };

  // Render workspace content based on the active submodule
  const renderWorkspaceContent = () => {
    switch (activeSubmodule.id) {
      case '3.1':
        return <BookRescheduleView onNavigate={handleSelectSubmodule} />;
      case '3.2':
        return <DoctorRosterView onNavigate={handleSelectSubmodule} />;
      case '3.3':
        return <TokenQueueDisplayView onNavigate={handleSelectSubmodule} />;
      case '3.4':
        return <RemindersAlertsView onNavigate={handleSelectSubmodule} />;
      default:
        // Group 4: Billing
        if (activeSubmodule.id.startsWith('4.')) {
          return (
            <BillingView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 8: Day Care
        if (activeSubmodule.id.startsWith('8.')) {
          return (
            <DayCareView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 9: Diet & Nutrition
        if (activeSubmodule.id.startsWith('9.')) {
          return (
            <DietView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 10: Embryology
        if (activeSubmodule.id.startsWith('10.')) {
          return (
            <EmbryologyView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 11: Emergency
        if (activeSubmodule.id.startsWith('11.')) {
          return (
            <EmergencyView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 12: EMR
        if (activeSubmodule.id.startsWith('12.')) {
          return (
            <EmrView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 13: Finance & Accounting
        if (activeSubmodule.id.startsWith('13.')) {
          return (
            <FinanceView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 24: Patient / Visit Management
        if (activeSubmodule.id.startsWith('24.')) {
          return (
            <PatientsView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // All other module groups (1, 2, 5, 6, 7, 13–32)
        return (
          <SubmodulesView
            submodule={activeSubmodule}
            onBack={() => handleSelectGroupHeader(activeGroup.id)}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        );
    }
  };

  // If viewing group-level overview/dashboard
  if (activeGroupId) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <GroupDashboardView
          groupId={activeGroupId}
          onBackToLanding={() => handleSelectSubmodule('3.1')}
          onSelectSubmodule={handleSelectSubmodule}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner */}
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
            onClick={() => handleSelectSubmodule('3.1')}
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
            <Calendar size={13} />
            <span>Appointments</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => handleSelectGroupHeader(activeGroup.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {stripNumericPrefix(activeGroup.label)}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {stripNumericPrefix(activeSubmodule.title)}
          </span>
          {activeSubmodule.badge && (
            <Badge variant="teal" size="sm">
              {activeSubmodule.badge}
            </Badge>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Desk Ref: #{activeSubmodule.id}
          </span>
        </div>
      </div>

      {/* Dynamic Mounted Workspace */}
      {renderWorkspaceContent()}
    </div>
  );
}

export default AppointmentsView;
