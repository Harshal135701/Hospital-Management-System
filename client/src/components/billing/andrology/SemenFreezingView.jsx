import React, { useState, useMemo } from 'react';
import {
  Snowflake,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  User,
  ShieldCheck,
  Tag,
  Eye,
  Archive,
  QrCode,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_CRYO_SPECIMENS } from '../common/billingMockData';
import { formatDateIN, formatDateTimeIN } from '../../../utils/formatters';

export function SemenFreezingView() {
  const [specimens, setSpecimens] = useState(INITIAL_CRYO_SPECIMENS);
  const [searchFilter, setSearchFilter] = useState('');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedSpecimenForLabel, setSelectedSpecimenForLabel] = useState(INITIAL_CRYO_SPECIMENS[0]);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // New Registration Form
  const [form, setForm] = useState({
    patientName: 'Devika & Rahul Sengupta',
    patientUhid: 'UHID-2026-0814',
    category: 'Autologous Patient Sperm',
    freezeDate: new Date().toISOString().slice(0, 16),
    protocol: 'Standard Slow Freezing (Planer Controlled)',
    cryoprotectant: 'Irvine Scientific SpermFreeze (1:1 ratio)',
    aliquots: 4,
    tank: 'Tank Alpha (LN2 -196°C)',
    canister: 'Canister 03',
    cane: 'Cane 14',
    goblet: 'Yellow Goblet 10mm',
    strawPrefix: 'ST-26-92',
    consentStatus: 'Verified (Signed e-Consent on Record)',
    preFreezeConcentration: '48 M/ml',
    preFreezeMotility: '64%',
    operator: 'Dr. Priya Nair (Lead Embryologist)',
    notes: 'Preserved prior to spouse planned ICSI stimulation cycle.'
  });

  const filteredSpecimens = useMemo(() => {
    return specimens.filter(s => {
      const q = searchFilter.toLowerCase();
      return (
        s.containerId.toLowerCase().includes(q) ||
        s.patientName.toLowerCase().includes(q) ||
        s.patientUhid.toLowerCase().includes(q) ||
        s.storageLocation.tank.toLowerCase().includes(q)
      );
    });
  }, [specimens, searchFilter]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const count = parseInt(form.aliquots) || 1;
    const strawIds = Array.from({ length: count }, (_, i) => `${form.strawPrefix}${i + 1}`);

    const newCryo = {
      id: `cryo-${Date.now()}`,
      containerId: `CRYO-STR-2026-0${Math.floor(100 + Math.random() * 900)}`,
      barcode: `CRYO${Math.floor(100 + Math.random() * 900)}`,
      patientName: form.patientName,
      patientUhid: form.patientUhid,
      category: form.category,
      freezeDate: form.freezeDate,
      protocol: form.protocol,
      cryoprotectant: form.cryoprotectant,
      aliquotsStored: count,
      aliquotsRemaining: count,
      storageLocation: {
        tank: form.tank,
        canister: form.canister,
        cane: form.cane,
        goblet: form.goblet,
        strawIds
      },
      consentStatus: form.consentStatus,
      preFreezeConcentration: form.preFreezeConcentration,
      preFreezeMotility: form.preFreezeMotility,
      operator: form.operator,
      status: 'Stored',
      notes: form.notes
    };

    setSpecimens(prev => [newCryo, ...prev]);
    setIsRegisterModalOpen(false);
    setSelectedSpecimenForLabel(newCryo);
    setSuccessBanner(`Cryo specimen registered with ${count} straws allocated in ${newCryo.storageLocation.tank}.`);
    setTimeout(() => setSuccessBanner(null), 4500);
  };

  const handlePrintLabel = (specimen) => {
    setSelectedSpecimenForLabel(specimen);
    setIsLabelModalOpen(true);
  };

  const handleViewDossier = (specimen) => {
    setSelectedDossier(specimen);
    setIsDossierModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 1.2</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Cryopreservation & Semen Freezing Bank
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Vitrification protocol logging, French straw barcoding, tank/canister inventory allocation, and ICMR compliance tracking.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Freeze & Store Specimen
        </Button>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Cryo Storage Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Active Cryo Containers
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {specimens.length} Containers
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Total Straws in LN2: {specimens.reduce((acc, s) => acc + s.aliquotsRemaining, 0)} Aliquots
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Liquid Nitrogen Tank Alpha
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0369A1', marginTop: '4px' }}>
            -196°C Normal
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Level: 88 cm | Autologous Patient Vault
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
            Tank Beta (Donor Vault)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0D9488', marginTop: '4px' }}>
            -196°C Normal
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Level: 92 cm | Anonymous Certified Donors
          </div>
        </div>
      </div>

      {/* Cryo Inventory Table */}
      <Card
        title="Cryopreserved Specimen Inventory"
        subtitle="Searchable registry of frozen semen aliquots with full physical storage hierarchy"
        action={
          <div style={{ width: '260px' }}>
            <Input
              placeholder="Search by UHID, Container ID, Tank..."
              icon={Search}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Container / Barcode</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Patient / Subject</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Storage Location Matrix</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Straws Stored</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Freeze Date</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Consent Status</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecimens.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{item.containerId}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Barcode: {item.barcode}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{item.patientName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{item.patientUhid} • {item.category}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{item.storageLocation.tank}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                      {item.storageLocation.canister} &gt; {item.storageLocation.cane} &gt; {item.storageLocation.goblet}
                    </div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <Badge variant={item.aliquotsRemaining > 0 ? 'teal' : 'gray'} size="sm">
                      {item.aliquotsRemaining} / {item.aliquotsStored} Straws
                    </Badge>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div>{formatDateIN(item.freezeDate)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>By {item.operator}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Printer}
                        onClick={() => handlePrintLabel(item)}
                      >
                        Labels
                      </Button>
                      <Button
                        variant="soft"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDossier(item)}
                      >
                        Details
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Register New Cryo Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Cryopreservation & Specimen Freezing Intake"
        size="lg"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <Input
              label="Patient / Subject Name"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              required
            />
            <Input
              label="Patient UHID / Donor ID"
              value={form.patientUhid}
              onChange={(e) => setForm({ ...form, patientUhid: e.target.value })}
              required
            />
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                Specimen Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                <option value="Autologous Patient Sperm">Autologous Patient Sperm</option>
                <option value="Certified Anonymous Donor">Certified Anonymous Donor</option>
                <option value="PESA Surgical Aspirate">PESA Surgical Aspirate</option>
                <option value="TESE Surgical Biopsy">TESE Surgical Biopsy</option>
              </select>
            </div>
            <Input
              label="Freezing Date & Time"
              type="datetime-local"
              value={form.freezeDate}
              onChange={(e) => setForm({ ...form, freezeDate: e.target.value })}
              required
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', marginBottom: '10px' }}>Physical Storage Location Allocation:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '500', color: '#4B5563', display: 'block', marginBottom: '4px' }}>Liquid Nitrogen Tank</label>
                <select
                  value={form.tank}
                  onChange={(e) => setForm({ ...form, tank: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '0.78rem' }}
                >
                  <option value="Tank Alpha (LN2 -196°C)">Tank Alpha (Autologous)</option>
                  <option value="Tank Beta (LN2 Donor Vault)">Tank Beta (Donor)</option>
                </select>
              </div>
              <Input
                label="Canister"
                value={form.canister}
                onChange={(e) => setForm({ ...form, canister: e.target.value })}
                required
              />
              <Input
                label="Cane"
                value={form.cane}
                onChange={(e) => setForm({ ...form, cane: e.target.value })}
                required
              />
              <Input
                label="Goblet"
                value={form.goblet}
                onChange={(e) => setForm({ ...form, goblet: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Input
              label="No. of French Straws (0.5 mL)"
              type="number"
              min="1"
              max="24"
              value={form.aliquots}
              onChange={(e) => setForm({ ...form, aliquots: e.target.value })}
              required
            />
            <Input
              label="Straw ID Prefix"
              value={form.strawPrefix}
              onChange={(e) => setForm({ ...form, strawPrefix: e.target.value })}
              required
            />
            <Input
              label="Operator / Embryologist"
              value={form.operator}
              onChange={(e) => setForm({ ...form, operator: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Complete Cryo Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Straw Barcode Label Preview Modal */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Cryo Straw Thermal Label Preview (SATO Cryo-Resistant)"
        size="md"
      >
        {selectedSpecimenForLabel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div
              style={{
                width: '320px',
                padding: '16px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #111827',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                lineHeight: 1.3
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111827', paddingBottom: '4px', marginBottom: '8px' }}>
                <span style={{ fontWeight: '800' }}>APEX CRYO-BANK</span>
                <span style={{ fontSize: '0.68rem' }}>LN2 -196°C</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={48} />
                <div>
                  <div style={{ fontWeight: '800' }}>{selectedSpecimenForLabel.containerId}</div>
                  <div>UHID: {selectedSpecimenForLabel.patientUhid}</div>
                  <div>Straw: {selectedSpecimenForLabel.storageLocation.strawIds?.[0] || 'ST-26-901'}</div>
                </div>
              </div>
              <div style={{ marginTop: '8px', borderTop: '1px solid #E5E7EB', paddingTop: '4px', fontSize: '0.68rem', color: '#4B5563' }}>
                Loc: {selectedSpecimenForLabel.storageLocation.tank} / {selectedSpecimenForLabel.storageLocation.canister}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#6B7280' }}>
                Date: {formatDateIN(selectedSpecimenForLabel.freezeDate)} • Op: {selectedSpecimenForLabel.operator}
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Thermal transfer label formatted for 38mm × 19mm liquid nitrogen immersion resistant tags.
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsLabelModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Thermal Labels (Browser Spooler)
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dossier Detail Modal */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Cryo Specimen Full Traceability Record"
        size="md"
      >
        {selectedDossier && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '4px' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary-teal)' }}>{selectedDossier.containerId}</div>
              <div>Subject: {selectedDossier.patientName} ({selectedDossier.patientUhid})</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div><strong>Freezing Date:</strong> {formatDateTimeIN(selectedDossier.freezeDate)}</div>
              <div><strong>Protocol:</strong> {selectedDossier.protocol}</div>
              <div><strong>Cryoprotectant:</strong> {selectedDossier.cryoprotectant}</div>
              <div><strong>Pre-Freeze Concentration:</strong> {selectedDossier.preFreezeConcentration}</div>
              <div><strong>Pre-Freeze Motility:</strong> {selectedDossier.preFreezeMotility}</div>
              <div><strong>Consent Status:</strong> {selectedDossier.consentStatus}</div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
              <strong>Allocated Straw Serial Numbers:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {selectedDossier.storageLocation.strawIds?.map(st => (
                  <span key={st} style={{ padding: '3px 8px', backgroundColor: '#E0F2FE', color: '#0369A1', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '600' }}>
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
              <strong>Clinical Traceability Notes:</strong>
              <p style={{ margin: '4px 0 0', color: 'var(--color-text-secondary)' }}>{selectedDossier.notes}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsDossierModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
