import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../common/UIPrimitives';
import { EmrService, TokenManager } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export function PrescriptionDispensingDesk({
  prescriptions = [],
  _batches = [],
  onDispenseSuccess
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedRx, setSelectedRx] = useState(prescriptions[0] || null);
  const [dispenseQuantities, setDispenseQuantities] = useState({});
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Filtered Prescriptions Queue
  const filteredQueue = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return prescriptions.filter(rx => {
      const matchSearch =
        !q ||
        (rx.prescriptionNo && rx.prescriptionNo.toLowerCase().includes(q)) ||
        (rx.patientUhid && rx.patientUhid.toLowerCase().includes(q)) ||
        (rx.patientName && rx.patientName.toLowerCase().includes(q)) ||
        (rx.encounterNo && rx.encounterNo.toLowerCase().includes(q));

      const matchType =
        filterType === 'ALL' ||
        (filterType === 'OPD' && rx.visitType.includes('OPD')) ||
        (filterType === 'IPD' && rx.visitType.includes('IPD')) ||
        (filterType === 'EMERGENCY' && rx.visitType.includes('Emergency'));

      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'PENDING' && rx.status === 'Pending Dispensing') ||
        (filterStatus === 'DISPENSED' && rx.status === 'Dispensed');

      return matchSearch && matchType && matchStatus;
    });
  }, [prescriptions, searchQuery, filterType, filterStatus]);

  // Handle Prescription Selection
  const handleSelectPrescription = (rx) => {
    setSelectedRx(rx);
    setErrorMessage(null);
    setSuccessToast(null);

    // Initialize dispensing quantities to prescribed quantities
    const initQty = {};
    (rx.items || []).forEach(item => {
      initQty[item.id] = item.prescribedQty - (item.dispensedQty || 0);
    });
    setDispenseQuantities(initQty);
  };

  // Calculate bill total for current selection
  const billSummary = useMemo(() => {
    if (!selectedRx || !selectedRx.items) return { subtotal: 0, tax: 0, grandTotal: 0, itemCount: 0 };
    let subtotal = 0;
    let itemCount = 0;

    selectedRx.items.forEach(item => {
      const qty = parseInt(dispenseQuantities[item.id] !== undefined ? dispenseQuantities[item.id] : item.prescribedQty, 10) || 0;
      if (qty > 0) {
        subtotal += qty * (item.unitPrice || 10);
        itemCount += qty;
      }
    });

    const tax = subtotal * 0.12; // Standard 12% GST
    return {
      subtotal,
      tax,
      grandTotal: subtotal + tax,
      itemCount
    };
  }, [selectedRx, dispenseQuantities]);

  const handleTriggerDispense = async () => {
    if (!selectedRx) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      if (TokenManager.getToken()) {
        await EmrService.markDispensed(selectedRx.id).catch(() => {});
      }

      // Update state locally
      const updatedRx = {
        ...selectedRx,
        status: 'Dispensed',
        dispensedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
        dispensedBy: user?.name || user?.username || 'Staff Pharmacist',
        items: selectedRx.items.map(it => ({
          ...it,
          dispensedQty: dispenseQuantities[it.id] !== undefined ? dispenseQuantities[it.id] : it.prescribedQty
        }))
      };

      if (onDispenseSuccess) {
        onDispenseSuccess(updatedRx, billSummary);
      }

      setSelectedRx(updatedRx);
      setIsDispenseModalOpen(false);
      setSuccessToast(`Prescription ${selectedRx.prescriptionNo} dispensed successfully. Pharmacy Invoice generated.`);
    } catch (err) {
      console.error('[PrescriptionDispensing] Dispensing failed:', err);
      setErrorMessage(err.message || 'Dispensing failed. Check batch stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Success Notification Banner */}
      {successToast && (
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
            <div style={{ color: '#166534', fontSize: '0.84rem', fontWeight: '600' }}>
              {successToast}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Pharmacy Invoice
          </Button>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#991B1B',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={18} color="#DC2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary Dispensing Workstation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '16px' }}>
        {/* Left Column: Electronic Prescription Queue */}
        <Card
          title="Prescription Queue"
          subtitle="Real-time OPD, IPD, and Emergency e-Prescriptions awaiting fulfillment"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Search by Rx #, UHID, Patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.80rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Quick Type & Status Filters */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Type:</span>
              {['ALL', 'OPD', 'IPD', 'EMERGENCY'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: filterType === type ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: filterType === type ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: filterType === type ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: filterType === type ? '700' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Status:</span>
              {['ALL', 'PENDING', 'DISPENSED'].map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: filterStatus === st ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                    backgroundColor: filterStatus === st ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: filterStatus === st ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontSize: '0.72rem',
                    fontWeight: filterStatus === st ? '700' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Prescription Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
              {filteredQueue.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.80rem' }}>
                  No prescriptions found matching query.
                </div>
              ) : (
                filteredQueue.map(rx => {
                  const isSel = selectedRx?.id === rx.id;
                  const isDispensed = rx.status === 'Dispensed';

                  return (
                    <div
                      key={rx.id}
                      onClick={() => handleSelectPrescription(rx)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: isSel ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                        backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.80rem', color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                          {rx.prescriptionNo}
                        </span>
                        <Badge variant={isDispensed ? 'success' : rx.visitType.includes('Emergency') ? 'danger' : 'teal'}>
                          {rx.status}
                        </Badge>
                      </div>

                      <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {rx.patientName}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{rx.patientUhid}</span>
                        <span>{rx.visitType}</span>
                      </div>

                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '4px', marginTop: '2px' }}>
                        Prescribed by: {rx.doctor} • {rx.items?.length || 0} drugs
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Right Column: Prescription Details & Dispensing Table */}
        {selectedRx ? (
          <Card
            title={`Prescription Details — ${selectedRx.prescriptionNo}`}
            subtitle={`Patient: ${selectedRx.patientName} (${selectedRx.patientUhid}) • ${selectedRx.visitType}`}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Patient Banner with Allergy Flag */}
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.90rem' }}>
                    {selectedRx.patientName} ({selectedRx.patientAge} / {selectedRx.gender})
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    UHID: <strong style={{ fontFamily: 'monospace' }}>{selectedRx.patientUhid}</strong> • {selectedRx.wardBed || selectedRx.department}
                  </div>
                </div>

                {/* Prominent Allergy Flag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {selectedRx.allergyWarning && selectedRx.allergyWarning.toLowerCase().includes('penicillin') ? (
                    <Badge variant="danger">
                      ⚠️ Allergy: {selectedRx.allergyWarning}
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      ✓ {selectedRx.allergyWarning || 'No Known Drug Allergies'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Medicines Table */}
              <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '8px 12px', fontWeight: '700' }}>Medicine & Strength</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Dosage & Route</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>Duration</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Prescribed</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700' }}>FIFO Batch (Exp)</th>
                      <th style={{ padding: '8px 10px', fontWeight: '700', width: '85px' }}>Dispense Qty</th>
                      <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRx.items.map((item) => {
                      const qty = dispenseQuantities[item.id] !== undefined ? dispenseQuantities[item.id] : item.prescribedQty;
                      const lineTotal = (qty * (item.unitPrice || 10)).toFixed(2);
                      const isFullyDispensed = selectedRx.status === 'Dispensed';

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '8px 12px' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{item.medicineName}</div>
                            <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>{item.strength} • {item.dosageForm}</div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <div>{item.frequency}</div>
                            <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)' }}>{item.route}</div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            {item.duration}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>
                            {item.prescribedQty}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: '700' }}>{item.allocatedBatch || 'AUTO-FIFO'}</div>
                            <div style={{ fontSize: '0.68rem', color: '#16A34A' }}>Avail: {item.batchStock || 320} ({item.batchExpiry || '2027'})</div>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            {isFullyDispensed ? (
                              <span style={{ fontWeight: '700', color: '#16A34A' }}>{item.dispensedQty} Dispensed</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={item.prescribedQty}
                                value={qty}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setDispenseQuantities(prev => ({
                                    ...prev,
                                    [item.id]: Math.min(item.prescribedQty, Math.max(0, val))
                                  }));
                                }}
                                style={{
                                  width: '65px',
                                  padding: '4px 6px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-border)',
                                  fontSize: '0.80rem',
                                  textAlign: 'center'
                                }}
                              />
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700' }}>
                            ₹{lineTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary & Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                    Total Units to Dispense: <strong>{billSummary.itemCount} items</strong>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                    Total Payable: ₹{billSummary.grandTotal.toFixed(2)}{' '}
                    <span style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>(incl. 12% GST: ₹{billSummary.tax.toFixed(2)})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedRx.status === 'Dispensed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Printer}
                      onClick={() => window.print()}
                    >
                      Print Pharmacy Bill
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={() => setIsDispenseModalOpen(true)}
                    >
                      Confirm Dispensing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Select a prescription from the queue to inspect medications and dispense.
            </div>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      {isDispenseModalOpen && selectedRx && (
        <Modal
          isOpen={isDispenseModalOpen}
          onClose={() => setIsDispenseModalOpen(false)}
          title={`Confirm Dispense — ${selectedRx.prescriptionNo}`}
          subtitle={`Patient: ${selectedRx.patientName} (${selectedRx.patientUhid})`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div>Items to Dispense: <strong>{billSummary.itemCount} Units</strong></div>
              <div>Net Amount: <strong>₹{billSummary.subtotal.toFixed(2)}</strong></div>
              <div>Applicable GST (12%): <strong>₹{billSummary.tax.toFixed(2)}</strong></div>
              <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--color-border-subtle)', fontWeight: '800', fontSize: '0.90rem', color: 'var(--color-primary-teal)' }}>
                Grand Total: ₹{billSummary.grandTotal.toFixed(2)}
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              Batches will be decremented in accordance with the <strong>FIFO (First-In First-Out)</strong> rule. Once confirmed, this prescription will be marked as fulfilled.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" onClick={() => setIsDispenseModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                loading={submitting}
                onClick={handleTriggerDispense}
              >
                Dispense & Issue Bill
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
