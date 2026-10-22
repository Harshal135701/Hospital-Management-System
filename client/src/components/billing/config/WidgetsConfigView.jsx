import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  RotateCcw,
  Save,
  Users,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../common/UIPrimitives';
import { INITIAL_WIDGETS_CONFIG } from '../common/billingMockData';

const LOCAL_STORAGE_KEY = 'hms_billing_dashboard_widgets_v1';

export function WidgetsConfigView() {
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_WIDGETS_CONFIG;
  });

  const [successBanner, setSuccessBanner] = useState(null);

  const handleToggleEnabled = (id) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
  };

  const handleSpanChange = (id, newSpan) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, columnSpan: parseInt(newSpan) } : w))
    );
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setWidgets(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === widgets.length - 1) return;
    setWidgets(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSave = () => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(widgets));
      setSuccessBanner('Widget layout and visibility configuration successfully saved.');
      setTimeout(() => setSuccessBanner(null), 3500);
    } catch {
      //
    }
  };

  const handleReset = () => {
    setWidgets(INITIAL_WIDGETS_CONFIG);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      //
    }
    setSuccessBanner('Dashboard layout reset to standard factory presets.');
    setTimeout(() => setSuccessBanner(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
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
            <Badge variant="teal" size="sm">Submodule 2.1</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Operational Widgets & Dashboard Configuration
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Configure active operational modules, role-based visibility, grid layout column spans, and card sequence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset to Default
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSave}
          >
            Save Layout Settings
          </Button>
        </div>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Widget Catalogue Config Table */}
      <Card
        title="Widget Catalogue & Display Properties"
        subtitle="Enable or disable operational widgets, set column spans, and reorder grid positions"
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'center', padding: '10px', width: '70px' }}>Order</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Widget Name & Details</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Role Permissions</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Grid Span</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Active State</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {widgets.map((w, idx) => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', opacity: w.enabled ? 1 : 0.6 }}>
                  <td style={{ textAlign: 'center', padding: '10px', fontWeight: '700', color: 'var(--color-text-muted)' }}>
                    #{idx + 1}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{w.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {w.description}
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="teal" size="sm">{w.category}</Badge>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {w.roleVisibility.map(r => (
                        <span key={r} style={{ fontSize: '0.7rem', padding: '2px 6px', backgroundColor: '#F3F4F6', borderRadius: '4px', color: '#4B5563' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <select
                      value={w.columnSpan}
                      onChange={(e) => handleSpanChange(w.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.75rem' }}
                    >
                      <option value="1">1 Column</option>
                      <option value="2">2 Columns (Wide)</option>
                      <option value="3">3 Columns (Full)</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(w.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: w.enabled ? 'var(--color-success-bg)' : '#F3F4F6',
                        color: w.enabled ? 'var(--color-success)' : '#6B7280',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {w.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          backgroundColor: idx === 0 ? '#F3F4F6' : '#FFFFFF',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer'
                        }}
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === widgets.length - 1}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #D1D5DB',
                          borderRadius: '4px',
                          backgroundColor: idx === widgets.length - 1 ? '#F3F4F6' : '#FFFFFF',
                          cursor: idx === widgets.length - 1 ? 'not-allowed' : 'pointer'
                        }}
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Live Layout Grid Preview */}
      <Card
        title="Live Grid Layout Preview"
        subtitle="Interactive rendering of how the configured widgets appear on clinical and financial workstations"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {widgets.filter(w => w.enabled).map((w) => (
            <div
              key={w.id}
              style={{
                gridColumn: `span ${Math.min(w.columnSpan, 3)}`,
                padding: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                border: '1.5px dashed var(--color-primary-teal)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '110px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{w.name}</span>
                  <Badge variant="teal" size="sm">{w.category}</Badge>
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  {w.description}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '8px', marginTop: '10px', fontSize: '0.7rem', color: '#6B7280' }}>
                <span>Grid Span: {w.columnSpan} Column(s)</span>
                <span>Active for: {w.roleVisibility.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
