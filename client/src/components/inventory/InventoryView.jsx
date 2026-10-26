import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  Boxes
} from 'lucide-react';
import { Badge, Input } from '../common/UIPrimitives';
import { INVENTORY_GROUPS, ALL_INVENTORY_SUBMODULES } from './inventoryConstants';

// The 17 Group Screen Modules
import { StoreManagementGroup } from './modules/StoreManagementGroup';
import { InpatientBedGroup } from './modules/InpatientBedGroup';
import { IvfAndrologyGroup } from './modules/IvfAndrologyGroup';
import { LaboratoryGroup } from './modules/LaboratoryGroup';
import { MedicalRecordsGroup } from './modules/MedicalRecordsGroup';
import { WardNursingGroup } from './modules/WardNursingGroup';
import { OpdManagementGroup } from './modules/OpdManagementGroup';
import { OperationTheatreGroup } from './modules/OperationTheatreGroup';
import { PatientRegistrationGroup } from './modules/PatientRegistrationGroup';
import { PharmacyManagementGroup } from './modules/PharmacyManagementGroup';
import { PurchaseProcurementGroup } from './modules/PurchaseProcurementGroup';
import { RadiologyPacsGroup } from './modules/RadiologyPacsGroup';
import { OtcRetailPosGroup } from './modules/OtcRetailPosGroup';
import { SystemAdminAuditGroup } from './modules/SystemAdminAuditGroup';
import { UserProfilePreferencesGroup } from './modules/UserProfilePreferencesGroup';
import { WorkOrderGroup } from './modules/WorkOrderGroup';
import { AnalyticsExportGroup } from './modules/AnalyticsExportGroup';

export function InventoryView({ initialSubtab = '16.1', onNavigate }) {
  // Normalize subtab string
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '16.1';
    const clean = tab.replace('inventory:', '').replace('submodule:', '');
    const found = ALL_INVENTORY_SUBMODULES.find(s => s.id === clean);
    return found ? found.id : '16.1';
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
    return ALL_INVENTORY_SUBMODULES.find(s => s.id === activeSubtab) || ALL_INVENTORY_SUBMODULES[0];
  }, [activeSubtab]);

  const activeGroup = useMemo(() => {
    return INVENTORY_GROUPS.find(g => g.id === activeSubmodule.group) || INVENTORY_GROUPS[0];
  }, [activeSubmodule]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`inventory:${id}`);
    }
  };

  const handleSelectGroup = (groupId) => {
    const group = INVENTORY_GROUPS.find(g => g.id === groupId);
    if (group && group.submodules.length > 0) {
      handleSelectSubmodule(group.submodules[0].id);
    }
  };

  // Render workspace content based on active group
  const renderGroupContent = () => {
    const groupId = activeGroup.id;
    switch (groupId) {
      case '16':
        return <StoreManagementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '17':
        return <InpatientBedGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '18':
        return <IvfAndrologyGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '19':
        return <LaboratoryGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '20':
        return <MedicalRecordsGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '21':
        return <WardNursingGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '22':
        return <OpdManagementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '23':
        return <OperationTheatreGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '24':
        return <PatientRegistrationGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '25':
        return <PharmacyManagementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '26':
        return <PurchaseProcurementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '27':
        return <RadiologyPacsGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '28':
        return <OtcRetailPosGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '29':
        return <SystemAdminAuditGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '30':
        return <UserProfilePreferencesGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '31':
        return <WorkOrderGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      case '32':
        return <AnalyticsExportGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
      default:
        return <StoreManagementGroup activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubmodule} />;
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
            onClick={() => handleSelectSubmodule('16.1')}
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
            <Boxes size={14} />
            <span>Inventory Workspace</span>
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

        {/* Global Submodule Search in Inventory */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Input
            placeholder="Search across all 17 Inventory groups..."
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
              {ALL_INVENTORY_SUBMODULES.filter(s =>
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

      {/* Primary Category Switcher (The 17 Groups inside Inventory) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          maxHeight: '220px',
          overflowY: 'auto',
          padding: '4px',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FAFDFD'
        }}
      >
        {INVENTORY_GROUPS.map((grp) => {
          const isGroupActive = grp.id === activeGroup.id;
          const GroupIcon = grp.icon || Package;

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
          const SubIcon = sub.icon || Package;
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
