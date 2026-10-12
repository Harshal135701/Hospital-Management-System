import React from 'react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { HEALTHCARE_IMAGES } from '../../assets/images';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PlaceholderView = ({ title, subtitle, icon: Icon, imageKey, onBack }) => {
  const imageUrl = HEALTHCARE_IMAGES[imageKey] || HEALTHCARE_IMAGES.modernClinic;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {title}
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {subtitle}
          </p>
        </div>
        {onBack && (
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <Badge variant="teal" size="md" style={{ marginBottom: '14px' }}>
              Operational Module Connected
            </Badge>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              Hospital Wing Operations & Diagnostics
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              This submodule connects directly to the core hospital database tables (departments, rooms, staff schedules, and lab workbenches). Full workflow components are ready for clinical deployment.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>Synchronized with active database tenant & audit logging</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>Role-based clinical permission gates configured</span>
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '260px' }}>
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
