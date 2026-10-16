import React from 'react';
import {
  User,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Building2,
  Stethoscope,
  Droplet
} from 'lucide-react';
import { Badge, Button } from '../common/UIPrimitives';

export const PatientBanner = ({ patient, onBackToQueue, onStatusChange }) => {
  if (!patient) return null;

  const hasAllergies = patient.allergies && patient.allergies.length > 0 && !patient.allergies.includes('None known');

  const statusVariant = {
    waiting: 'warning',
    in_consultation: 'teal',
    completed: 'success'
  }[patient.status] || 'gray';

  const statusLabel = {
    waiting: 'Waiting for Doctor',
    in_consultation: 'In Active Consultation',
    completed: 'Consultation Completed'
  }[patient.status] || patient.status;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        padding: '16px 20px',
        marginBottom: '20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '14px'
        }}
      >
        {/* Left: Patient Primary Identification */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '2px solid rgba(8, 127, 140, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-teal)',
              fontWeight: '700',
              fontSize: '1.1rem',
              flexShrink: 0
            }}
          >
            {patient.patient_name ? patient.patient_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : <User size={20} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.01em'
                }}
              >
                {patient.patient_name}
              </h2>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  color: 'var(--color-primary-teal)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(8, 127, 140, 0.2)'
                }}
              >
                {patient.uhid}
              </span>
              <Badge variant={statusVariant} size="sm">
                {statusLabel}
              </Badge>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginTop: '4px',
                fontSize: '0.82rem',
                color: 'var(--color-text-secondary)',
                flexWrap: 'wrap'
              }}
            >
              <span>
                <strong>Demographics:</strong> {patient.age} yrs • {patient.gender}
              </span>

              {patient.blood_group && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Droplet size={13} color="var(--color-blood-crimson)" />
                  <strong>Blood Group:</strong>
                  <span
                    style={{
                      fontWeight: '700',
                      color: 'var(--color-blood-crimson)',
                      backgroundColor: 'var(--color-blood-bg)',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    {patient.blood_group}
                  </span>
                </span>
              )}

              <span>
                <strong>Encounter:</strong> {patient.appointment_number}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            onClick={onBackToQueue}
            title="Return to OPD Patient Queue"
          >
            OPD Queue
          </Button>

          {patient.status === 'waiting' && onStatusChange && (
            <Button
              variant="primary"
              size="sm"
              icon={Stethoscope}
              onClick={() => onStatusChange('in_consultation')}
            >
              Begin Consultation
            </Button>
          )}
        </div>
      </div>

      {/* Secondary Meta Row: Encounter Details & Allergy Alert */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '12px',
          fontSize: '0.8rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', color: 'var(--color-text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Calendar size={14} color="var(--color-primary-teal)" />
            <span>Time: <strong>{patient.appointment_time}</strong></span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Building2 size={14} color="var(--color-primary-teal)" />
            <span>Department: <strong>{patient.department}</strong></span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Stethoscope size={14} color="var(--color-primary-teal)" />
            <span>Clinician: <strong>{patient.doctor_name}</strong></span>
          </span>
        </div>

        {/* Allergies Highlight Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {hasAllergies ? (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error-border)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '600',
                fontSize: '0.78rem'
              }}
            >
              <AlertTriangle size={14} />
              <span>Allergies: {patient.allergies.join(', ')}</span>
            </div>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                backgroundColor: '#F8FAFA',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <span>Allergies: No known allergies documented</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
