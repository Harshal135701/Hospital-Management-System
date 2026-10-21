import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Search,
  RefreshCw,
  ChevronRight,
  Clock,
  Users,
  CheckCircle2,
  Activity,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { MODULE_GROUPS, SUBMODULES } from './submoduleRegistry';
import { AppointmentService, TokenManager } from '../../services/api';

export function AppointmentsLandingView({ onSelectGroup, onSelectSubmodule }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metrics, setMetrics] = useState({
    totalToday: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    cancelled: 0,
  });

  // Fetch operational metrics from PostgreSQL
  const loadMetrics = useCallback(async () => {
    if (!TokenManager.getToken()) {
      setIsLoadingMetrics(false);
      return;
    }
    setIsLoadingMetrics(true);
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const data = await AppointmentService.getAppointments({ date: todayStr });
      const aptList = Array.isArray(data) ? data : [];

      const stats = {
        totalToday: aptList.length,
        waiting: aptList.filter(a => ['waiting', 'arrived'].includes(a.status)).length,
        inConsultation: aptList.filter(a => a.status === 'in_consultation').length,
        completed: aptList.filter(a => a.status === 'completed').length,
        cancelled: aptList.filter(a => a.status === 'cancelled').length,
      };
      setMetrics(stats);
    } catch (err) {
      console.warn('[AppointmentsLandingView] Error loading metrics:', err.message);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Categories definition
  const categories = [
    { id: 'all', label: 'All Groups', count: MODULE_GROUPS.length },
    { id: 'clinical', label: 'Clinical & OPD', count: MODULE_GROUPS.filter(g => g.category === 'clinical').length },
    { id: 'diagnostic', label: 'Diagnostics & Labs', count: MODULE_GROUPS.filter(g => g.category === 'diagnostic').length },
    { id: 'operations', label: 'Operations & Billing', count: MODULE_GROUPS.filter(g => g.category === 'operations').length },
    { id: 'admin', label: 'Hospital Administration', count: MODULE_GROUPS.filter(g => g.category === 'admin').length },
  ];

  // Filtered groups based on search & category
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MODULE_GROUPS.filter(group => {
      // Category match
      if (selectedCategory !== 'all' && group.category !== selectedCategory) {
        return false;
      }
      // Query match (group title, description, or any child submodule title)
      if (!q) return true;

      const groupMatches =
        group.label.toLowerCase().includes(q) ||
        (group.description && group.description.toLowerCase().includes(q));

      const childMatches = SUBMODULES.some(
        sub => sub.groupId === group.id && (
          sub.title.toLowerCase().includes(q) ||
          (sub.subtitle && sub.subtitle.toLowerCase().includes(q))
        )
      );

      return groupMatches || childMatches;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Level 1: Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(8, 127, 140, 0.15)'
              }}
            >
              <Calendar size={22} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                Appointments & Operations Directory
              </h1>
            </div>
          </div>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            Central clinical workflow directory — outpatient consultation bookings, shift rosters, queue management, and specialized service desks.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isLoadingMetrics}
            onClick={loadMetrics}
            title="Refresh operational statistics"
          >
            Sync
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={Users}
            onClick={() => onSelectSubmodule('3.3')}
          >
            Queue Display
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => onSelectSubmodule('3.1')}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Operational Metrics Cards (Using Real Data) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Calendar size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Today's Scheduled
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {isLoadingMetrics ? '...' : metrics.totalToday}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Active consultations
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Waiting in Queue
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '700', color: '#B45309', lineHeight: 1.2 }}>
              {isLoadingMetrics ? '...' : metrics.waiting}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Checked-in patients
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#EDE9FE',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Consultation
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '700', color: '#6D28D9', lineHeight: 1.2 }}>
              {isLoadingMetrics ? '...' : metrics.inConsultation}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Currently with doctor
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-bg, #DEF7EC)',
              color: 'var(--color-success, #03543F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed Today
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-success, #03543F)', lineHeight: 1.2 }}>
              {isLoadingMetrics ? '...' : metrics.completed}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Discharged / Prescribed
            </div>
          </div>
        </div>
      </div>

      {/* Directory Search & Category Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'var(--color-bg-soft-cyan)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              flex: '1 1 280px',
              minWidth: '240px'
            }}
          >
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search functional groups or nested sub-modules (e.g. roster, billing, ivf, triage, cpoe)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                width: '100%',
                fontSize: 'var(--font-size-sm)',
                outline: 'none',
                color: 'var(--color-text-primary)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '0 4px' }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
            Showing <strong>{filteredGroups.length}</strong> of {MODULE_GROUPS.length} Functional Groups
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Filter Category:
          </span>
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: isCatActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                  backgroundColor: isCatActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isCatActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isCatActive ? '600' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '1px 5px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isCatActive ? 'var(--color-primary-teal)' : 'var(--color-bg-soft-cyan)',
                    color: isCatActive ? '#FFFFFF' : 'var(--color-text-muted)',
                    fontWeight: '600'
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level 1: Functional Groups Directory (30 Groups) */}
      {filteredGroups.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}
        >
          <Search size={36} style={{ margin: '0 auto 12px', opacity: 0.35 }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
            No functional groups matched "{searchQuery}"
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Try searching for terms like "Appointment", "Billing", "Emergency", "Roster", or "Prescription".
          </p>
          <Button
            variant="outline"
            size="sm"
            style={{ marginTop: '14px' }}
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px'
          }}
        >
          {filteredGroups.map((group) => {
            const Icon = group.icon || Calendar;
            const groupSubmodules = SUBMODULES.filter(s => s.groupId === group.id);

            // Highlight submodules if search query matches
            const matchingSubmodules = searchQuery.trim()
              ? groupSubmodules.filter(s =>
                  s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
                )
              : [];

            return (
              <div
                key={group.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-subtle)',
                  transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease'
                }}
                className="group-card"
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-pale-aqua)',
                          color: 'var(--color-primary-teal)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Icon size={19} />
                      </div>
                      <div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: '0.98rem',
                            fontWeight: '600',
                            color: 'var(--color-text-primary)'
                          }}
                        >
                          {group.label}
                        </h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          {group.count} Sub-modules
                        </span>
                      </div>
                    </div>

                    <Badge variant="teal" size="sm">
                      {group.category.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Group Description */}
                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: '0.8rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.4,
                      minHeight: '36px'
                    }}
                  >
                    {group.description}
                  </p>

                  {/* Submodule Preview Pills */}
                  {matchingSubmodules.length > 0 ? (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--color-primary-teal)', marginBottom: '4px' }}>
                        Matching Sub-modules:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {matchingSubmodules.map(sub => (
                          <button
                            type="button"
                            key={sub.id}
                            onClick={() => onSelectSubmodule(sub.id)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-bg-soft-cyan)',
                              border: '1px solid rgba(8, 127, 140, 0.2)',
                              fontSize: '0.72rem',
                              color: 'var(--color-primary-teal)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontWeight: '500'
                            }}
                          >
                            <span>{sub.title}</span>
                            <ArrowRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {groupSubmodules.slice(0, 3).map(sub => (
                        <span
                          key={sub.id}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 7px',
                            backgroundColor: '#F8FBFB',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border-subtle)',
                            color: 'var(--color-text-secondary)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {sub.title}
                        </span>
                      ))}
                      {groupSubmodules.length > 3 && (
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
                          +{groupSubmodules.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    borderColor: 'var(--color-border)'
                  }}
                  onClick={() => onSelectGroup(group.id)}
                >
                  <span style={{ fontWeight: '600' }}>Open Group Dashboard</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AppointmentsLandingView;
