import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FlaskConical,
  Search,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button, Input } from '../common/UIPrimitives';
import { ANDROLOGY_SUBMODULES } from './andrologyConstants';
import { SemenAnalysisDesk } from './SemenAnalysisDesk';
import { SemenFreezingDesk } from './SemenFreezingDesk';
import { SampleThawUsageDesk } from './SampleThawUsageDesk';
import { DonorRegistryDesk } from './DonorRegistryDesk';

export function AndrologyView({ initialSubtab = '1.1', onNavigate }) {
  // Normalize subtab parameter
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '1.1';
    if (tab === 'semen' || tab === 'analysis') return '1.1';
    if (tab === 'cryo' || tab === 'freezing') return '1.2';
    if (tab === 'thaw' || tab === 'usage') return '1.3';
    if (tab === 'donor' || tab === 'registry') return '1.4';

    const clean = tab
      .replace('andrology:', '')
      .replace('billing:', '')
      .replace('appointments:', '')
      .replace('submodule:', '');

    const found = ANDROLOGY_SUBMODULES.find(s => s.id === clean || s.number === clean);
    return found ? found.id : '1.1';
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
    return ANDROLOGY_SUBMODULES.find(s => s.id === activeSubtab) || ANDROLOGY_SUBMODULES[0];
  }, [activeSubtab]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`andrology:${id}`);
    }
  };

  // Render submodule content
  const renderSubmoduleContent = () => {
    switch (activeSubtab) {
      case '1.1':
        return <SemenAnalysisDesk onNotify={showToast} />;
      case '1.2':
        return <SemenFreezingDesk onNotify={showToast} />;
      case '1.3':
        return <SampleThawUsageDesk onNotify={showToast} />;
      case '1.4':
        return <DonorRegistryDesk onNotify={showToast} />;
      default:
        return <SemenAnalysisDesk onNotify={showToast} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1100,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: '4px solid var(--color-primary-teal)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--color-primary-teal)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

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
            onClick={() => handleSelectSubmodule('1.1')}
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
            <FlaskConical size={14} />
            <span>Andrology Laboratory</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-primary-teal)', fontWeight: '600' }}>
            Group 1 — IVF & Andrology Operations
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {activeSubmodule.title}
          </span>
        </nav>

        {/* Global Submodule Search in Andrology */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Input
            placeholder="Jump to any submodule (1.1 - 1.4)..."
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
              {ANDROLOGY_SUBMODULES.filter(s =>
                s.title.toLowerCase().includes(submoduleSearch.toLowerCase()) ||
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
                    alignItems: 'flex-start',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeSubtab === sub.id ? 'var(--color-bg-pale-aqua)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <sub.icon size={15} style={{ color: 'var(--color-primary-teal)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                      {sub.description.slice(0, 60)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Andrology Workspace Tabs (All 4 Submodules) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '2px solid var(--color-border-subtle)',
          scrollbarWidth: 'thin'
        }}
      >
        {ANDROLOGY_SUBMODULES.map((sub) => {
          const isActive = activeSubtab === sub.id;
          const SubIcon = sub.icon;

          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => handleSelectSubmodule(sub.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <SubIcon size={16} />
              <span>{sub.title}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#F1F5F9',
                  color: isActive ? 'var(--color-primary-teal)' : '#64748B',
                  fontWeight: '600'
                }}
              >
                {sub.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submodule Description Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFB',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-primary-teal)',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <activeSubmodule.icon size={20} style={{ color: 'var(--color-primary-teal)' }} />
          <div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              {activeSubmodule.title}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
              — {activeSubmodule.description}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={() => {
              showToast('Refreshed andrology laboratory logs and storage levels.');
            }}
            title="Refresh latest data"
          >
            Sync
          </Button>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Module 1 • WHO 6th Edition / ART Regulation Standard
          </span>
        </div>
      </div>

      {/* Main Submodule Desk Workspace */}
      <div style={{ minHeight: '520px' }}>
        {renderSubmoduleContent()}
      </div>
    </div>
  );
}
