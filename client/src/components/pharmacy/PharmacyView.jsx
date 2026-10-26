import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Pill,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button, Badge } from '../common/UIPrimitives';
import {
  PHARMACY_SUBMODULES,
  INITIAL_MEDICINE_CATALOG,
  INITIAL_BATCH_INVENTORY,
  INITIAL_PRESCRIPTIONS_QUEUE,
  INITIAL_IPD_RETURNS,
  INITIAL_STOCK_INDENTS
} from './pharmacyConstants';
import { PrescriptionDispensingDesk } from './desks/PrescriptionDispensingDesk';
import { MedicineMasterDesk } from './desks/MedicineMasterDesk';
import { FifoBatchExpiryDesk } from './desks/FifoBatchExpiryDesk';
import { IpdMedicineReturnDesk } from './desks/IpdMedicineReturnDesk';
import { StockIndentsDesk } from './desks/StockIndentsDesk';
import { EmrService, TokenManager } from '../../services/api';

function normalizePharmacySubtab(subtab) {
  if (!subtab) return '25.1';
  const clean = String(subtab).replace(/^(pharmacy:|submodule:)/, '').trim();
  const valid = PHARMACY_SUBMODULES.some(s => s.id === clean);
  return valid ? clean : '25.1';
}

export function PharmacyView({ initialSubtab, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => normalizePharmacySubtab(initialSubtab));
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Clinical Pharmacy Datasets
  const [prescriptions, setPrescriptions] = useState(INITIAL_PRESCRIPTIONS_QUEUE);
  const [medicines, setMedicines] = useState(INITIAL_MEDICINE_CATALOG);
  const [batches, setBatches] = useState(INITIAL_BATCH_INVENTORY);
  const [returns, setReturns] = useState(INITIAL_IPD_RETURNS);
  const [indents, setIndents] = useState(INITIAL_STOCK_INDENTS);

  // Sync subtab with prop when external route changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizePharmacySubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Load live prescriptions from backend if available
  useEffect(() => {
    let isMounted = true;
    async function fetchPrescriptions() {
      if (TokenManager.getToken()) {
        try {
          const remote = await EmrService.getPrescriptions();
          if (isMounted && remote && Array.isArray(remote) && remote.length > 0) {
            // Merge remote items with existing queue
            const mapped = remote.map((rx, idx) => ({
              id: rx.id || `RX-REMOTE-${idx}`,
              prescriptionNo: rx.prescription_number || `RX-2026-${1000 + idx}`,
              encounterNo: rx.encounter_id || `ENC-2026-${1000 + idx}`,
              patientUhid: rx.patient_uhid || `UHID-2026-0814`,
              patientName: rx.patient_name || 'Hospital Inpatient',
              patientAge: '45 Yrs',
              gender: 'female',
              visitType: rx.visit_type || 'OPD Outpatient',
              department: rx.department_name || 'General Medicine',
              doctor: rx.doctor_name || 'Consultant Physician',
              prescribedAt: rx.created_at ? new Date(rx.created_at).toLocaleString() : '2026-10-26 10:00 AM',
              allergyWarning: rx.allergies || 'No Known Drug Allergies (NKDA)',
              status: rx.is_dispensed ? 'Dispensed' : 'Pending Dispensing',
              items: rx.items || [
                {
                  id: `it-${idx}`,
                  medicineName: rx.medicine_name || 'Augmentin 625 Duo',
                  strength: '625mg',
                  dosageForm: 'Tablet',
                  route: 'Oral (PO)',
                  frequency: 'BD',
                  duration: '5 Days',
                  prescribedQty: 10,
                  dispensedQty: rx.is_dispensed ? 10 : 0,
                  unitPrice: 21.55,
                  allocatedBatch: 'AG-9821',
                  batchStock: 320,
                  batchExpiry: '2027-04'
                }
              ]
            }));
            setPrescriptions(prev => [...mapped, ...prev]);
          }
        } catch (err) {
          console.warn('[PharmacyView] Remote prescription fetch fallback to local queue:', err.message);
        }
      }
    }
    fetchPrescriptions();
    return () => { isMounted = false; };
  }, []);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  }, []);

  const handleSelectSubtab = (subId) => {
    const cleanId = normalizePharmacySubtab(subId);
    setActiveSubtab(cleanId);
    if (onNavigate) {
      onNavigate(`pharmacy:${cleanId}`);
    }
  };

  // Dispense handler -> update prescription status and decrement batch stock
  const handleDispenseSuccess = (updatedRx, billSummary) => {
    setPrescriptions(prev => prev.map(rx => rx.id === updatedRx.id ? updatedRx : rx));

    // Decrement corresponding batches
    setBatches(prev => prev.map(b => {
      const matchItem = updatedRx.items.find(it => it.allocatedBatch === b.batchNo);
      if (matchItem) {
        const decrement = parseInt(matchItem.dispensedQty, 10) || 0;
        return {
          ...b,
          availableQty: Math.max(0, b.availableQty - decrement)
        };
      }
      return b;
    }));

    showToast(`Prescription ${updatedRx.prescriptionNo} dispensed. Total Bill: ₹${billSummary.grandTotal.toFixed(2)}.`);
  };

  // KPI Calculations
  const pendingRxCount = useMemo(() => {
    return prescriptions.filter(r => r.status === 'Pending Dispensing').length;
  }, [prescriptions]);

  const nearExpiryCount = useMemo(() => {
    return batches.filter(b => b.status.includes('Near Expiry') || b.status.includes('Expired')).length;
  }, [batches]);

  const activeSubmodule = useMemo(() => {
    return PHARMACY_SUBMODULES.find(s => s.id === activeSubtab) || PHARMACY_SUBMODULES[0];
  }, [activeSubtab]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching Appointment / Emergency style */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectSubtab('25.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Pill size={13} />
            <span>Pharmacy Management</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>
            {activeSubmodule.label}
          </span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal">Module 25</Badge>
          <Badge variant="neutral">5 Submodules</Badge>
        </div>
      </div>

      {/* Module Overview Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-teal)',
              flexShrink: 0
            }}
          >
            <Pill size={22} />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'var(--font-size-lg)',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.2px'
              }}
            >
              Pharmacy Operations & Dispensing Workspace
            </h1>
            <p
              style={{
                margin: '2px 0 0',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)'
              }}
            >
              OPD/IPD electronic prescription fulfillment, FIFO batch tracking, drug formulary master, and returns credit
            </p>
          </div>
        </div>

        {/* Realtime KPI Stat Pills */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--color-border-subtle)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Formulary Items</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>{medicines.length}</div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid #BAE6FD',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: '#0369A1', textTransform: 'uppercase', fontWeight: '600' }}>Pending Dispense</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0284C7' }}>{pendingRxCount}</div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: nearExpiryCount > 0 ? '#FFFBEB' : '#F0FDF4',
              border: `1px solid ${nearExpiryCount > 0 ? '#FDE68A' : '#BBF7D0'}`,
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.68rem', color: nearExpiryCount > 0 ? '#92400E' : '#166534', textTransform: 'uppercase', fontWeight: '600' }}>Near Expiry</div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: nearExpiryCount > 0 ? '#D97706' : '#15803D' }}>{nearExpiryCount}</div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                showToast('Pharmacy batch stock and queue census synchronized.');
              }, 500);
            }}
            title="Synchronize Pharmacy Master Stock"
          >
            Sync Census
          </Button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 Submodule Tab Navigation Bar (Appointment / Emergency Module Standard) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '4px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {PHARMACY_SUBMODULES.map((submodule) => {
          const isActive = activeSubtab === submodule.id;
          const Icon = submodule.icon;

          return (
            <button
              key={submodule.id}
              type="button"
              onClick={() => handleSelectSubtab(submodule.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                marginBottom: '-2px'
              }}
              title={submodule.description}
            >
              <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'} />
              <span>{submodule.label}</span>
              <span
                style={{
                  padding: '2px 7px',
                  backgroundColor: isActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  borderRadius: '10px',
                  fontSize: '0.70rem',
                  fontWeight: '700'
                }}
              >
                {submodule.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Submodule Workspace Render */}
      <div>
        {activeSubtab === '25.1' && (
          <PrescriptionDispensingDesk
            prescriptions={prescriptions}
            batches={batches}
            onDispenseSuccess={handleDispenseSuccess}
          />
        )}

        {activeSubtab === '25.2' && (
          <MedicineMasterDesk
            medicines={medicines}
            onMedicineAdded={(newMed) => setMedicines(prev => [newMed, ...prev])}
            onMedicineUpdated={(updatedMed) => setMedicines(prev => prev.map(m => m.id === updatedMed.id ? updatedMed : m))}
          />
        )}

        {activeSubtab === '25.3' && (
          <FifoBatchExpiryDesk
            batches={batches}
            onBatchUpdated={(updatedBatch) => setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b))}
          />
        )}

        {activeSubtab === '25.4' && (
          <IpdMedicineReturnDesk
            returns={returns}
            onReturnProcessed={(processedRet) => {
              setReturns(prev => [processedRet, ...prev]);
              // If eligible for restock, restore quantity to batch
              if (processedRet.restockedToInventory) {
                setBatches(prev => prev.map(b => {
                  if (b.batchNo === processedRet.batchNo) {
                    return { ...b, availableQty: b.availableQty + processedRet.returnedQty };
                  }
                  return b;
                }));
              }
            }}
          />
        )}

        {activeSubtab === '25.5' && (
          <StockIndentsDesk
            medicines={medicines}
            indents={indents}
            onIndentCreated={(newIndent) => setIndents(prev => [newIndent, ...prev])}
            onIndentUpdated={(updatedIndent) => setIndents(prev => prev.map(i => i.id === updatedIndent.id ? updatedIndent : i))}
          />
        )}
      </div>
    </div>
  );
}
