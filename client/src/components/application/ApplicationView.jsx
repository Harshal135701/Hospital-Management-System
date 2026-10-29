import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronRight,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../common/UIPrimitives';
import { APPLICATION_SUBMODULES } from './applicationConstants';
import { WidgetsConfigDesk } from './WidgetsConfigDesk';
import { PrinterSettingsDesk } from './PrinterSettingsDesk';
import { ScannerSetupDesk } from './ScannerSetupDesk';
import { ExternalApiStatusDesk } from './ExternalApiStatusDesk';

export function ApplicationView({ initialSubtab = '2.1', onNavigate }) {
  // Normalize subtab parameter
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '2.1';
    if (tab === 'widgets' || tab === 'dashboard') return '2.1';
    if (tab === 'printers' || tab === 'barcode' || tab === 'thermal') return '2.2';
    if (tab === 'scanners' || tab === 'attachments' || tab === 'documents') return '2.3';
    if (tab === 'api' || tab === 'gateways' || tab === 'integrations') return '2.4';

    const clean = tab.replace('application:', '').replace('config:', '').replace('submodule:', '');
    const found = APPLICATION_SUBMODULES.find(s => s.id === clean || s.number === clean);
    return found ? found.id : '2.1';
  }, []);

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [submoduleSearch, setSubmoduleSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Sync prop updates
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab, normalizeSubtab]);

  // Current active submodule descriptor
  const activeSubmodule = useMemo(() => {
    return APPLICATION_SUBMODULES.find(s => s.id === activeSubtab) || APPLICATION_SUBMODULES[0];
  }, [activeSubtab]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`application:${id}`);
    }
  };

  // Filtered submodules for quick search
  const filteredSubmodules = useMemo(() => {
    if (!submoduleSearch.trim()) return APPLICATION_SUBMODULES;
    const q = submoduleSearch.toLowerCase();
    return APPLICATION_SUBMODULES.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.id.includes(q)
    );
  }, [submoduleSearch]);

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0F766E',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '600',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Quick Jump Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          <span>Hospital Administration</span>
          <ChevronRight size={14} />
          <span>Application Settings & Integrations</span>
          <ChevronRight size={14} />
          <span style={{ fontWeight: '600', color: 'var(--color-teal)' }}>
            {activeSubmodule.title}
          </span>
        </div>

        {/* Quick jump search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Quick jump across 2.1 – 2.4..."
            value={submoduleSearch}
            onChange={(e) => setSubmoduleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: 'var(--font-size-xs)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Submodule Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {filteredSubmodules.map((sub) => {
          const isActive = activeSubtab === sub.id;
          const SubIcon = sub.icon;

          return (
            <button
              key={sub.id}
              onClick={() => handleSelectSubmodule(sub.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--color-teal)' : 'var(--color-text-secondary)',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: isActive ? '2px solid var(--color-teal)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                marginBottom: '-1px'
              }}
            >
              <SubIcon size={16} />
              <span>{sub.shortTitle}</span>
              <Badge
                variant={isActive ? 'teal' : 'default'}
                size="sm"
                style={{ fontSize: '0.68rem', padding: '1px 6px' }}
              >
                {sub.number}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Submodule Description Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule {activeSubmodule.number}</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {activeSubmodule.title}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            {activeSubmodule.description}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="outline" size="sm">
            <span style={{ color: 'var(--color-text-secondary)' }}>{activeSubmodule.badge}</span>
          </Badge>
        </div>
      </div>

      {/* Render Active Submodule Desk */}
      {activeSubtab === '2.1' && <WidgetsConfigDesk onNotify={showToast} />}
      {activeSubtab === '2.2' && <PrinterSettingsDesk onNotify={showToast} />}
      {activeSubtab === '2.3' && <ScannerSetupDesk onNotify={showToast} />}
      {activeSubtab === '2.4' && <ExternalApiStatusDesk onNotify={showToast} />}
      {!['2.1', '2.2', '2.3', '2.4'].includes(activeSubtab) && (
        <WidgetsConfigDesk onNotify={showToast} />
      )}
    </div>
  );
}
