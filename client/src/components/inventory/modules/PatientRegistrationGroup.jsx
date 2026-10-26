import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Printer,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_PATIENT_RECORDS } from '../inventoryMockData';

export function PatientRegistrationGroup({ activeSubtab = '24.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [patients, setPatients] = useState(INITIAL_PATIENT_RECORDS);
  const [notification, setNotification] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSmartCardModalOpen, setIsSmartCardModalOpen] = useState(false);
  const [selectedPatientForCard, setSelectedPatientForCard] = useState(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  // Form state
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
    aadhaar: '',
    bloodGroup: 'B positive',
    address: ''
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!newPatient.fullName || !newPatient.phone) return;

    const uhidNum = `UHID-2026-${1200 + patients.length + 1}`;
    const registered = {
      id: `PAT-0${patients.length + 1}`,
      uhid: uhidNum,
      fullName: newPatient.fullName,
      age: Number(newPatient.age) || 30,
      gender: newPatient.gender,
      phone: newPatient.phone,
      aadhaar: newPatient.aadhaar || 'XXXX-XXXX-0000',
      address: newPatient.address || 'Local City',
      bloodGroup: newPatient.bloodGroup,
      regDate: new Date().toISOString().split('T')[0],
      emergencyContact: 'Family Member'
    };

    setPatients([registered, ...patients]);
    setIsRegisterModalOpen(false);
    showToast(`Registered patient ${registered.fullName}! Generated ${registered.uhid}`);
  };

  const handleMergeConfirm = () => {
    setIsMergeModalOpen(false);
    showToast('Duplicate patient records consolidated under primary UHID-2026-0814 with full history.');
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

      {/* SUBMODULE 24.1: New Patient Registration */}
      {activeSubtab === '24.1' && (
        <Card
          title="New Patient Registration & ABHA / Aadhaar KYC"
          subtitle="Enterprise Master Patient Index (EMPI), biometric verification, and demographic profiling"
          action={
            <Button variant="primary" icon={UserPlus} size="sm" onClick={() => setIsRegisterModalOpen(true)}>
              Register New Patient
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Full Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Age / Gender</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Contact Phone</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Blood Group</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Registration Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Card Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{p.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{p.fullName}</td>
                    <td style={{ padding: '10px 14px' }}>{p.age} Yrs / {p.gender}</td>
                    <td style={{ padding: '10px 14px' }}>{p.phone}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">{p.bloodGroup}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{p.regDate}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Button size="sm" variant="outline" icon={Printer} onClick={() => {
                        setSelectedPatientForCard(p);
                        setIsSmartCardModalOpen(true);
                      }}>
                        Print UHID Card
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 24.2: UHID Generation & Smart Card Print */}
      {activeSubtab === '24.2' && (
        <Card
          title="UHID Health Smart Card Generation & Printing"
          subtitle="High-durability plastic PVC smart card print formatting with QR code and hospital seal"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {patients.map((p) => (
              <div key={p.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: '700' }}>{p.fullName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>{p.uhid}</div>
                <div style={{ marginTop: '10px' }}>
                  <Button size="sm" variant="primary" icon={Printer} onClick={() => {
                    setSelectedPatientForCard(p);
                    setIsSmartCardModalOpen(true);
                  }}>
                    Preview Smart Card
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 24.3: Create New Visit / Encounter */}
      {activeSubtab === '24.3' && (
        <Card
          title="Create New Hospital Visit & Encounter"
          subtitle="Generate OPD, IPD, Day Care, or Emergency encounter linked to active patient UHID"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '14px' }}>Quick Encounter Generator</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Select
                  label="Select Registered Patient"
                  options={patients.map(p => `${p.fullName} (${p.uhid})`)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Select
                    label="Encounter Type"
                    options={['OPD Outpatient Consultation', 'IPD Inpatient Admission', 'Day Care Chemotherapy / Dialysis', 'Emergency Trauma']}
                  />
                  <Select
                    label="Clinical Department"
                    options={['General Medicine', 'Obstetrics & Gynaecology', 'General Surgery', 'Cardiology', 'Pediatrics']}
                  />
                </div>
                <Select
                  label="Attending Consultant Doctor"
                  options={['Dr. Arindam Mitra', 'Dr. Sandeep Kulkarni', 'Dr. Ananya Sharma', 'Dr. Pradeep K. Sharma']}
                />
                <Input
                  label="Chief Complaints / Reason for Encounter"
                  placeholder="e.g. Acute high fever with productive cough x 3 days"
                />
                <div style={{ marginTop: '6px' }}>
                  <Button variant="primary" onClick={() => showToast('Encounter ENC-2026-8910 generated! Token issued to patient queue.')}>
                    Create Encounter & Generate Token
                  </Button>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '12px' }}>Recent Patient Encounters Today</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>ENC-2026-8908</span>
                    <Badge variant="teal">OPD Consult</Badge>
                  </div>
                  <div style={{ fontWeight: '600', marginTop: '4px' }}>Devika Sengupta (UHID-2026-0814)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Dr. Arindam Mitra • General Medicine Desk 1 • Token #T-101
                  </div>
                </div>

                <div style={{ padding: '12px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>ENC-2026-8909</span>
                    <Badge variant="warning">Emergency</Badge>
                  </div>
                  <div style={{ fontWeight: '600', marginTop: '4px' }}>Gurdeep Singh (UHID-2026-0711)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Dr. Pradeep K. Sharma • Trauma Bay 1 • Bed ICU-01 Allotted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 24.4: Patient Search & Record Merge */}
      {activeSubtab === '24.4' && (
        <Card
          title="Fuzzy Patient Search & Duplicate Record Merge"
          subtitle="Detect accidental double-registrations by mobile number or Aadhaar, consolidating lifetime clinical history"
        >
          <div style={{ padding: '16px', border: '1px solid #FCD34D', backgroundColor: '#FFFBEB', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle color="#D97706" size={20} />
              <div>
                <div style={{ fontWeight: '700', color: '#92400E' }}>Potential Duplicate Match Detected</div>
                <div style={{ fontSize: '0.78rem', color: '#B45309' }}>
                  UHID-2026-0814 (Devika Sengupta) and UHID-2026-0815 share identical phone number (+91 98301 24567).
                </div>
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => setIsMergeModalOpen(true)}>
              Merge Records
            </Button>
          </div>
        </Card>
      )}

      {/* SUBMODULE 24.5: Demographic & Identity Updates */}
      {activeSubtab === '24.5' && (
        <Card
          title="Demographic & Identity Audit Revisions"
          subtitle="Update residential addresses, next-of-kin contacts, insurance corporate memberships, and ABHA identifiers"
        >
          <div style={{ padding: '16px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF', maxWidth: '700px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Select
                label="Select Patient to Update"
                options={patients.map(p => `${p.fullName} (${p.uhid})`)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Contact Phone"
                  defaultValue="+91 98301 24567"
                />
                <Input
                  label="Emergency Contact / Next of Kin"
                  defaultValue="S. Sengupta (Spouse) - 98301 24568"
                />
              </div>

              <Input
                label="Residential Address"
                defaultValue="B-402, Green Glen Heights, Salt Lake, Kolkata"
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="ABHA Health Address ID"
                  defaultValue="devika.sengupta@abdm"
                />
                <Select
                  label="Primary Insurance / TPA"
                  options={['Star Health & Allied Insurance', 'HDFC ERGO General Insurance', 'Max Bupa Health', 'Self Pay / Cash']}
                />
              </div>

              <Input
                label="Mandatory Reason for Record Update"
                placeholder="e.g. Patient shifted residence / new mobile number verification"
              />

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
                <Button variant="primary" onClick={() => showToast('Patient demographics updated and logged to audit trail!')}>
                  Save Demographic Revisions
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal: Register Patient */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Patient (EMPI)"
        subtitle="Capture KYC and generate lifelong Unique Health ID (UHID)"
      >
        <form onSubmit={handleRegisterPatient} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Full Legal Name"
            required
            placeholder="e.g. Vikramaditya Bose"
            value={newPatient.fullName}
            onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Age"
              type="number"
              placeholder="e.g. 52"
              value={newPatient.age}
              onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
            />
            <Select
              label="Gender"
              value={newPatient.gender}
              onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Mobile Phone Number"
              required
              placeholder="e.g. +91 98112 34567"
              value={newPatient.phone}
              onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
            />
            <Select
              label="Blood Group"
              value={newPatient.bloodGroup}
              onChange={(e) => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}
              options={['A positive', 'A negative', 'B positive', 'B negative', 'O positive', 'O negative', 'AB positive', 'AB negative']}
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="City, District, State, PIN"
            value={newPatient.address}
            onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRegisterModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create UHID & Profile</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Smart Card Preview */}
      <Modal
        isOpen={isSmartCardModalOpen}
        onClose={() => setIsSmartCardModalOpen(false)}
        title="UHID Health Smart Card Preview"
        subtitle="Standard ISO CR-80 plastic card format"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '320px',
            height: '190px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #087F8C 0%, #066974 100%)',
            color: '#FFFFFF',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: 'var(--shadow-dropdown)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '-0.02em' }}>MEDICSPRIME HOSPITAL</div>
                <div style={{ fontSize: '0.62rem', opacity: 0.8 }}>OFFICIAL PATIENT HEALTH ID</div>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px' }}>
                {selectedPatientForCard?.bloodGroup}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800' }}>{selectedPatientForCard?.fullName}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{selectedPatientForCard?.gender}, {selectedPatientForCard?.age} Yrs • {selectedPatientForCard?.phone}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '6px' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem' }}>{selectedPatientForCard?.uhid}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>EMPI ID #2026</div>
            </div>
          </div>

          <Button variant="primary" icon={Printer} onClick={() => {
            setIsSmartCardModalOpen(false);
            showToast('Smart card dispatched to thermal card embosser printer!');
          }}>
            Print Plastic Smart Card
          </Button>
        </div>
      </Modal>

      {/* Modal: Merge Records */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title="Consolidate Duplicate Patient Records"
        subtitle="Merge clinical history, prescriptions, and billing under Master UHID"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
          <p>
            You are about to merge secondary record <strong>UHID-2026-0815</strong> into Primary Master Record <strong>UHID-2026-0814 (Devika Sengupta)</strong>.
          </p>
          <div style={{ padding: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-sm)', color: '#991B1B' }}>
            Warning: This action will permanently consolidate all lab results, radiology studies, and past billing into the primary UHID.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <Button variant="ghost" onClick={() => setIsMergeModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleMergeConfirm}>Confirm Permanent Merge</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
