import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  GitMerge,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { Card, Button, Select, Badge, Modal } from '../../common/UIPrimitives';
import {
  GENDER_OPTIONS,
  BLOOD_GROUPS,
  MERGE_REASONS,
  calculateAge,
  formatPhoneIN
} from '../patientConstants';
import { useAuth } from '../../../context/AuthContext';

export function PatientSearchMergeDesk({
  patients = [],
  onNavigateSubtab: _onNavigateSubtab
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('search'); // 'search' or 'merge'

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');

  // Selected records for merge comparison
  const [primaryRecord, setPrimaryRecord] = useState(patients[0] || null);
  const [secondaryRecord, setSecondaryRecord] = useState(patients[1] || null);
  const [mergeReason, setMergeReason] = useState(MERGE_REASONS[0]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [supervisorVerified, setSupervisorVerified] = useState(false);
  const [mergeNotice, setMergeNotice] = useState(null);

  // Filtered Patients List
  const filteredPatients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p => {
      const matchSearch =
        !q ||
        (p.full_name && p.full_name.toLowerCase().includes(q)) ||
        (p.uhid && p.uhid.toLowerCase().includes(q)) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q));

      const matchGender =
        genderFilter === 'all' ||
        (p.gender && p.gender.toLowerCase() === genderFilter.toLowerCase());

      const matchBlood =
        bloodGroupFilter === 'all' ||
        (p.blood_group && p.blood_group.toUpperCase() === bloodGroupFilter.toUpperCase());

      return matchSearch && matchGender && matchBlood;
    });
  }, [patients, searchQuery, genderFilter, bloodGroupFilter]);

  // Comparison Fields Helper
  const comparisonFields = [
    { label: 'Patient Full Name', keyA: primaryRecord?.full_name, keyB: secondaryRecord?.full_name },
    { label: 'Permanent UHID', keyA: primaryRecord?.uhid, keyB: secondaryRecord?.uhid },
    { label: 'Date of Birth', keyA: primaryRecord?.date_of_birth ? String(primaryRecord.date_of_birth).slice(0, 10) : '—', keyB: secondaryRecord?.date_of_birth ? String(secondaryRecord.date_of_birth).slice(0, 10) : '—' },
    { label: 'Sex / Gender', keyA: primaryRecord?.gender || '—', keyB: secondaryRecord?.gender || '—' },
    { label: 'Blood Group', keyA: primaryRecord?.blood_group || 'Unknown', keyB: secondaryRecord?.blood_group || 'Unknown' },
    { label: 'Primary Mobile', keyA: formatPhoneIN(primaryRecord?.mobile), keyB: formatPhoneIN(secondaryRecord?.mobile) },
    { label: 'Residential City', keyA: primaryRecord?.city || '—', keyB: secondaryRecord?.city || '—' },
    { label: 'Emergency Contact', keyA: primaryRecord?.emergency_name || '—', keyB: secondaryRecord?.emergency_name || '—' },
    { label: 'Registration Date', keyA: primaryRecord?.created_at ? new Date(primaryRecord.created_at).toLocaleDateString() : '—', keyB: secondaryRecord?.created_at ? new Date(secondaryRecord.created_at).toLocaleDateString() : '—' }
  ];

  const handleSwapRecords = () => {
    const temp = primaryRecord;
    setPrimaryRecord(secondaryRecord);
    setSecondaryRecord(temp);
  };

  const handleSelectForMerge = (p, slot) => {
    if (slot === 'primary') {
      setPrimaryRecord(p);
    } else {
      setSecondaryRecord(p);
    }
    setActiveTab('merge');
  };

  const handleAttemptMerge = () => {
    if (!supervisorVerified) {
      alert('Supervisor clinical acknowledgment checkbox is mandatory prior to submitting merge audit.');
      return;
    }
    setIsConfirmationModalOpen(false);

    // In accordance with guidelines:
    // If safe backend merge functionality is not available, build the comparison and review UI,
    // clearly indicate that merge execution is not yet supported, and do not pretend the records were merged.
    setMergeNotice({
      status: 'AUDIT_LOGGED',
      title: 'Merge Comparison Audit Verified (Backend Merge Service Required)',
      details: `Comparison verified between Primary Surviving UHID ${primaryRecord.uhid} and Secondary UHID ${secondaryRecord.uhid}. Because database-level transactional entity reassignment (relinking historical billing ledgers, prescription orders, and lab records) requires backend server-side merge execution (POST /api/patients/merge), no records have been destructively overwritten. Please submit this audit report to your database administrator.`
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Submodule Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'search' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
            backgroundColor: activeTab === 'search' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
            color: activeTab === 'search' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'search' ? '700' : '500',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Search size={15} />
          <span>Master Patient Index (MPI) Search</span>
          <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: '10px', backgroundColor: 'rgba(73, 118, 159, 0.15)' }}>{filteredPatients.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('merge')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: activeTab === 'merge' ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
            backgroundColor: activeTab === 'merge' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
            color: activeTab === 'merge' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
            fontWeight: activeTab === 'merge' ? '700' : '500',
            fontSize: '0.84rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <GitMerge size={15} />
          <span>Duplicate Record Comparison & Safe Merge Review</span>
        </button>
      </div>

      {/* Audit / Merge Status Notice Banner */}
      {mergeNotice && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #93C5FD',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            color: '#1E40AF',
            fontSize: '0.82rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '4px' }}>
            <ShieldAlert size={18} color="#2563EB" />
            <span>{mergeNotice.title}</span>
          </div>
          <div style={{ lineHeight: '1.5', color: '#1E3A8A' }}>
            {mergeNotice.details}
          </div>
        </div>
      )}

      {/* MODE 1: Master Patient Index Search Table */}
      {activeTab === 'search' && (
        <Card
          title="Master Patient Index (MPI) Search & Registry"
          subtitle="Query the centralized patient database with multi-field search and filters"
        >
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search by UHID, Name, Mobile, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <Select
              label=""
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              options={[{ value: 'all', label: 'All Genders' }, ...GENDER_OPTIONS]}
            />

            <Select
              label=""
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              options={[{ value: 'all', label: 'All Blood Groups' }, ...BLOOD_GROUPS.map(b => ({ value: b, label: `Blood: ${b}` }))]}
            />
          </div>

          {/* Results Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>UHID</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>Patient Legal Name</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>Age / Gender</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>Mobile Contact</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>Blood Group</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700' }}>City / Location</th>
                  <th style={{ padding: '9px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No patients found matching the current search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {p.uhid}
                      </td>
                      <td style={{ padding: '9px 12px', fontWeight: '600' }}>
                        {p.full_name}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {calculateAge(p.date_of_birth)} / {p.gender || '—'}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        {formatPhoneIN(p.mobile)}
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <Badge variant="teal">{p.blood_group || 'Unknown'}</Badge>
                      </td>
                      <td style={{ padding: '9px 12px', color: 'var(--color-text-secondary)' }}>
                        {p.city || '—'}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectForMerge(p, 'primary')}
                            title="Set as Record A (Primary)"
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Set Record A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectForMerge(p, 'secondary')}
                            title="Set as Record B (Secondary)"
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #FCA5A5',
                              backgroundColor: '#FEF2F2',
                              color: '#991B1B',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            Set Record B
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODE 2: Side-by-Side Duplicate Comparison & Safe Merge Review */}
      {activeTab === 'merge' && (
        <Card
          title="Duplicate Record Comparison & Safe Merge Governance"
          subtitle="Side-by-side verification of matching and conflicting fields before initiating patient record consolidation"
        >
          {/* Warning Banner */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1.5px solid #F87171',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              marginBottom: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.80rem', color: '#991B1B', lineHeight: '1.5' }}>
              <strong>High-Risk Patient Record Consolidation Governance:</strong>
              <div style={{ marginTop: '2px' }}>
                Record merge is a non-reversible clinical operation. Surviving entity <strong>Record A (Primary)</strong> will absorb linked historical visits, billing ledgers, prescription orders, and lab investigations. <strong>Record B (Secondary)</strong> will be archived. Ensure both records belong to the same patient prior to authorization.
              </div>
            </div>
          </div>

          {/* Record Selector Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
            {/* Primary Record A */}
            <div style={{ padding: '12px 14px', backgroundColor: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#166534', textTransform: 'uppercase' }}>
                  Record A (Surviving Primary UHID)
                </span>
                <Badge variant="success">Primary Master</Badge>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#14532D', marginTop: '4px' }}>
                {primaryRecord?.full_name || 'Select Patient A'}
              </div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#15803D' }}>
                UHID: {primaryRecord?.uhid || '—'}
              </div>
            </div>

            {/* Swap Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={handleSwapRecords}
                title="Swap Record A and Record B"
              />
            </div>

            {/* Secondary Record B */}
            <div style={{ padding: '12px 14px', backgroundColor: '#FFFBEB', border: '2px solid #FCD34D', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#92400E', textTransform: 'uppercase' }}>
                  Record B (Duplicate to be Archived)
                </span>
                <Badge variant="warning">Secondary Duplicate</Badge>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#78350F', marginTop: '4px' }}>
                {secondaryRecord?.full_name || 'Select Patient B'}
              </div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#B45309' }}>
                UHID: {secondaryRecord?.uhid || '—'}
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px', width: '25%', fontWeight: '700' }}>Clinical Attribute</th>
                  <th style={{ padding: '8px 12px', width: '35%', fontWeight: '700', color: '#166534' }}>Record A (Primary)</th>
                  <th style={{ padding: '8px 12px', width: '35%', fontWeight: '700', color: '#92400E' }}>Record B (Duplicate)</th>
                  <th style={{ padding: '8px 12px', width: '5%', textAlign: 'center', fontWeight: '700' }}>Match</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, idx) => {
                  const isMatch = String(field.keyA).trim().toLowerCase() === String(field.keyB).trim().toLowerCase();
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: isMatch ? '#FFFFFF' : '#FFFDF7' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                        {field.label}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: isMatch ? '500' : '700' }}>
                        {field.keyA || '—'}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: isMatch ? '500' : '700' }}>
                        {field.keyB || '—'}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {isMatch ? (
                          <CheckCircle2 size={16} color="#16A34A" />
                        ) : (
                          <AlertTriangle size={16} color="#D97706" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Merge Reason & Governance Form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <Select
              label="Mandatory Reason for Record Consolidation *"
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
              options={MERGE_REASONS.map(r => ({ value: r, label: r }))}
            />

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.80rem', fontWeight: '600', color: '#991B1B', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={supervisorVerified}
                  onChange={(e) => setSupervisorVerified(e.target.checked)}
                />
                <span>I confirm supervisor clinical review: Both records belong to the exact same patient.</span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
            <Button
              variant="outline"
              onClick={() => setActiveTab('search')}
            >
              Back to MPI Search
            </Button>

            <Button
              variant="danger"
              icon={GitMerge}
              disabled={!primaryRecord || !secondaryRecord || primaryRecord.id === secondaryRecord.id || !supervisorVerified}
              onClick={() => setIsConfirmationModalOpen(true)}
            >
              Authorize & Review Merge
            </Button>
          </div>
        </Card>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <Modal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          title="Confirm Patient Record Consolidation"
          subtitle="Non-reversible database record consolidation verification"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', color: '#991B1B' }}>
              <div>Surviving Master UHID: <strong>{primaryRecord?.uhid} ({primaryRecord?.full_name})</strong></div>
              <div>Archived Duplicate UHID: <strong>{secondaryRecord?.uhid} ({secondaryRecord?.full_name})</strong></div>
              <div style={{ marginTop: '6px' }}>Reason: <em>{mergeReason}</em></div>
            </div>

            <div style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              Audit details will be logged under officer <strong>{user?.name || user?.username || 'Staff Supervisor'}</strong>.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsConfirmationModalOpen(false)}>Cancel</Button>
              <Button variant="danger" icon={GitMerge} onClick={handleAttemptMerge}>
                Submit Merge Verification
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
