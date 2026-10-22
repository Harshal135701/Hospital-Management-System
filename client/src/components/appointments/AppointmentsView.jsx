import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '../common/UIPrimitives';
import { AppointmentsLandingView } from './AppointmentsLandingView';
import { GroupDashboardView } from './GroupDashboardView';
import { BookRescheduleView } from './BookRescheduleView';
import { DoctorRosterView } from './DoctorRosterView';
import { TokenQueueDisplayView } from './TokenQueueDisplayView';
import { RemindersAlertsView } from './RemindersAlertsView';
import { BillingView } from '../billing/BillingView';
import { DayCareView } from '../daycare/DayCareView';
import { DietView } from '../diet/DietView';
import { EmrView } from '../emr/EmrView';
import { SubmodulesView } from './SubmodulesView';
import { MODULE_GROUPS, SUBMODULES } from './submoduleRegistry';

export function AppointmentsView({ initialSubtab, onNavigate }) {
  // Navigation state:
  // level: 1 (Landing Page) | 2 (Group Dashboard) | 3 (Nested Submodule Workspace)
  const [navState, setNavState] = useState(() => {
    if (!initialSubtab) {
      return { level: 1, groupId: null, submoduleId: null };
    }
    if (initialSubtab.startsWith('group:')) {
      const gId = initialSubtab.replace('group:', '');
      return { level: 2, groupId: gId, submoduleId: null };
    }
    // Submodule ID provided (e.g. '3.1', '4.2', 'submodule:3.1')
    const cleanSubId = initialSubtab.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === cleanSubId);
    if (found) {
      return { level: 3, groupId: found.groupId, submoduleId: found.id };
    }
    return { level: 1, groupId: null, submoduleId: null };
  });

  // Sync with prop updates
  useEffect(() => {
    if (!initialSubtab) {
      setNavState({ level: 1, groupId: null, submoduleId: null });
      return;
    }
    if (initialSubtab.startsWith('group:')) {
      const gId = initialSubtab.replace('group:', '');
      setNavState({ level: 2, groupId: gId, submoduleId: null });
      return;
    }
    const cleanSubId = initialSubtab.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === cleanSubId);
    if (found) {
      setNavState({ level: 3, groupId: found.groupId, submoduleId: found.id });
    }
  }, [initialSubtab]);

  // Navigate to Level 1: Landing Page
  const handleBackToLanding = () => {
    setNavState({ level: 1, groupId: null, submoduleId: null });
    if (onNavigate) {
      onNavigate('appointments');
    }
  };

  // Navigate to Level 2: Group Dashboard
  const handleSelectGroup = (groupId) => {
    setNavState({ level: 2, groupId, submoduleId: null });
    if (onNavigate) {
      onNavigate(`appointments:group:${groupId}`);
    }
  };

  // Navigate to Level 3: Nested Submodule Workspace
  const handleSelectSubmodule = (submoduleId) => {
    const cleanId = submoduleId.replace('submodule:', '');
    const found = SUBMODULES.find(s => s.id === cleanId);
    const groupId = found ? found.groupId : '3';
    setNavState({ level: 3, groupId, submoduleId: cleanId });
    if (onNavigate) {
      onNavigate(`appointments:${cleanId}`);
    }
  };

  // Level 1: Landing Page
  if (navState.level === 1) {
    return (
      <AppointmentsLandingView
        onSelectGroup={handleSelectGroup}
        onSelectSubmodule={handleSelectSubmodule}
      />
    );
  }

  // Level 2: Functional Group Dashboard
  if (navState.level === 2) {
    return (
      <GroupDashboardView
        groupId={navState.groupId || '3'}
        onBackToLanding={handleBackToLanding}
        onSelectSubmodule={handleSelectSubmodule}
      />
    );
  }

  // Level 3: Dedicated Nested-Submodule Workspace
  const activeSubmodule = SUBMODULES.find(s => s.id === navState.submoduleId) || SUBMODULES[0];
  const activeGroup = MODULE_GROUPS.find(g => g.id === activeSubmodule.groupId) || MODULE_GROUPS[0];

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
        // Group 4 Billing submodules
        if (activeSubmodule.id.startsWith('4.')) {
          return (
            <BillingView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 8 Day Care submodules
        if (activeSubmodule.id.startsWith('8.')) {
          return (
            <DayCareView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 9 Diet & Nutrition submodules
        if (activeSubmodule.id.startsWith('9.')) {
          return (
            <DietView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Group 12 EMR Records submodules
        if (activeSubmodule.id.startsWith('12.')) {
          return (
            <EmrView
              initialSubtab={activeSubmodule.id}
              onNavigate={handleSelectSubmodule}
            />
          );
        }
        // Groups 5 through 32 submodules
        return (
          <SubmodulesView
            submodule={activeSubmodule}
            onBack={() => handleSelectGroup(activeGroup.id)}
            onNavigateSubmodule={handleSelectSubmodule}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Level 3 Breadcrumb Header */}
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
            onClick={handleBackToLanding}
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
            {activeGroup.label}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
            {activeSubmodule.title}
          </span>
        </nav>

        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          onClick={() => handleSelectGroup(activeGroup.id)}
          style={{ borderColor: 'var(--color-border)' }}
        >
          Back to {activeGroup.label}
        </Button>
      </div>

      {/* Dedicated Workspace Body */}
      {renderWorkspaceContent()}
    </div>
  );
}

export default AppointmentsView;
