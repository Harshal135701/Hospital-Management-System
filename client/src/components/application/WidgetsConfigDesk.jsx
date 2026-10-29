import React, { useState, useMemo } from 'react';
import {
  LayoutGrid,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  RotateCcw,
  Save,
  Users,
  Search,
  Columns,
  Info,
  Activity,
  Bed,
  IndianRupee,
  FlaskConical,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { WIDGET_CATEGORIES, USER_ROLES, GRID_COLUMN_OPTIONS } from './applicationConstants';
import { INITIAL_DASHBOARD_WIDGETS } from './applicationMockData';

const LOCAL_STORAGE_KEY = 'hms_billing_dashboard_widgets_v1';
const LAYOUT_COLUMNS_KEY = 'hms_dashboard_layout_cols_v1';

export function WidgetsConfigDesk({ onNotify }) {
  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[WidgetsConfigDesk] LocalStorage read failed:', e);
    }
    return INITIAL_DASHBOARD_WIDGETS;
  });

  const [gridColumns, setGridColumns] = useState(() => {
    try {
      const savedCols = localStorage.getItem(LAYOUT_COLUMNS_KEY);
      if (savedCols) return parseInt(savedCols, 10);
    } catch {
      //
    }
    return 3;
  });

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Filtered widgets for the list view
  const filteredWidgets = useMemo(() => {
    return widgets.filter(w => {
      const matchSearch = (w.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
        (w.description || '').toLowerCase().includes(searchFilter.toLowerCase());
      const matchCat = selectedCategory === 'All Categories' || w.category === selectedCategory;
      const matchRole = selectedRoleFilter === 'All Roles' || (w.roleVisibility && w.roleVisibility.includes(selectedRoleFilter));
      return matchSearch && matchCat && matchRole;
    });
  }, [widgets, searchFilter, selectedCategory, selectedRoleFilter]);

  // Derived KPIs
  const totalWidgets = widgets.length;
  const enabledWidgets = widgets.filter(w => w.enabled).length;
  const rolePresetsCount = USER_ROLES.length - 1;

  const handleToggleEnabled = (id) => {
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, enabled: !w.enabled } : w))
    );
    setHasUnsavedChanges(true);
  };

  const handleSpanChange = (id, newSpan) => {
    const val = parseInt(newSpan, 10);
    setWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, columnSpan: val } : w))
    );
    setHasUnsavedChanges(true);
  };

  const handleMoveUp = (id) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index <= 0) return;
    setWidgets(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const handleMoveDown = (id) => {
    const index = widgets.findIndex(w => w.id === id);
    if (index === -1 || index >= widgets.length - 1) return;
    setWidgets(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Validation
    const activeCount = widgets.filter(w => w.enabled).length;
    if (activeCount === 0) {
      if (onNotify) onNotify('Validation error: At least one dashboard widget must remain enabled.');
      return;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(widgets));
      localStorage.setItem(LAYOUT_COLUMNS_KEY, gridColumns.toString());
      setHasUnsavedChanges(false);
      if (onNotify) onNotify('Dashboard widget layout and column configuration saved successfully.');
    } catch (e) {
      if (onNotify) onNotify('Failed to persist configuration to browser storage.');
    }
  };

  const handleReset = () => {
    setWidgets(INITIAL_DASHBOARD_WIDGETS);
    setGridColumns(3);
    setHasUnsavedChanges(true);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LAYOUT_COLUMNS_KEY);
    } catch {
      //
    }
    if (onNotify) onNotify('Dashboard configuration reverted to standard factory defaults.');
  };

  const handleCancel = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setWidgets(JSON.parse(saved));
      } else {
        setWidgets(INITIAL_DASHBOARD_WIDGETS);
      }
      setHasUnsavedChanges(false);
      if (onNotify) onNotify('Unsaved changes discarded.');
    } catch {
      setWidgets(INITIAL_DASHBOARD_WIDGETS);
    }
  };

  // Helper to render widget icon
  const getWidgetIcon = (cat) => {
    switch (cat) {
      case 'Financial': return IndianRupee;
      case 'Inpatient': return Bed;
      case 'Diagnostic Lab': return FlaskConical;
      case 'Communications': return MessageSquare;
      default: return Activity;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 118, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}
          >
            <LayoutGrid size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Available Widgets
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {totalWidgets}
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Enabled on Dashboard
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#16A34A' }}>
              {enabledWidgets} <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: 'var(--color-text-muted)' }}>/ {totalWidgets}</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Configured Roles
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {rolePresetsCount} Roles
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}
          >
            <Columns size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Grid Layout
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {gridColumns} Columns
            </div>
          </div>
        </Card>
      </div>

      {/* Honest Scope & Persistence Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#1E40AF'
        }}
      >
        <Info size={16} style={{ flexShrink: 0, color: '#2563EB' }} />
        <span>
          <strong>Dashboard Sync Notice:</strong> Changes made here update the operational layout in real-time in the interactive preview below. Click <strong>Save Configuration</strong> to commit your adjustments to workstation storage.
        </span>
      </div>

      {/* Controls & Filter Toolbar */}
      <Card style={{ padding: '14px 18px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Search & Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
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
                placeholder="Search widgets by name or description..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '7px 10px',
                fontSize: 'var(--font-size-xs)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {WIDGET_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{
                padding: '7px 10px',
                fontSize: 'var(--font-size-xs)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {USER_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                Grid:
              </span>
              <select
                value={gridColumns}
                onChange={(e) => {
                  setGridColumns(parseInt(e.target.value, 10));
                  setHasUnsavedChanges(true);
                }}
                style={{
                  padding: '7px 10px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                {GRID_COLUMN_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasUnsavedChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Cancel Changes
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Restore Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSave}
            >
              Save Configuration
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Workspace: Left = Widgets Ordering Table, Right = Live Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '20px' }}>
        {/* Left Column: Widget List with Reorder Controls */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                Widget Layout & Order ({filteredWidgets.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Toggle visibility, adjust column span, and reorder sequence.
              </p>
            </div>
            {hasUnsavedChanges && (
              <Badge variant="amber" size="sm">Unsaved Changes</Badge>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
                  <th style={{ padding: '10px 14px', width: '60px' }}>Order</th>
                  <th style={{ padding: '10px 14px' }}>Widget Name & Category</th>
                  <th style={{ padding: '10px 14px', width: '90px' }}>Visible</th>
                  <th style={{ padding: '10px 14px', width: '110px' }}>Span</th>
                  <th style={{ padding: '10px 14px', width: '80px', textAlign: 'center' }}>Move</th>
                </tr>
              </thead>
              <tbody>
                {filteredWidgets.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No widgets match the selected search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWidgets.map((w) => {
                    const originalIndex = widgets.findIndex(item => item.id === w.id);
                    const isFirst = originalIndex === 0;
                    const isLast = originalIndex === widgets.length - 1;
                    const WidgetIcon = getWidgetIcon(w.category);

                    return (
                      <tr
                        key={w.id}
                        style={{
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: w.enabled ? '#FFFFFF' : '#F9FAFB',
                          opacity: w.enabled ? 1 : 0.65,
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-text-muted)' }}>
                          #{originalIndex + 1}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div
                              style={{
                                padding: '6px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: w.enabled ? 'rgba(15, 118, 110, 0.08)' : '#E5E7EB',
                                color: w.enabled ? 'var(--color-teal)' : '#6B7280',
                                marginTop: '2px'
                              }}
                            >
                              <WidgetIcon size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                                {w.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                                {w.description}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                <Badge variant="outline" size="sm" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                                  {w.category}
                                </Badge>
                                {w.roleVisibility && w.roleVisibility.slice(0, 2).map(r => (
                                  <span
                                    key={r}
                                    style={{
                                      fontSize: '0.68rem',
                                      backgroundColor: '#F3F4F6',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      color: '#4B5563'
                                    }}
                                  >
                                    {r}
                                  </span>
                                ))}
                                {w.roleVisibility && w.roleVisibility.length > 2 && (
                                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                                    +{w.roleVisibility.length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
                            <input
                              type="checkbox"
                              checked={w.enabled}
                              onChange={() => handleToggleEnabled(w.id)}
                              style={{ cursor: 'pointer', accentColor: 'var(--color-teal)' }}
                            />
                            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: w.enabled ? '#16A34A' : '#6B7280' }}>
                              {w.enabled ? 'Active' : 'Hidden'}
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <select
                            value={w.columnSpan}
                            disabled={!w.enabled}
                            onChange={(e) => handleSpanChange(w.id, e.target.value)}
                            style={{
                              padding: '4px 6px',
                              fontSize: '0.72rem',
                              border: '1px solid var(--color-border)',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: w.enabled ? '#FFFFFF' : '#F3F4F6',
                              outline: 'none',
                              cursor: w.enabled ? 'pointer' : 'not-allowed'
                            }}
                          >
                            <option value={1}>1 Col</option>
                            <option value={2}>2 Cols</option>
                            <option value={3}>3 Cols</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveUp(w.id)}
                              disabled={isFirst}
                              title="Move Up"
                              style={{
                                border: '1px solid var(--color-border)',
                                background: '#FFFFFF',
                                padding: '3px 5px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: isFirst ? 'not-allowed' : 'pointer',
                                opacity: isFirst ? 0.35 : 1,
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(w.id)}
                              disabled={isLast}
                              title="Move Down"
                              style={{
                                border: '1px solid var(--color-border)',
                                background: '#FFFFFF',
                                padding: '3px 5px',
                                borderRadius: 'var(--radius-sm)',
                                cursor: isLast ? 'not-allowed' : 'pointer',
                                opacity: isLast ? 0.35 : 1,
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Live Interactive Dashboard Layout Preview */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-subtle)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={15} style={{ color: 'var(--color-teal)' }} />
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  Interactive Layout Preview
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                Rendered across {gridColumns} CSS columns ({enabledWidgets} active widgets)
              </p>
            </div>
            <Badge variant="teal" size="sm">Live Mock</Badge>
          </div>

          <div
            style={{
              padding: '16px',
              backgroundColor: '#F8FAFC',
              minHeight: '440px',
              maxHeight: '620px',
              overflowY: 'auto'
            }}
          >
            {enabledWidgets === 0 ? (
              <div
                style={{
                  height: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  gap: '12px'
                }}
              >
                <AlertCircle size={32} style={{ color: '#D97706' }} />
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>All Widgets Hidden</div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Enable at least one widget to view the operational dashboard preview.
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
                  gap: '12px'
                }}
              >
                {widgets
                  .filter(w => w.enabled)
                  .map((w) => {
                    const WidgetIcon = getWidgetIcon(w.category);
                    const effectiveSpan = Math.min(w.columnSpan, gridColumns);

                    return (
                      <div
                        key={w.id}
                        style={{
                          gridColumn: `span ${effectiveSpan}`,
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                padding: '4px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(15, 118, 110, 0.1)',
                                color: 'var(--color-teal)'
                              }}
                            >
                              <WidgetIcon size={14} />
                            </div>
                            <span style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                              {w.name}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--color-text-muted)',
                              backgroundColor: '#F1F5F9',
                              padding: '1px 5px',
                              borderRadius: '3px'
                            }}
                          >
                            {effectiveSpan} Col{effectiveSpan > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Widget Preview Content */}
                        <div style={{ padding: '8px 0', borderTop: '1px dashed #F1F5F9', borderBottom: '1px dashed #F1F5F9' }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                            {w.metrics?.primary || '—'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {w.metrics?.secondary || w.description}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                          <span style={{ color: '#16A34A', fontWeight: '600' }}>
                            ● {w.metrics?.trend || 'Operational'}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            Order #{w.order}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
