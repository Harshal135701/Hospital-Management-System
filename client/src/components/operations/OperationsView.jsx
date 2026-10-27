import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag,
  ScanLine,
  CreditCard,
  RefreshCw,
  ShieldCheck,
  Users,
  Building2,
  Bell,
  Lock,
  UserCheck,
  Key,
  Sliders,
  Wrench,
  FileText,
  CheckCircle2,
  Eye,
  Award,
  BarChart3,
  Database,
  Activity,
  FileSpreadsheet,
  Layers,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Button, Badge } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import {
  OPERATIONS_MODULE_GROUPS,
  ALL_OPERATIONS_SUBMODULES,
  findOperationsSubmoduleById,
  findOperationsGroupBySubmoduleId,
  normalizeOperationsSubtab,
  stripNumericPrefix
} from './operationsConstants';

import { RetailPosDesk } from './desks/RetailPosDesk';
import { SystemAdminDesk } from './desks/SystemAdminDesk';
import { UserProfileDesk } from './desks/UserProfileDesk';
import { WorkOrderDesk } from './desks/WorkOrderDesk';
import { AnalyticsExportDesk } from './desks/AnalyticsExportDesk';

import { PatientService, DepartmentService } from '../../services/api';

export function OperationsView({ initialSubtab = '28.1', onNavigate }) {
  const { user: currentUser } = useAuth();

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeOperationsSubtab(initialSubtab));
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Sync with prop when external route changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeOperationsSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Load existing patients & departments for realistic lookup
  const fetchAuxData = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const livePatients = await PatientService.getPatients();
        if (Array.isArray(livePatients) && livePatients.length > 0) {
          setPatients(livePatients);
        }
      } catch (err) {
        console.warn('[OperationsView] Patients fallback:', err.message);
      }

      try {
        const liveDepts = await DepartmentService.getDepartments();
        if (Array.isArray(liveDepts) && liveDepts.length > 0) {
          setDepartments(liveDepts);
        }
      } catch (err) {
        console.warn('[OperationsView] Departments fallback:', err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuxData();
  }, [fetchAuxData]);

  // Navigation Handler
  const handleSelectSubtab = (subtabId) => {
    const cleanId = normalizeOperationsSubtab(subtabId);
    setActiveSubtab(cleanId);
    if (onNavigate) {
      onNavigate(`operations:${cleanId}`);
    }
  };

  // Active submodule and group resolution
  const currentSubmodule = useMemo(() => {
    return findOperationsSubmoduleById(activeSubtab);
  }, [activeSubtab]);

  const currentGroup = useMemo(() => {
    return findOperationsGroupBySubmoduleId(activeSubtab);
  }, [activeSubtab]);

  // Render the corresponding Desk
  const renderDesk = () => {
    if (activeSubtab.startsWith('28.')) {
      return (
        <RetailPosDesk
          activeSubtab={activeSubtab}
          patients={patients}
          onNavigateSubmodule={handleSelectSubtab}
        />
      );
    }
    if (activeSubtab.startsWith('29.')) {
      return (
        <SystemAdminDesk
          activeSubtab={activeSubtab}
          currentUser={currentUser}
          onNavigateSubmodule={handleSelectSubtab}
        />
      );
    }
    if (activeSubtab.startsWith('30.')) {
      return (
        <UserProfileDesk
          activeSubtab={activeSubtab}
          currentUser={currentUser}
          onNavigateSubmodule={handleSelectSubtab}
        />
      );
    }
    if (activeSubtab.startsWith('31.')) {
      return (
        <WorkOrderDesk
          activeSubtab={activeSubtab}
          currentUser={currentUser}
          onNavigateSubmodule={handleSelectSubtab}
        />
      );
    }
    if (activeSubtab.startsWith('32.')) {
      return (
        <AnalyticsExportDesk
          activeSubtab={activeSubtab}
          currentUser={currentUser}
          onNavigateSubmodule={handleSelectSubtab}
        />
      );
    }
    return (
      <RetailPosDesk
        activeSubtab="28.1"
        patients={patients}
        onNavigateSubmodule={handleSelectSubtab}
      />
    );
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
      {/* Workspace Context Navigation Banner matching Appointment / Emergency / Radiology */}
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
            onClick={() => handleSelectSubtab('28.1')}
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
            <span>Retail Sales & Operations</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <button
            type="button"
            onClick={() => {
              const firstSub = currentGroup.submodules[0]?.id || '28.1';
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
            title={currentGroup.label}
          >
            {stripNumericPrefix(currentGroup.label)}
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {stripNumericPrefix(currentSubmodule.label || currentSubmodule.shortLabel)}
          </span>
          {currentSubmodule.badge && (
            <Badge variant="teal" size="sm">
              {currentSubmodule.badge}
            </Badge>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Ref: #{currentSubmodule.id}
          </span>
        </div>
      </div>

      {/* Top Header Banner & Global Actions Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: 0
            }}
          >
            <currentSubmodule.icon size={20} color="var(--color-primary-teal)" />
            <span>{stripNumericPrefix(currentSubmodule.label)}</span>
          </h2>
          <p
            style={{
              fontSize: '0.80rem',
              color: 'var(--color-text-secondary)',
              margin: '4px 0 0 0'
            }}
          >
            {currentSubmodule.description}
          </p>
        </div>

        {/* Global Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchAuxData}
            title="Sync live operational records"
          >
            Sync Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={ShoppingBag}
            onClick={() => handleSelectSubtab('28.1')}
          >
            OTC POS
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleSelectSubtab('31.1')}
          >
            New Work Order
          </Button>
        </div>
      </div>

      {/* 5 Primary Operations Group Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '2px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {OPERATIONS_MODULE_GROUPS.map((group) => {
          const isActive = currentGroup.id === group.id;
          const Icon = group.icon;
          const firstSubId = group.submodules[0]?.id || '28.1';

          return (
            <button
              type="button"
              key={group.id}
              onClick={() => handleSelectSubtab(firstSubId)}
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
                fontSize: '0.84rem',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-muted)'} />
              <span>{stripNumericPrefix(group.label)}</span>
              {group.badge && (
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
                  {group.submodules.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Submodule Pills for the Active Group */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '4px 0',
          alignItems: 'center'
        }}
      >
        {currentGroup.submodules.map((sub) => {
          const isSelected = activeSubtab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => handleSelectSubtab(sub.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)',
                backgroundColor: isSelected ? 'var(--color-primary-teal)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: '0.76rem',
                fontWeight: isSelected ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              {stripNumericPrefix(sub.label)}
            </button>
          );
        })}
      </div>

      {/* Render Active Desk */}
      <div style={{ marginTop: '4px' }}>
        {renderDesk()}
      </div>
    </div>
  );
}

export default OperationsView;
