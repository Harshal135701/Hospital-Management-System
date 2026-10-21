import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { MODULE_GROUPS, SUBMODULES } from './submoduleRegistry';

export function GroupDashboardView({ groupId, onBackToLanding, onSelectSubmodule }) {
  const currentGroup = MODULE_GROUPS.find(g => g.id === groupId) || MODULE_GROUPS[0];
  const groupSubmodules = SUBMODULES.filter(s => s.groupId === groupId);
  const GroupIcon = currentGroup.icon || Calendar;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}
      >
        <button
          type="button"
          onClick={onBackToLanding}
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
          <Calendar size={14} />
          <span>Appointments</span>
        </button>
        <span style={{ color: 'var(--color-text-muted)' }}>/</span>
        <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
          {currentGroup.label}
        </span>
      </nav>

      {/* Level 2: Group Overview Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 5px rgba(8, 127, 140, 0.15)'
            }}
          >
            <GroupIcon size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.45rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em'
                }}
              >
                {currentGroup.label}
              </h1>
              <Badge variant="teal" size="sm">
                {groupSubmodules.length} Nested Sub-modules
              </Badge>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                maxWidth: '700px'
              }}
            >
              {currentGroup.description}
            </p>
          </div>
        </div>

        {/* Back to Directory Button */}
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          onClick={onBackToLanding}
        >
          All Functional Groups
        </Button>
      </div>

      {/* Section Sub-heading */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            Available Workspaces & Workflows
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
            Select a specialized workspace below to begin clinical, operational, or administrative work.
          </p>
        </div>
      </div>

      {/* Level 2: Nested Sub-modules Cards (ONLY for this group) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px'
        }}
      >
        {groupSubmodules.map((submodule) => {
          const SubIcon = submodule.icon || GroupIcon;

          return (
            <div
              key={submodule.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease'
              }}
              className="submodule-card"
            >
              <div>
                {/* Header row with Icon and Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-pale-aqua)',
                      color: 'var(--color-primary-teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <SubIcon size={20} />
                  </div>
                  {submodule.badge && (
                    <Badge variant="neutral" size="sm">
                      {submodule.badge}
                    </Badge>
                  )}
                </div>

                {/* Submodule Title */}
                <h3
                  style={{
                    margin: '0 0 6px',
                    fontSize: '1.02rem',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  {submodule.title}
                </h3>

                {/* Submodule Description */}
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: '0.82rem',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.45,
                    minHeight: '44px'
                  }}
                >
                  {submodule.subtitle}
                </p>
              </div>

              {/* Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '500' }}>
                    Active Workspace
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelectSubmodule(submodule.id)}
                  style={{ gap: '6px' }}
                >
                  <span>Open Workspace</span>
                  <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GroupDashboardView;
