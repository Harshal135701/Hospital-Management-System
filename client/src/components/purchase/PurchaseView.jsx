import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/UIPrimitives';
import {
  PURCHASE_MODULE_GROUPS,
  findPurchaseGroupBySubmoduleId,
  findPurchaseSubmoduleById,
  normalizePurchaseSubtab
} from './purchaseConstants';

// 7 Desks for the 7 Groups
import { ProcurementDesk } from './desks/ProcurementDesk';
import { RadiologyPacsDesk } from './desks/RadiologyPacsDesk';
import { OtcRetailPosDesk } from './desks/OtcRetailPosDesk';
import { SystemAdminAuditDesk } from './desks/SystemAdminAuditDesk';
import { UserProfilePreferencesDesk } from './desks/UserProfilePreferencesDesk';
import { WorkOrderDesk } from './desks/WorkOrderDesk';
import { AnalyticsExportDesk } from './desks/AnalyticsExportDesk';

export function PurchaseView({ initialSubtab, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => normalizePurchaseSubtab(initialSubtab));
  
  // Sync subtab with prop when external route changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizePurchaseSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  const currentGroup = useMemo(() => {
    return findPurchaseGroupBySubmoduleId(activeSubtab);
  }, [activeSubtab]);

  const currentSubmodule = useMemo(() => {
    return findPurchaseSubmoduleById(activeSubtab);
  }, [activeSubtab]);

  const handleSelectSubtab = (subId) => {
    const cleanId = normalizePurchaseSubtab(subId);
    setActiveSubtab(cleanId);
    if (onNavigate) {
      onNavigate(`purchase:${cleanId}`);
    }
  };



  // Render workspace content based on the active submodule group
  const renderGroupContent = () => {
    if (activeSubtab.startsWith('26.')) {
      return <ProcurementDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('27.')) {
      return <RadiologyPacsDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('28.')) {
      return <OtcRetailPosDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('29.')) {
      return <SystemAdminAuditDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('30.')) {
      return <UserProfilePreferencesDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('31.')) {
      return <WorkOrderDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    if (activeSubtab.startsWith('32.')) {
      return <AnalyticsExportDesk activeSubtab={activeSubtab} onNavigateSubmodule={handleSelectSubtab} />;
    }
    return <ProcurementDesk activeSubtab="26.1" onNavigateSubmodule={handleSelectSubtab} />;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching Appointment/Patient standard */}
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
            onClick={() => handleSelectSubtab('26.1')}
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
            <ShoppingBag size={13} />
            <span>Purchase Module</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => {
              const firstSub = currentGroup.submodules[0]?.id || '26.1';
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
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            {currentGroup.name}
          </span>
        </div>
      </div>


      {/* Main Module Header matching Appointment / OT View standard */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-teal)',
              flexShrink: 0
            }}
          >
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                margin: 0,
                lineHeight: '1.2'
              }}
            >
              Hospital Purchase & Operations Hub
            </h1>
            <p
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                margin: '2px 0 0 0'
              }}
            >
              Procurement indents, RFQs, POs, radiology PACS, retail OTC billing, system audit, work orders & analytics
            </p>
          </div>
        </div>

        {/* 7 Group Quick Switcher Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap'
          }}
        >
          {PURCHASE_MODULE_GROUPS.map((g) => {
            const isGroupSelected = g.id === currentGroup.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  const firstSub = g.submodules[0]?.id || `${g.id}.1`;
                  handleSelectSubtab(firstSub);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: isGroupSelected
                    ? '1.5px solid var(--color-primary-teal)'
                    : '1px solid var(--color-border)',
                  backgroundColor: isGroupSelected
                    ? 'var(--color-bg-pale-aqua)'
                    : 'var(--color-bg-main)',
                  color: isGroupSelected
                    ? 'var(--color-primary-teal)'
                    : 'var(--color-text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: isGroupSelected ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                <span>{g.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submodule Level Pills for Currently Active Group */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--color-border-subtle)',
          scrollbarWidth: 'thin'
        }}
      >
        {currentGroup.submodules.map((sub) => {
          const isActive = activeSubtab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSelectSubtab(sub.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: isActive
                  ? '1.5px solid #49769F'
                  : '1px solid var(--color-border)',
                backgroundColor: isActive ? '#49769F' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                fontSize: '0.76rem',
                fontWeight: isActive ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              <span>{sub.label}</span>
              {sub.badge && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : 'var(--color-bg-secondary)',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                    fontWeight: '600'
                  }}
                >
                  {sub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Content */}
      <main style={{ minHeight: '520px', width: '100%' }}>
        {renderGroupContent()}
      </main>
    </div>
  );
}
