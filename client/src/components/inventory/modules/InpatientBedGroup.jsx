import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_BEDS, INITIAL_IPD_ADMISSIONS } from '../inventoryMockData';

export function InpatientBedGroup({ activeSubtab = '17.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [admissions, setAdmissions] = useState(INITIAL_IPD_ADMISSIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWardFilter, setSelectedWardFilter] = useState('ALL');
  const [notification, setNotification] = useState('');

  // Modals state
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form states
  const [admitForm, setAdmitForm] = useState({
    patientName: '',
    uhid: '',
    age: '',
    gender: 'Male',
    bedNumber: 'BED-102',
    ward: 'General Ward - Male',
    doctor: 'Dr. Arindam Mitra',
    diagnosis: '',
    depositPaid: 20000
  });

  const [transferForm, setTransferForm] = useState({
    targetBed: 'BED-202',
    reason: 'Clinical stability improvement / Ward step-down'
  });

  const [dischargeSummaryText, setDischargeSummaryText] = useState('Patient recovered with satisfactory hemodynamics. Advised oral medications for 5 days. Review after 1 week.');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Submit Admission
  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!admitForm.patientName || !admitForm.uhid) return;

    // Check if bed is already occupied
    const targetBed = beds.find(b => b.id === admitForm.bedNumber);
    if (targetBed && targetBed.status === 'Occupied') {
      alert('Selected bed is currently occupied. Please choose an available bed.');
      return;
    }

    const newAdm = {
      id: `IPD-2026-${95 + admissions.length}`,
      uhid: admitForm.uhid,
      patientName: admitForm.patientName,
      age: Number(admitForm.age) || 40,
      gender: admitForm.gender,
      bedNumber: admitForm.bedNumber,
      ward: admitForm.ward,
      doctor: admitForm.doctor,
      diagnosis: admitForm.diagnosis || 'Under Evaluation',
      admitDate: new Date().toISOString().split('T')[0],
      los: 1,
      depositPaid: Number(admitForm.depositPaid),
      runningBill: Number(admitForm.depositPaid) * 0.4,
      status: 'Active'
    };

    // Update bed status
    setBeds(prev => prev.map(b => b.id === admitForm.bedNumber ? {
      ...b,
      patientName: admitForm.patientName,
      uhid: admitForm.uhid,
      admittingDoc: admitForm.doctor,
      status: 'Occupied',
      admissionDate: newAdm.admitDate
    } : b));

    setAdmissions([newAdm, ...admissions]);
    setIsAdmitModalOpen(false);
    showToast(`Patient ${newAdm.patientName} admitted to ${newAdm.bedNumber}`);
  };

  // Transfer Bed
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const oldBed = selectedPatient.bedNumber;
    const newBedId = transferForm.targetBed;

    // Update beds
    setBeds(prev => prev.map(b => {
      if (b.id === oldBed) {
        return { ...b, patientName: '', uhid: '', admittingDoc: '', status: 'Available', cleaningStatus: 'Needs Sanitization' };
      }
      if (b.id === newBedId) {
        return { ...b, patientName: selectedPatient.patientName, uhid: selectedPatient.uhid, admittingDoc: selectedPatient.doctor, status: 'Occupied', cleaningStatus: 'Clean' };
      }
      return b;
    }));

    // Update admission record
    setAdmissions(prev => prev.map(adm => adm.id === selectedPatient.id ? { ...adm, bedNumber: newBedId } : adm));
    setIsTransferModalOpen(false);
    showToast(`Transferred ${selectedPatient.patientName} from ${oldBed} to ${newBedId}`);
  };

  // Final Discharge
  const handleDischargeConfirm = () => {
    if (!selectedPatient) return;
    const bedId = selectedPatient.bedNumber;

    // Release bed
    setBeds(prev => prev.map(b => b.id === bedId ? {
      ...b,
      patientName: '',
      uhid: '',
      admittingDoc: '',
      status: 'Available',
      cleaningStatus: 'Needs Sanitization'
    } : b));

    // Mark admission discharged
    setAdmissions(prev => prev.map(adm => adm.id === selectedPatient.id ? { ...adm, status: 'Discharged' } : adm));
    setIsDischargeModalOpen(false);
    showToast(`Patient ${selectedPatient.patientName} discharged and bed ${bedId} marked for cleaning.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 17.1: Admission Desk & Form */}
      {activeSubtab === '17.1' && (
        <Card
          title="Inpatient Admission Desk & Registration Form"
          subtitle="Direct IPD admission capture, consultant assignment, room tariff category, and initial advance deposits"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsAdmitModalOpen(true)}>
              New Inpatient Admission
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Quick Admission Check</h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                Ensure pre-authorization clearance for cashless corporate insurance before assigning Deluxe or Private rooms.
              </p>
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="outline" onClick={() => setIsAdmitModalOpen(true)}>
                  Open Admission Portal
                </Button>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(100,216,208,0.3)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>CURRENT INPATIENT CENSUS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                {admissions.filter(a => a.status === 'Active').length} Active Patients
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Bed Occupancy Rate: {Math.round((beds.filter(b => b.status === 'Occupied').length / beds.length) * 100)}%
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 17.2: My IP Admissions Dashboard */}
      {activeSubtab === '17.2' && (
        <Card
          title="My IP Admissions Dashboard"
          subtitle="Real-time inpatient department census, treating consultant distribution, and accrued running bills"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>IPD Number</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Bed / Ward</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Admitting Clinician</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Clinical Diagnosis</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>LOS</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Running Bill</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm) => (
                  <tr key={adm.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{adm.id}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{adm.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>
                      {adm.patientName} <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>({adm.gender}, {adm.age})</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontWeight: '600' }}>{adm.bedNumber}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{adm.ward}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{adm.doctor}</td>
                    <td style={{ padding: '10px 14px' }}>{adm.diagnosis}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{adm.los} Days</td>
                    <td style={{ padding: '10px 14px', fontWeight: '700' }}>₹{adm.runningBill.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={adm.status === 'Active' ? 'success' : adm.status === 'Discharge Initiated' ? 'warning' : 'gray'}>
                        {adm.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {adm.status !== 'Discharged' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedPatient(adm);
                              setIsTransferModalOpen(true);
                            }}>
                              Transfer
                            </Button>
                            <Button size="sm" variant="primary" onClick={() => {
                              setSelectedPatient(adm);
                              setIsDischargeModalOpen(true);
                            }}>
                              Discharge
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 17.3: Live Bed Matrix / Bed Board */}
      {activeSubtab === '17.3' && (
        <Card
          title="Interactive Live Bed Matrix & Bed Board"
          subtitle="Real-time graphical status of ward beds, occupancy tags, and terminal cleaning states"
        >
          {/* Bed Legend */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', flexWrap: 'wrap', fontSize: '0.75rem', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10B981' }} />
              <span>Available Clean</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#EF4444' }} />
              <span>Occupied</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F59E0B' }} />
              <span>Needs Sanitization</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#9CA3AF' }} />
              <span>Under Maintenance</span>
            </div>
          </div>

          {/* Grid of Beds */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            {beds.map((b) => {
              const isOccupied = b.status === 'Occupied';
              const isClean = b.cleaningStatus === 'Clean';

              return (
                <div
                  key={b.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isOccupied ? '#FCA5A5' : isClean ? '#A7F3D0' : '#FDE68A'}`,
                    backgroundColor: isOccupied ? '#FEF2F2' : isClean ? '#ECFDF5' : '#FFFBEB',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{b.id}</div>
                    <Badge variant={isOccupied ? 'danger' : isClean ? 'success' : 'warning'}>
                      {b.status}
                    </Badge>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    {b.ward} ({b.type})
                  </div>

                  {isOccupied ? (
                    <div style={{ borderTop: '1px dashed #F87171', paddingTop: '6px', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: '700', color: '#991B1B' }}>{b.patientName}</div>
                      <div style={{ color: '#7F1D1D', fontSize: '0.7rem' }}>{b.uhid}</div>
                      <div style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>{b.admittingDoc}</div>
                    </div>
                  ) : (
                    <div style={{ borderTop: '1px dashed #34D399', paddingTop: '6px', fontSize: '0.75rem', color: '#065F46' }}>
                      Housekeeping: <strong>{b.cleaningStatus}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SUBMODULE 17.4: Bed Transfer Management */}
      {activeSubtab === '17.4' && (
        <Card
          title="Bed Transfer & Ward Step-Down Management"
          subtitle="Inter-ward transfers, ICU escalation or step-down requests, and clinical handovers"
        >
          <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '0.88rem' }}>Active Transfer Requests</h4>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              1 pending transfer request for Gurdeep Singh (BED-ICU-01 → Step-down HDU).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="sm" variant="primary" onClick={() => {
              if (admissions.length > 0) {
                setSelectedPatient(admissions[0]);
                setIsTransferModalOpen(true);
              }
            }}>
              Initiate Patient Bed Transfer
            </Button>
          </div>
        </Card>
      )}

      {/* SUBMODULE 17.5: Inpatient Doctor Daily Rounds */}
      {activeSubtab === '17.5' && (
        <Card
          title="Inpatient Doctor Daily Rounds"
          subtitle="Consultant bedside reviews, clinical progress recordings, and medication titration notes"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {admissions.filter(a => a.status === 'Active').map((adm) => (
              <div key={adm.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>
                    {adm.patientName} — {adm.bedNumber} ({adm.ward})
                  </div>
                  <Badge variant="teal">Round Pending Today</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Treating Doctor: {adm.doctor} • Diagnosis: {adm.diagnosis}
                </div>
                <div style={{ marginTop: '10px' }}>
                  <Button size="sm" variant="outline" onClick={() => showToast(`Recorded daily round notes for ${adm.patientName}`)}>
                    Record Round Progress Note
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 17.6: Discharge Process & Summary */}
      {activeSubtab === '17.6' && (
        <Card
          title="Discharge Process & Clinical Summary"
          subtitle="Final clinical clearance, medication discharge prescription, and hospital gatepass generation"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {admissions.map((adm) => (
              <div key={adm.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{adm.patientName} ({adm.uhid})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Bed: {adm.bedNumber} • Doctor: {adm.doctor} • LOS: {adm.los} Days
                  </div>
                </div>
                <Button size="sm" variant={adm.status === 'Discharged' ? 'outline' : 'primary'} onClick={() => {
                  setSelectedPatient(adm);
                  setIsDischargeModalOpen(true);
                }}>
                  {adm.status === 'Discharged' ? 'View Discharge Summary' : 'Process Discharge'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New Admission */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Inpatient Admission Desk"
        subtitle="Admit patient and allocate hospital bed"
      >
        <form onSubmit={handleAdmitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Full Name"
              required
              value={admitForm.patientName}
              placeholder="e.g. Rameshwar Teli"
              onChange={(e) => setAdmitForm({ ...admitForm, patientName: e.target.value })}
            />
            <Input
              label="UHID Number"
              required
              value={admitForm.uhid}
              placeholder="e.g. UHID-2026-0412"
              onChange={(e) => setAdmitForm({ ...admitForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Age"
              type="number"
              value={admitForm.age}
              placeholder="e.g. 48"
              onChange={(e) => setAdmitForm({ ...admitForm, age: e.target.value })}
            />
            <Select
              label="Gender"
              value={admitForm.gender}
              onChange={(e) => setAdmitForm({ ...admitForm, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Select Available Bed"
              value={admitForm.bedNumber}
              onChange={(e) => setAdmitForm({ ...admitForm, bedNumber: e.target.value })}
              options={beds.filter(b => b.status === 'Available').map(b => ({ value: b.id, label: `${b.id} (${b.ward})` }))}
            />
            <Select
              label="Admitting Doctor"
              value={admitForm.doctor}
              onChange={(e) => setAdmitForm({ ...admitForm, doctor: e.target.value })}
              options={['Dr. Arindam Mitra', 'Dr. Sunita Rao', 'Dr. Ananya Sharma', 'Dr. Pradeep K. Sharma', 'Dr. Sandeep Kulkarni']}
            />
          </div>

          <Input
            label="Provisional Diagnosis"
            value={admitForm.diagnosis}
            placeholder="e.g. Acute exacerbation of COPD"
            onChange={(e) => setAdmitForm({ ...admitForm, diagnosis: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsAdmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Admission & Allot Bed</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Bed Transfer */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Inpatient Bed"
        subtitle={selectedPatient ? `Transferring ${selectedPatient.patientName} from ${selectedPatient.bedNumber}` : ''}
      >
        <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select
            label="Select Destination Available Bed"
            value={transferForm.targetBed}
            onChange={(e) => setTransferForm({ ...transferForm, targetBed: e.target.value })}
            options={beds.filter(b => b.status === 'Available').map(b => ({ value: b.id, label: `${b.id} (${b.ward})` }))}
          />
          <Input
            label="Clinical Transfer Reason"
            value={transferForm.reason}
            onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Execute Transfer</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Discharge Summary */}
      <Modal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        title="Discharge Process & Summary"
        subtitle={selectedPatient ? `Patient: ${selectedPatient.patientName} (${selectedPatient.uhid})` : ''}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div>Consultant: <strong>{selectedPatient?.doctor}</strong></div>
            <div>Bed Number: <strong>{selectedPatient?.bedNumber}</strong></div>
            <div>Diagnosis: <strong>{selectedPatient?.diagnosis}</strong></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Clinical Discharge Instructions & Summary</label>
            <textarea
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '0.82rem'
              }}
              value={dischargeSummaryText}
              onChange={(e) => setDischargeSummaryText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsDischargeModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={handleDischargeConfirm}>Sign Clearance & Release Bed</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
