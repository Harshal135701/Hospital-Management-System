import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  Printer,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_LAB_REQUISITIONS } from '../inventoryMockData';

export function LaboratoryGroup({ activeSubtab = '19.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [requisitions, setRequisitions] = useState(INITIAL_LAB_REQUISITIONS);
  const [notification, setNotification] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isBarcodePrintModalOpen, setIsBarcodePrintModalOpen] = useState(false);
  const [selectedReqForBarcode, setSelectedReqForBarcode] = useState(null);

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
    patientName: '',
    uhid: '',
    testName: 'Complete Blood Count (CBC) + ESR',
    sampleType: 'EDTA Whole Blood',
    orderingDoctor: 'Dr. Arindam Mitra',
    priority: 'Routine'
  });

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const newReq = {
      id: `LAB-REQ-${400 + requisitions.length + 1}`,
      uhid: newOrder.uhid || 'UHID-2026-0999',
      patientName: newOrder.patientName,
      testName: newOrder.testName,
      sampleType: newOrder.sampleType,
      barcode: `BC-${991200 + requisitions.length + 8}`,
      orderingDoctor: newOrder.orderingDoctor,
      status: 'Sample Pending',
      priority: newOrder.priority,
      panicAlert: false
    };
    setRequisitions([newReq, ...requisitions]);
    setIsNewOrderModalOpen(false);
    showToast(`Lab requisition ${newReq.id} generated! Barcode: ${newReq.barcode}`);
  };

  const handleAuthorize = (reqId) => {
    setRequisitions(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Authorized & Released' } : r));
    showToast(`Test ${reqId} digitally verified and released to EMR!`);
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

      {/* SUBMODULE 19.1: Test Requisition & Billing */}
      {activeSubtab === '19.1' && (
        <Card
          title="Diagnostic Test Requisition & Billing Desk"
          subtitle="Direct laboratory test entry, panel selection, priority coding (STAT/Routine), and barcode generation"
          action={
            <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsNewOrderModalOpen(true)}>
              New Lab Requisition
            </Button>
          }
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Req Number</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Investigative Test</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Sample Type</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Priority</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {requisitions.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{req.id}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{req.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{req.patientName}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{req.testName}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{req.sampleType}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.priority === 'STAT' ? 'danger' : req.priority === 'Urgent' ? 'warning' : 'teal'}>
                        {req.priority}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={req.status === 'Authorized & Released' ? 'success' : req.status === 'Result Entered' ? 'warning' : 'teal'}>
                        {req.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 19.2: Phlebotomy & Sample Barcode Labeling */}
      {activeSubtab === '19.2' && (
        <Card
          title="Phlebotomy Station & Tube Barcode Label Printing"
          subtitle="Vacuum container collection accessioning, specimen barcode label generation, and collection timestamp"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {requisitions.map((req) => (
              <div key={req.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '700' }}>{req.patientName}</div>
                  <Badge variant="teal">{req.barcode}</Badge>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                  {req.testName} • {req.sampleType}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <Button size="sm" variant="outline" icon={Printer} onClick={() => {
                    setSelectedReqForBarcode(req);
                    setIsBarcodePrintModalOpen(true);
                  }}>
                    Print Barcode Label
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* SUBMODULE 19.3: Instrument Worklist Interfacing */}
      {activeSubtab === '19.3' && (
        <Card
          title="Automated Analyzer Instrument Worklists (ASTM / HL7)"
          subtitle="Bidirectional middleware links with Roche Cobas, Sysmex Hematology, and Beckman AU680"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', color: '#166534' }}>Roche Cobas 6000 (c501/e601)</div>
              <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '2px' }}>Biochemistry & Immunoassay • ASTM Link Online</div>
              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Active queue: 18 samples • Buffer 100% OK
              </div>
            </div>
            <div style={{ padding: '14px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', color: '#166534' }}>Sysmex XN-1000 Hematology</div>
              <div style={{ fontSize: '0.75rem', color: '#15803D', marginTop: '2px' }}>Complete Blood Count • HL7 Link Online</div>
              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                Active queue: 12 samples • Auto-differential running
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 19.4: Result Entry & Panic Value Alerts */}
      {activeSubtab === '19.4' && (
        <Card
          title="Result Entry & Critical Panic Value Alert Workbench"
          subtitle="Analyte numerical input, biological reference intervals, and automated clinician panic notifications"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Panic Alert Banner */}
            <div style={{ padding: '14px', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={22} color="#DC2626" />
                <div>
                  <div style={{ fontWeight: '800', color: '#991B1B', fontSize: '0.9rem' }}>
                    CRITICAL PANIC VALUE: Gurdeep Singh (BED-ICU-01)
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#B91C1C' }}>
                    Serum Lactate: <strong>6.8 mmol/L</strong> (Normal: 0.5 - 2.0) • Arterial pH: <strong>7.18</strong> (Acidosis)
                  </div>
                </div>
              </div>
              <Badge variant="danger">Notified Dr. Pradeep (ICU)</Badge>
            </div>

            <div style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: '700', marginBottom: '8px' }}>Rameshwar Teli — CBC Results Entered</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', fontSize: '0.8rem' }}>
                <div>Hemoglobin: <strong>11.4 g/dL</strong> (13-17)</div>
                <div>WBC (TLC): <strong>14,800 /mcL</strong> (4,000-11,000) ⚠️</div>
                <div>Platelet Count: <strong>2.4 Lakhs/mcL</strong> (1.5-4.5)</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 19.5: Pathologist Verification & Authorization */}
      {activeSubtab === '19.5' && (
        <Card
          title="Pathologist Verification & Digital EMR Authorization"
          subtitle="Consultant pathologist digital authorization, clinical correlation, and release to hospital EMR"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requisitions.map((req) => (
              <div key={req.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{req.patientName} ({req.uhid})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Test: {req.testName} • Doctor: {req.orderingDoctor}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {req.status !== 'Authorized & Released' ? (
                    <Button size="sm" variant="primary" icon={Check} onClick={() => handleAuthorize(req.id)}>
                      Authorize & Sign-off
                    </Button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: '700' }}>
                      ✓ Digitally Released
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Modal: New Lab Order */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Diagnostic Laboratory Test Requisition"
        subtitle="Order lab panels and specify priority tier"
      >
        <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input
              label="Patient Name"
              required
              value={newOrder.patientName}
              placeholder="e.g. Rameshwar Teli"
              onChange={(e) => setNewOrder({ ...newOrder, patientName: e.target.value })}
            />
            <Input
              label="UHID Number"
              value={newOrder.uhid}
              placeholder="e.g. UHID-2026-0412"
              onChange={(e) => setNewOrder({ ...newOrder, uhid: e.target.value })}
            />
          </div>

          <Select
            label="Diagnostic Test / Panel"
            value={newOrder.testName}
            onChange={(e) => setNewOrder({ ...newOrder, testName: e.target.value })}
            options={[
              'Complete Blood Count (CBC) + ESR',
              'Arterial Blood Gas (ABG) + Serum Lactate',
              'HbA1c & Fasting Lipid Profile',
              'Liver Function Test (LFT) Comprehensive',
              'Kidney Function Test (KFT) with Electrolytes',
              'Beta-hCG Quantitative Serum',
              'Urine Routine & Microscopic Examination'
            ]}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Sample Collection Vial"
              value={newOrder.sampleType}
              onChange={(e) => setNewOrder({ ...newOrder, sampleType: e.target.value })}
              options={['EDTA Whole Blood', 'Serum Clot Activator', 'Fluoride Plasma', 'Heparinized Blood', 'Sodium Citrate']}
            />
            <Select
              label="Ordering Clinician"
              value={newOrder.orderingDoctor}
              onChange={(e) => setNewOrder({ ...newOrder, orderingDoctor: e.target.value })}
              options={['Dr. Arindam Mitra', 'Dr. Sunita Rao', 'Dr. Ananya Sharma', 'Dr. Pradeep K. Sharma']}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsNewOrderModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Generate Requisition & Barcode</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Barcode Print Preview */}
      <Modal
        isOpen={isBarcodePrintModalOpen}
        onClose={() => setIsBarcodePrintModalOpen(false)}
        title="Phlebotomy Specimen Barcode Label"
        subtitle="Direct thermal 50mm x 25mm vacuum tube label preview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '280px',
            padding: '14px',
            border: '2px solid #000000',
            backgroundColor: '#FFFFFF',
            borderRadius: '4px',
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>MEDICSPRIME CLINICAL LAB</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{selectedReqForBarcode?.patientName}</div>
            <div style={{ fontSize: '0.68rem', color: '#4B5563' }}>{selectedReqForBarcode?.uhid} • {selectedReqForBarcode?.sampleType}</div>
            <div style={{ margin: '8px 0', fontSize: '1.4rem', letterSpacing: '4px', fontWeight: '900', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '4px 0' }}>
              ||||| | ||||| | |||
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 'bold' }}>{selectedReqForBarcode?.barcode}</div>
            <div style={{ fontSize: '0.65rem' }}>{selectedReqForBarcode?.testName}</div>
          </div>

          <Button variant="primary" icon={Printer} onClick={() => {
            setIsBarcodePrintModalOpen(false);
            showToast('Barcode label sent to Direct Thermal Printer!');
          }}>
            Print Specimen Tube Label
          </Button>
        </div>
      </Modal>
    </div>
  );
}
