import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Activity,
  FileText,
  Stethoscope,
  Pill,
  Droplet,
  FlaskConical,
  Paperclip,
  CheckCircle2,
  Filter,
  Search,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { formatDateTimeIN } from '../../utils/formatters';

export function PatientTimeline({
  selectedPatient,
  timelineEvents,
  onRefreshTimeline
}) {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = useMemo(() => {
    return timelineEvents.filter(ev => {
      const matchType = filterType === 'all' || ev.event_type === filterType;
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.summary || '').toLowerCase().includes(q) ||
        (ev.department || '').toLowerCase().includes(q) ||
        (ev.clinician || '').toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [timelineEvents, filterType, searchTerm]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'CONSULTATION':
        return <Stethoscope size={16} />;
      case 'LABORATORY':
        return <FlaskConical size={16} />;
      case 'DAYCARE':
        return <Activity size={16} />;
      case 'PRESCRIPTION':
        return <Pill size={16} />;
      case 'DOCUMENT':
        return <Paperclip size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Patient Demographic Banner */}
      {selectedPatient && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '1.1rem'
              }}
            >
              {selectedPatient.full_name ? selectedPatient.full_name[0] : 'P'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                  {selectedPatient.full_name || selectedPatient.name}
                </span>
                <Badge variant="teal">{selectedPatient.uhid}</Badge>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                {selectedPatient.gender} • {selectedPatient.age || 'Adult'} • Blood Group: <strong>{selectedPatient.blood_group || 'O+'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', padding: '4px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: '#F0FDF4', color: 'var(--color-success)', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              ✓ Longitudinal Record Synchronized
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search timeline encounters, findings, diagnostics or medications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Clinical Events</option>
            <option value="CONSULTATION">Doctor Consultations</option>
            <option value="DAYCARE">Day Care & Procedures</option>
            <option value="LABORATORY">Diagnostic Lab Reports</option>
            <option value="PRESCRIPTION">Medication Prescriptions</option>
            <option value="DOCUMENT">Document Uploads</option>
          </select>
        </div>
      </div>

      {/* Chronological Vertical Timeline Card */}
      <Card
        title={`Longitudinal Unified Patient Journey (${filteredEvents.length} touchpoints)`}
        subtitle="Chronological audit of outpatient consultations, day-care episodes, prescriptions, and lab tests."
      >
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No clinical events match search criteria.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>All clinical encounters across OPD, IPD, and Day Care will appear here.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Vertical timeline spine */}
            <div
              style={{
                position: 'absolute',
                left: '11px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                backgroundColor: 'var(--color-border)'
              }}
            />

            {filteredEvents.map(event => (
              <div key={event.id} style={{ position: 'relative', display: 'flex', gap: '16px' }}>
                {/* Node Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-24px',
                    top: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    border: '2px solid var(--color-primary-teal)',
                    color: 'var(--color-primary-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                  }}
                >
                  {getEventIcon(event.event_type)}
                </div>

                {/* Event Card Content */}
                <div
                  style={{
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
                        {event.title}
                      </span>
                      <Badge variant={event.badgeVariant || 'teal'}>
                        {event.event_type}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {formatDateTimeIN(event.timestamp)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Department: <strong>{event.department}</strong></span>
                    <span>•</span>
                    <span>Clinician: <strong>{event.clinician}</strong></span>
                  </div>

                  <div style={{ fontSize: '0.84rem', color: 'var(--color-text-primary)', lineHeight: 1.45, marginTop: '2px' }}>
                    {event.summary}
                  </div>

                  {event.metadata && (
                    <div
                      style={{
                        marginTop: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border-subtle)',
                        fontSize: '0.76rem',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      {Object.entries(event.metadata).map(([k, v]) => (
                        <div key={k}>
                          <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                          <strong style={{ color: 'var(--color-text-primary)' }}>{String(v)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
