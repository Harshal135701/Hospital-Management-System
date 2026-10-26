import React, { useState, useMemo } from 'react';
// import { FileText, Search,  } from 'lucide-react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Search,
  Filter,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Eye,
  Pill,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { formatDateTimeIN, formatDateIN } from '../../utils/formatters';

export function EncountersBrowser({
  selectedPatient,
  encounters,
  onRefreshEncounters
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEncounter, setSelectedEncounter] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRepeatRxModalOpen, setIsRepeatRxModalOpen] = useState(false);

  const filteredEncounters = useMemo(() => {
    return encounters.filter(enc => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (enc.department || '').toLowerCase().includes(q) ||
        (enc.doctor_name || '').toLowerCase().includes(q) ||
        (enc.chief_complaint || '').toLowerCase().includes(q) ||
        (enc.diagnosis || '').toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || enc.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [encounters, searchTerm, statusFilter]);

  const handleOpenDetail = (enc) => {
    setSelectedEncounter(enc);
    setIsDetailModalOpen(true);
  };

  const handleOpenRepeatRx = (enc) => {
    setSelectedEncounter(enc);
    setIsRepeatRxModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search and Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search encounter history by clinician, department, chief complaint, diagnosis..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Encounter States</option>
            <option value="completed">Completed</option>
            <option value="in_consultation">In Consultation</option>
            <option value="arrived">Arrived</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* Encounters History Table Card */}
      <Card
        title={`Clinical Encounters History for ${selectedPatient ? selectedPatient.full_name : 'Patient'} (${filteredEncounters.length})`}
        subtitle="Historical outpatient consultation visits, triage assessments, and clinical observations."
      >
        {filteredEncounters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Stethoscope size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No clinical encounters found.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>All completed outpatient visits and inpatient consultations will appear here.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Date & Time</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Department & Clinician</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Presenting Chief Complaint</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Diagnosis / Impression</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEncounters.map(enc => (
                  <tr key={enc.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: 'var(--color-primary-teal)', whiteSpace: 'nowrap' }}>
                      {formatDateTimeIN(enc.appointment_date || enc.created_at)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {enc.doctor_name || 'Attending Clinician'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {enc.department_name || enc.department || 'Outpatient Clinic'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-primary)', lineHeight: 1.35 }}>
                        {enc.chief_complaint || enc.notes || 'Routine consultation.'}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                        {enc.diagnosis || 'Clinical evaluation completed.'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={enc.status === 'completed' ? 'success' : 'teal'}>
                        {enc.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => handleOpenDetail(enc)}
                        >
                          Review
                        </Button>
                        <Button
                          variant="soft"
                          size="sm"
                          icon={Pill}
                          onClick={() => handleOpenRepeatRx(enc)}
                        >
                          Repeat Rx
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Encounter Review Drawer / Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Encounter Detail — ${selectedEncounter?.doctor_name || 'Consultation'}`}
        subtitle="Complete clinical documentation, vital measurements, and orders."
        maxWidth="620px"
      >
        {selectedEncounter && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>Department: <strong>{selectedEncounter.department_name || selectedEncounter.department}</strong></div>
              <div>Date: <strong>{formatDateTimeIN(selectedEncounter.appointment_date || selectedEncounter.created_at)}</strong></div>
              <div>Clinician: <strong>{selectedEncounter.doctor_name}</strong></div>
              <div>Status: <strong style={{ textTransform: 'capitalize' }}>{selectedEncounter.status}</strong></div>
            </div>

            <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                Chief Complaint & Presenting Problem
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {selectedEncounter.chief_complaint || selectedEncounter.notes || 'Outpatient consultation appointment.'}
              </div>
            </div>

            <div style={{ borderLeft: '3px solid var(--color-primary-teal)', paddingLeft: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                Clinical Impression & Orders
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {selectedEncounter.diagnosis || 'Examination satisfactory. Routine symptomatic pharmacotherapy initiated.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Repeat Prescription Preview Placeholder Modal */}
      <Modal
        isOpen={isRepeatRxModalOpen}
        onClose={() => setIsRepeatRxModalOpen(false)}
        title="Repeat Past Prescription (Preview Placeholder)"
        subtitle="Review historical medication regimen before clinical re-validation."
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: '#FFFBEB',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: '#92400E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <AlertTriangle size={16} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
            <span>
              <strong>Clinical Guard:</strong> Automatic repeat prescribing is locked in read-only preview until physician contraindication re-check is completed.
            </span>
          </div>

          <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', fontSize: '0.82rem' }}>
            <div style={{ fontWeight: '600', color: 'var(--color-primary-teal)', marginBottom: '8px' }}>
              Previous Meds from Encounter ({selectedEncounter?.doctor_name}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>• Tab Augmentin 625mg (1 Tab BD x 7 Days)</div>
              <div>• Tab Pan-40 40mg (1 Tab OD before food x 10 Days)</div>
              <div>• Tab Dolo 650mg (1 Tab PRN for fever)</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsRepeatRxModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                alert('Repeat prescription staged in E-Prescription Studio for physician re-authorization.');
                setIsRepeatRxModalOpen(false);
              }}
            >
              Stage in Rx Studio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
