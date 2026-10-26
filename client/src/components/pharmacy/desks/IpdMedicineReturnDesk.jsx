import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../../common/UIPrimitives';
import {
  RETURN_CONDITIONS,
  RETURN_REASONS
} from '../pharmacyConstants';
import { useAuth } from '../../../context/AuthContext';

export function IpdMedicineReturnDesk({
  returns = [],
  onReturnProcessed
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(returns[0] || null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Form for processing return
  const [returnQty, setReturnQty] = useState(1);
  const [selectedCondition, setSelectedCondition] = useState(RETURN_CONDITIONS[0].value);
  const [selectedReason, setSelectedReason] = useState(RETURN_REASONS[0]);
  const [inspectedNotes, setInspectedNotes] = useState('');

  const [notification, setNotification] = useState(null);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return returns.filter(ret => {
      return (
        !q ||
        (ret.patientName && ret.patientName.toLowerCase().includes(q)) ||
        (ret.patientUhid && ret.patientUhid.toLowerCase().includes(q)) ||
        (ret.creditNoteNo && ret.creditNoteNo.toLowerCase().includes(q)) ||
        (ret.medicineName && ret.medicineName.toLowerCase().includes(q)) ||
        (ret.ipdAdmissionNo && ret.ipdAdmissionNo.toLowerCase().includes(q))
      );
    });
  }, [returns, searchQuery]);

  const handleOpenProcess = (ret) => {
    setSelectedReturn(ret);
    const eligible = Math.max(1, (ret.issuedQty || 5) - (ret.returnedQty || 0));
    setReturnQty(eligible);
    setIsProcessModalOpen(true);
  };

  const handleExecuteReturn = () => {
    if (!selectedReturn) return;

    const conditionObj = RETURN_CONDITIONS.find(c => c.value === selectedCondition);
    const isEligibleForRestock = conditionObj ? conditionObj.eligible : false;
    const creditAmount = (returnQty * (selectedReturn.unitPrice || 10)).toFixed(2);
    const generatedCrn = `CRN-2026-${Math.floor(100 + Math.random() * 900)}`;

    const processedRecord = {
      ...selectedReturn,
      id: `RET-${Date.now()}`,
      creditNoteNo: generatedCrn,
      returnedQty: (selectedReturn.returnedQty || 0) + returnQty,
      totalCredit: parseFloat(creditAmount),
      returnCondition: selectedCondition,
      returnReason: selectedReason,
      status: 'Approved & Credited',
      restockedToInventory: isEligibleForRestock,
      inspectedBy: user?.name || user?.username || 'Quality Pharmacist',
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
    };

    if (onReturnProcessed) {
      onReturnProcessed(processedRecord);
    }

    setIsProcessModalOpen(false);
    setNotification(
      `Credit Note ${generatedCrn} issued (₹${creditAmount}) for ${selectedReturn.patientName}. ${isEligibleForRestock ? 'Sealed items restored to active batch stock.' : 'Damaged/opened items routed to quarantine write-off.'}`
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Alert */}
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#16A34A" />
            <span style={{ fontSize: '0.84rem', color: '#166534', fontWeight: '600' }}>{notification}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Credit Voucher
          </Button>
        </div>
      )}

      {/* Main Return Queue Card */}
      <Card
        title="25.4 Inpatient (IPD) Unused Medicine Return & Patient Credit Desk"
        subtitle="Controlled medication return verification, physical blister seal inspection, financial credit note issuance, and batch restocking"
      >
        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by UHID, Patient Name, Admission #, Credit Note #, Medicine..."
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

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear Search
          </Button>
        </div>

        {/* Returns Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Credit Note / Ref</th>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Patient & IPD Bed</th>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Medicine & Batch #</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Issued Qty</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Returned Qty</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'right' }}>Credit Amount</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Condition / Quality</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No medicine return records found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map(ret => {
                  const isApproved = ret.status.includes('Approved');

                  return (
                    <tr key={ret.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {ret.creditNoteNo}
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{ret.date}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '700' }}>{ret.patientName}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>
                          {ret.patientUhid} • {ret.wardBed}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '600' }}>{ret.medicineName}</div>
                        <div style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                          Batch: {ret.batchNo}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '600' }}>
                        {ret.issuedQty}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#16A34A' }}>
                        {ret.returnedQty}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#0369A1' }}>
                        ₹{parseFloat(ret.totalCredit || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', fontSize: '0.72rem' }}>
                        {ret.returnCondition.includes('SEALED') ? (
                          <span style={{ color: '#16A34A', fontWeight: '600' }}>✓ Sealed Blister (Restocked)</span>
                        ) : (
                          <span style={{ color: '#D97706' }}>Opened / Cut Foil (Discarded)</span>
                        )}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <Badge variant={isApproved ? 'success' : 'warning'}>
                          {ret.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        {isApproved ? (
                          <button
                            type="button"
                            onClick={() => window.print()}
                            title="Print Credit Note Voucher"
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.70rem',
                              cursor: 'pointer'
                            }}
                          >
                            Print CRN
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenProcess(ret)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-primary-teal)',
                              backgroundColor: 'var(--color-bg-pale-aqua)',
                              color: 'var(--color-primary-teal)',
                              fontWeight: '700',
                              fontSize: '0.70rem',
                              cursor: 'pointer'
                            }}
                          >
                            Inspect & Credit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Inspect & Return Modal */}
      {isProcessModalOpen && selectedReturn && (
        <Modal
          isOpen={isProcessModalOpen}
          onClose={() => setIsProcessModalOpen(false)}
          title={`Inspect & Credit IPD Medicine — ${selectedReturn.medicineName}`}
          subtitle={`Patient: ${selectedReturn.patientName} (${selectedReturn.patientUhid}) • ${selectedReturn.wardBed}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>Originally Issued: <strong>{selectedReturn.issuedQty} units</strong></div>
              <div>Already Credited: <strong>{selectedReturn.returnedQty || 0} units</strong></div>
              <div>Batch Number: <strong style={{ fontFamily: 'monospace' }}>{selectedReturn.batchNo}</strong></div>
              <div>Unit Issue Rate: <strong>₹{selectedReturn.unitPrice}</strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
              <Input
                label="Units to Return *"
                type="number"
                min={1}
                max={selectedReturn.issuedQty - (selectedReturn.returnedQty || 0)}
                value={returnQty}
                onChange={(e) => setReturnQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Calculated Patient Credit:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  ₹{(returnQty * (selectedReturn.unitPrice || 10)).toFixed(2)}
                </div>
              </div>
            </div>

            <Select
              label="Physical Condition & Packaging Inspection *"
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              options={RETURN_CONDITIONS.map(c => ({ value: c.value, label: c.label }))}
            />

            <Select
              label="Clinical Reason for Medication Return *"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              options={RETURN_REASONS.map(r => ({ value: r, label: r }))}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.78rem' }}>Pharmacist Verification Notes:</label>
              <textarea
                placeholder="Physical inspection remarks (e.g. Blister foil intact, no tampering, cold chain indicator green)..."
                value={inspectedNotes}
                onChange={(e) => setInspectedNotes(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button variant="outline" onClick={() => setIsProcessModalOpen(false)}>Cancel</Button>
              <Button variant="primary" icon={CheckCircle2} onClick={handleExecuteReturn}>
                Approve & Issue Credit Note
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
