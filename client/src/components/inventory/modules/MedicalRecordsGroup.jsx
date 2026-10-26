import React, { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Award,
  Search,
  FileText,
  Printer
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_HIM_FILES } from '../inventoryMockData';

export function MedicalRecordsGroup({ activeSubtab = '20.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [files, setFiles] = useState(INITIAL_HIM_FILES);
  const [notification, setNotification] = useState('');
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [selectedFileForLend, setSelectedFileForLend] = useState(null);
  const [lendBorrower, setLendBorrower] = useState('');

  // 20.3: Civil Registrations State
  const [civilRegistryTab, setCivilRegistryTab] = useState('BIRTHS');
  const [isNewBirthModalOpen, setIsNewBirthModalOpen] = useState(false);
  const [isNewDeathModalOpen, setIsNewDeathModalOpen] = useState(false);

  const [births, setBirths] = useState([
    {
      id: 'BR-2026-081',
      babyName: 'Baby of Kavita Rathore (Female)',
      motherName: 'Kavita Rathore (UHID-2026-0210)',
      fatherName: 'Vikas Rathore',
      dateTime: '2026-10-24 05:42 AM',
      birthWeight: '3.15 kg',
      deliveryType: 'Normal Vaginal Delivery',
      doctor: 'Dr. Ananya Sharma',
      form1Status: 'Generated & Signed',
      municipalSync: 'Synced with Municipal Health Corp'
    },
    {
      id: 'BR-2026-082',
      babyName: 'Baby of Sunita Rao (Male)',
      motherName: 'Sunita Rao (UHID-2026-0315)',
      fatherName: 'Praveen Rao',
      dateTime: '2026-10-23 11:18 PM',
      birthWeight: '2.85 kg',
      deliveryType: 'Emergency LSCS',
      doctor: 'Dr. Ananya Sharma',
      form1Status: 'Generated & Signed',
      municipalSync: 'Synced with Municipal Health Corp'
    }
  ]);

  const [deaths, setDeaths] = useState([
    {
      id: 'DR-2026-014',
      deceasedName: 'Harish Chandra Gupta',
      uhid: 'UHID-2026-0108',
      dateTimeOfDeath: '2026-10-22 04:15 AM',
      ageGender: '76 Y / Male',
      primaryCause: 'Cardiopulmonary Arrest secondary to Refractory Septic Shock',
      attendingDoctor: 'Dr. Pradeep K. Sharma',
      form4AStatus: 'Medical Certification (Form 4A) Issued',
      municipalSync: 'Synced with Municipal Health Corp'
    }
  ]);

  const [birthForm, setBirthForm] = useState({
    motherName: '',
    fatherName: '',
    gender: 'Female',
    weight: '3.0',
    deliveryType: 'Normal Vaginal Delivery',
    doctor: 'Dr. Ananya Sharma'
  });

  const [deathForm, setDeathForm] = useState({
    deceasedName: '',
    uhid: '',
    age: '65',
    gender: 'Male',
    cause: 'Refractory Septic Shock & Multi-Organ Failure',
    doctor: 'Dr. Pradeep K. Sharma'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleLendSubmit = (e) => {
    e.preventDefault();
    if (!selectedFileForLend || !lendBorrower) return;

    setFiles(prev => prev.map(f => f.id === selectedFileForLend.id ? {
      ...f,
      checkoutStatus: 'Checked Out',
      borrower: lendBorrower,
      returnDueDate: '2026-10-31'
    } : f));

    setIsLendModalOpen(false);
    setLendBorrower('');
    showToast(`Physical file ${selectedFileForLend.id} loaned to ${lendBorrower}`);
  };

  const handleReturnFile = (fileId) => {
    setFiles(prev => prev.map(f => f.id === fileId ? {
      ...f,
      checkoutStatus: 'Available in Archives',
      borrower: 'None',
      returnDueDate: '-'
    } : f));
    showToast(`File ${fileId} received back into Compactor Archives.`);
  };

  const handleCreateBirth = (e) => {
    e.preventDefault();
    if (!birthForm.motherName) return;
    const newBirth = {
      id: `BR-2026-0${83 + births.length}`,
      babyName: `Baby of ${birthForm.motherName} (${birthForm.gender})`,
      motherName: birthForm.motherName,
      fatherName: birthForm.fatherName || 'Not Stated',
      dateTime: new Date().toLocaleString(),
      birthWeight: `${birthForm.weight} kg`,
      deliveryType: birthForm.deliveryType,
      doctor: birthForm.doctor,
      form1Status: 'Generated & Signed',
      municipalSync: 'Synced with Municipal Health Corp'
    };
    setBirths([newBirth, ...births]);
    setIsNewBirthModalOpen(false);
    showToast(`Institutional Birth Certificate registered for ${newBirth.babyName}!`);
  };

  const handleCreateDeath = (e) => {
    e.preventDefault();
    if (!deathForm.deceasedName) return;
    const newDeath = {
      id: `DR-2026-0${15 + deaths.length}`,
      deceasedName: deathForm.deceasedName,
      uhid: deathForm.uhid || 'UHID-2026-0999',
      dateTimeOfDeath: new Date().toLocaleString(),
      ageGender: `${deathForm.age} Y / ${deathForm.gender}`,
      primaryCause: deathForm.cause,
      attendingDoctor: deathForm.doctor,
      form4AStatus: 'Medical Certification (Form 4A) Issued',
      municipalSync: 'Synced with Municipal Health Corp'
    };
    setDeaths([newDeath, ...deaths]);
    setIsNewDeathModalOpen(false);
    showToast(`Institutional Death Certificate recorded for ${newDeath.deceasedName}!`);
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

      {/* SUBMODULE 20.1: Physical File Archival & Rack Tracking */}
      {activeSubtab === '20.1' && (
        <Card
          title="Physical Medical Record File Archival & Compactor Rack Tracking"
          subtitle="Physical inpatient case sheet archival, compactor shelf tracking, and digital barcode indexing"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>File Docket ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Compactor Rack Location</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Borrower Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((fl) => (
                  <tr key={fl.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{fl.id}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{fl.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{fl.patientName}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{fl.rackLocation}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={fl.checkoutStatus === 'Available in Archives' ? 'success' : 'warning'}>
                        {fl.checkoutStatus}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {fl.checkoutStatus === 'Available in Archives' ? (
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedFileForLend(fl);
                          setIsLendModalOpen(true);
                        }}>
                          Checkout File
                        </Button>
                      ) : (
                        <Button size="sm" variant="primary" onClick={() => handleReturnFile(fl.id)}>
                          Receive Back
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 20.2: ICD-10 & CPT Clinical Coding */}
      {activeSubtab === '20.2' && (
        <Card
          title="ICD-10-CM & CPT Clinical Coding Workstation"
          subtitle="Hospital morbidity coding, surgical procedure CPT mapping, and insurance claim validation"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {files.map((fl) => (
              <div key={fl.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700' }}>{fl.patientName} ({fl.uhid})</div>
                  <Badge variant="teal">Coded by HIM Certified Coder</Badge>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>ICD-10 Diagnosis:</strong> {fl.icd10}</div>
                  <div><strong>CPT Procedure:</strong> {fl.cptCode}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 20.3: Birth & Death Registration */}
      {activeSubtab === '20.3' && (
        <Card
          title="Institutional Birth & Death Statutory Civil Registry"
          subtitle="Statutory reporting to municipal health authorities, Form 4 / 4A death certificates, and birth dossiers"
          action={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsNewBirthModalOpen(true)}>
                Register Live Birth (Form 1)
              </Button>
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsNewDeathModalOpen(true)}>
                Register Death (Form 4A)
              </Button>
            </div>
          }
        >
          {/* Civil Registry Toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button
              variant={civilRegistryTab === 'BIRTHS' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCivilRegistryTab('BIRTHS')}
            >
              Institutional Live Births ({births.length})
            </Button>
            <Button
              variant={civilRegistryTab === 'DEATHS' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCivilRegistryTab('DEATHS')}
            >
              Institutional Deaths ({deaths.length})
            </Button>
          </div>

          {/* Births Table */}
          {civilRegistryTab === 'BIRTHS' && (
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Birth Reg ID</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Baby Identification</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Mother & Father</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date & Time</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Weight & Mode</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Obstetrician</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Municipal Status</th>
                  </tr>
                </thead>
                <tbody>
                  {births.map((br) => (
                    <tr key={br.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{br.id}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>{br.babyName}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div>{br.motherName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Father: {br.fatherName}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{br.dateTime}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div>{br.birthWeight}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{br.deliveryType}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{br.doctor}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant="success">{br.municipalSync}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Deaths Table */}
          {civilRegistryTab === 'DEATHS' && (
            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                  <tr>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Death Reg ID</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Deceased Patient</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Age / Gender</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Date & Time</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Cause of Death</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Attending Consultant</th>
                    <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Statutory Form</th>
                  </tr>
                </thead>
                <tbody>
                  {deaths.map((dr) => (
                    <tr key={dr.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{dr.id}</td>
                      <td style={{ padding: '10px 14px', fontWeight: '600' }}>
                        <div>{dr.deceasedName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{dr.uhid}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>{dr.ageGender}</td>
                      <td style={{ padding: '10px 14px' }}>{dr.dateTimeOfDeath}</td>
                      <td style={{ padding: '10px 14px', color: '#7F1D1D', fontWeight: '600' }}>{dr.primaryCause}</td>
                      <td style={{ padding: '10px 14px' }}>{dr.attendingDoctor}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <Badge variant="teal">{dr.form4AStatus}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* SUBMODULE 20.4: File Checkout & Audit Lending */}
      {activeSubtab === '20.4' && (
        <Card
          title="Physical File Checkout & Clinical Audit Lending Log"
          subtitle="Borrower chain of custody, due dates, statutory legal holds, and lending history"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>File ID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Borrower Officer / Dept</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Return Due Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {files.map((fl) => (
                  <tr key={fl.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{fl.id}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{fl.patientName}</td>
                    <td style={{ padding: '10px 14px' }}>{fl.borrower}</td>
                    <td style={{ padding: '10px 14px' }}>{fl.returnDueDate}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={fl.checkoutStatus === 'Checked Out' ? 'warning' : 'success'}>
                        {fl.checkoutStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Lend File */}
      <Modal
        isOpen={isLendModalOpen}
        onClose={() => setIsLendModalOpen(false)}
        title="Checkout Physical Medical Record"
        subtitle={selectedFileForLend ? `Lending file for ${selectedFileForLend.patientName} (${selectedFileForLend.id})` : ''}
      >
        <form onSubmit={handleLendSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Borrower Name & Department"
            required
            placeholder="e.g. Dr. Rajiv Menon / Insurance TPA Desk"
            value={lendBorrower}
            onChange={(e) => setLendBorrower(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsLendModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Checkout</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Register Birth (Form 1) */}
      <Modal
        isOpen={isNewBirthModalOpen}
        onClose={() => setIsNewBirthModalOpen(false)}
        title="Register Institutional Live Birth (Form 1)"
        subtitle="Statutory Birth Registration for Municipal Health Corporation"
      >
        <form onSubmit={handleCreateBirth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Mother's Full Name & UHID"
            required
            placeholder="e.g. Rekha Sharma (UHID-2026-0819)"
            value={birthForm.motherName}
            onChange={(e) => setBirthForm({ ...birthForm, motherName: e.target.value })}
          />
          <Input
            label="Father's Full Name"
            placeholder="e.g. Ajay Sharma"
            value={birthForm.fatherName}
            onChange={(e) => setBirthForm({ ...birthForm, fatherName: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Baby Gender"
              value={birthForm.gender}
              onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
              options={['Female', 'Male', 'Ambiguous']}
            />
            <Input
              label="Birth Weight (kg)"
              value={birthForm.weight}
              onChange={(e) => setBirthForm({ ...birthForm, weight: e.target.value })}
            />
          </div>
          <Select
            label="Mode of Delivery"
            value={birthForm.deliveryType}
            onChange={(e) => setBirthForm({ ...birthForm, deliveryType: e.target.value })}
            options={['Normal Vaginal Delivery', 'Emergency LSCS', 'Elective LSCS', 'Vacuum Extraction Assisted']}
          />
          <Input
            label="Attending Obstetrician"
            value={birthForm.doctor}
            onChange={(e) => setBirthForm({ ...birthForm, doctor: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewBirthModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate Form 1 & Sync Civil Registry</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Register Death (Form 4A) */}
      <Modal
        isOpen={isNewDeathModalOpen}
        onClose={() => setIsNewDeathModalOpen(false)}
        title="Register Institutional Death (Form 4A)"
        subtitle="Medical Certification of Cause of Death for Municipal Corporation"
      >
        <form onSubmit={handleCreateDeath} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Deceased Patient Name"
              required
              placeholder="e.g. Satish K. Sen"
              value={deathForm.deceasedName}
              onChange={(e) => setDeathForm({ ...deathForm, deceasedName: e.target.value })}
            />
            <Input
              label="Patient UHID"
              placeholder="e.g. UHID-2026-0512"
              value={deathForm.uhid}
              onChange={(e) => setDeathForm({ ...deathForm, uhid: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Age at Time of Death"
              value={deathForm.age}
              onChange={(e) => setDeathForm({ ...deathForm, age: e.target.value })}
            />
            <Select
              label="Gender"
              value={deathForm.gender}
              onChange={(e) => setDeathForm({ ...deathForm, gender: e.target.value })}
              options={['Male', 'Female', 'Other']}
            />
          </div>
          <Input
            label="Primary Cause of Death (ICD-10 Morbidity Standard)"
            required
            placeholder="e.g. Severe Acute Respiratory Distress Syndrome (ARDS) secondary to Sepsis"
            value={deathForm.cause}
            onChange={(e) => setDeathForm({ ...deathForm, cause: e.target.value })}
          />
          <Input
            label="Attending Certifying Doctor"
            value={deathForm.doctor}
            onChange={(e) => setDeathForm({ ...deathForm, doctor: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewDeathModalOpen(false)}>Cancel</Button>
            <Button variant="danger" type="submit">Issue Form 4A & Seal Certificate</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
