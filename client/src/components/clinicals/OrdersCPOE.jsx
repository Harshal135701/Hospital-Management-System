import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye
} from 'lucide-react';
import { Card, Button, Modal, Badge } from '../common/UIPrimitives';
import { DEMO_DIAGNOSTIC_CATALOG } from './clinicalDemoData';
import { ClinicalService } from '../../services/api';

export const OrdersCPOE = ({ patient, onUpdateOrders }) => {
  const existingOrders = patient?.orders || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Composer / Cart state
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState('Routine'); // 'Routine' | 'Urgent' | 'Stat'
  const [clinicalIndication, setClinicalIndication] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Modals & Feedback
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [orderList, setOrderList] = useState(existingOrders);
  const [catalog, setCatalog] = useState(DEMO_DIAGNOSTIC_CATALOG);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setOrderList(patient?.orders || []);
  }, [patient?.id, patient?.orders]);

  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      try {
        const remote = await ClinicalService.getOrderCatalog();
        if (isMounted && Array.isArray(remote) && remote.length > 0) {
          const mapped = remote.map((item) => ({
            id: item.id || item.item_code,
            code: item.item_code,
            name: item.name,
            category: item.category,
            department: item.department || `${item.category} Laboratory`,
            turnaroundTime: item.turnaround_time || '2-4 Hours',
            specimen: item.specimen || 'Clinical Specimen',
            description: item.description || item.name,
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.warn('[OrdersCPOE] Catalog fetch fallback:', err.message);
      }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const categories = ['All', 'Hematology', 'Biochemistry', 'Blood Bank', 'Radiology', 'Cardiology'];

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchesSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [catalog, searchTerm, selectedCategory]);

  const handleAddTest = (test) => {
    // Check if already in pending list
    if (pendingOrders.some(o => o.testId === test.id)) return;
    // Check if already in existing orders with active status
    if (orderList.some(o => o.testId === test.id && o.status !== 'Cancelled')) return;

    setPendingOrders(prev => [
      ...prev,
      {
        testId: test.id,
        testCode: test.code,
        testName: test.name,
        category: test.category,
        department: test.department,
        specimen: test.specimen,
        turnaroundTime: test.turnaroundTime
      }
    ]);
  };

  const handleRemovePending = (testId) => {
    setPendingOrders(prev => prev.filter(o => o.testId !== testId));
  };

  const handleOpenReview = () => {
    if (pendingOrders.length === 0) return;
    setIsReviewModalOpen(true);
  };

  const handleConfirmSubmitOrders = async () => {
    setIsSubmitting(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (patient?.is_live && patient?.encounter_id) {
      try {
        const payload = {
          encounter_id: patient.encounter_id,
          patient_id: patient.patient_id,
          doctor_id: patient.doctor_id,
          priority: selectedPriority.toLowerCase(),
          clinical_indication: clinicalIndication || 'Routine clinical investigation',
          instructions: specialInstructions || 'Standard department protocol',
          items: pendingOrders.map((item) => ({
            test_id: item.testId,
            item_code: item.testCode,
            item_name: item.testName,
            category: item.category,
            department: item.department,
            specimen: item.specimen
          }))
        };

        const createdRows = await ClinicalService.createOrdersBatch(payload);
        const mappedCreated = (createdRows || []).map((o) => ({
          id: o.id,
          testId: o.item_code || o.id,
          testCode: o.item_code,
          testName: o.item_name,
          category: o.category || 'Laboratory',
          priority: selectedPriority,
          indication: o.clinical_indication || clinicalIndication,
          instructions: o.instructions || specialInstructions,
          status: 'Submitted',
          orderedAt: `Today, ${timestamp}`
        }));

        const updated = [...orderList, ...mappedCreated];
        setOrderList(updated);
        if (onUpdateOrders) onUpdateOrders(updated);

        setPendingOrders([]);
        setClinicalIndication('');
        setSpecialInstructions('');
        setSelectedPriority('Routine');
        setIsReviewModalOpen(false);

        setToastMessage(`${mappedCreated.length} diagnostic order(s) successfully recorded in PostgreSQL.`);
        setTimeout(() => setToastMessage(''), 4500);
        return;
      } catch (err) {
        console.error('[OrdersCPOE] Order placement error:', err);
        setToastMessage(`Failed to place orders: ${err.message}`);
        setTimeout(() => setToastMessage(''), 5000);
      } finally {
        setIsSubmitting(false);
      }
    }

    const newPlacedOrders = pendingOrders.map((item, idx) => ({
      id: `ord-cpoe-${Date.now()}-${idx}`,
      testId: item.testId,
      testCode: item.testCode,
      testName: item.testName,
      category: item.category,
      priority: selectedPriority,
      indication: clinicalIndication || 'Routine clinical investigation',
      instructions: specialInstructions || 'Standard department protocol',
      status: 'Submitted',
      orderedAt: `Today, ${timestamp}`
    }));

    const updated = [...orderList, ...newPlacedOrders];
    setOrderList(updated);
    if (onUpdateOrders) {
      onUpdateOrders(updated);
    }

    // Reset composer
    setPendingOrders([]);
    setClinicalIndication('');
    setSpecialInstructions('');
    setSelectedPriority('Routine');
    setIsReviewModalOpen(false);
    setIsSubmitting(false);

    setToastMessage(`${newPlacedOrders.length} order(s) submitted locally for UI evaluation.`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleCancelOrder = async (orderId) => {
    if (patient?.is_live) {
      try {
        await ClinicalService.cancelOrder(orderId);
      } catch (err) {
        console.warn('[OrdersCPOE] Remote cancel error:', err.message);
      }
    }
    const updated = orderList.map(o => (o.id === orderId ? { ...o, status: 'Cancelled' } : o));
    setOrderList(updated);
    if (onUpdateOrders) {
      onUpdateOrders(updated);
    }
    setToastMessage('Order status changed to Cancelled.');
    setTimeout(() => setToastMessage(''), 3500);
  };

  const priorityColors = {
    Routine: { bg: 'var(--color-info-bg)', color: 'var(--color-info)', border: 'var(--color-info-border)' },
    Urgent: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    Stat: { bg: 'var(--color-error-bg)', color: 'var(--color-error)', border: 'var(--color-error-border)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Dynamic Status / Demonstration Notice Banner */}
      {patient?.is_live ? (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.84rem', color: '#166534', lineHeight: 1.45 }}>
            <strong>CPOE Clinical Order System Connected:</strong> Diagnostic orders for {patient.patient_name} are recorded to the PostgreSQL database under encounter <code>{patient.encounter_id || patient.appointment_number}</code>. Orders are queued for laboratory and radiology dispatch.
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFBEB',
            border: '1.5px solid #FCD34D',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}
        >
          <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.84rem', color: '#92400E', lineHeight: 1.45 }}>
            <strong>Demonstration Diagnostic Catalog (Frontend Prototype):</strong> Tests, specimens, and ordering workflows displayed here are simulated for user interface evaluation. Orders placed are retained in local application state and are <strong>not</strong> dispatched to real hospital laboratories or imaging systems.
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Two-Column Layout: Catalog (Left) + Order Composer / Cart (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left Column: Searchable Catalog */}
        <Card
          title="Diagnostic Test Catalog"
          subtitle="Search and select pathology, blood bank, imaging, and cardiology investigations."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="Search test by name, code, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.875rem'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--color-primary-teal)' : 'var(--color-border)',
                    backgroundColor: selectedCategory === cat ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    color: selectedCategory === cat ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Test Items List */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}
            >
              {filteredCatalog.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  No diagnostic investigations matching "{searchTerm}" in category "{selectedCategory}".
                </div>
              ) : (
                filteredCatalog.map((item) => {
                  const isPending = pendingOrders.some(o => o.testId === item.id);
                  const isAlreadyOrdered = orderList.some(o => o.testId === item.id && o.status !== 'Cancelled');
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'border-color 0.15s ease'
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                            {item.name}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontFamily: 'monospace',
                              fontWeight: '600',
                              color: 'var(--color-primary-teal)',
                              backgroundColor: 'var(--color-bg-pale-aqua)',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            {item.code}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.department} • Specimen: {item.specimen} • TAT: {item.turnaroundTime}
                        </div>
                      </div>

                      <Button
                        variant={isPending || isAlreadyOrdered ? 'soft' : 'outline'}
                        size="sm"
                        disabled={isPending || isAlreadyOrdered}
                        icon={isPending ? CheckCircle2 : Plus}
                        onClick={() => handleAddTest(item)}
                        style={{ flexShrink: 0 }}
                      >
                        {isPending ? 'Added' : isAlreadyOrdered ? 'Ordered' : 'Add'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Right Column: Order Composer & Requisition Batch */}
        <Card
          title="Order Requisition Composer"
          subtitle="Set priority, clinical indication, and review pending orders before submission."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Priority Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Requisition Priority
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Routine', 'Urgent', 'Stat'].map((pri) => {
                  const isSelected = selectedPriority === pri;
                  const cfg = priorityColors[pri];
                  return (
                    <button
                      type="button"
                      key={pri}
                      onClick={() => setSelectedPriority(pri)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        border: `1.5px solid ${isSelected ? cfg.color : 'var(--color-border)'}`,
                        backgroundColor: isSelected ? cfg.bg : '#FFFFFF',
                        color: isSelected ? cfg.color : 'var(--color-text-secondary)',
                        cursor: 'pointer'
                      }}
                    >
                      {pri === 'Stat' ? '⚡ Stat (Immediate)' : pri}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Tests Cart */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  Selected Tests ({pendingOrders.length})
                </label>
                {pendingOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPendingOrders([])}
                    style={{ background: 'none', border: 'none', color: 'var(--color-error)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  backgroundColor: '#F8FAFA',
                  minHeight: '110px',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}
              >
                {pendingOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
                    No tests added to order batch yet. Click "+ Add" on catalog items to the left.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pendingOrders.map((test) => (
                      <div
                        key={test.testId}
                        style={{
                          backgroundColor: '#FFFFFF',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div style={{ minWidth: 0, fontSize: '0.82rem' }}>
                          <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {test.testName}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px', fontSize: '0.72rem' }}>
                            ({test.testCode})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePending(test.testId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-error)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Remove test from order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clinical Indication */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Clinical Indication / Reason for Order *
              </label>
              <input
                type="text"
                placeholder="e.g. Evaluate exertional angina; rule out ischemia..."
                value={clinicalIndication}
                onChange={(e) => setClinicalIndication(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Special Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Special Clinical Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Supine resting test; fasting morning specimen..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Review and Submit Action */}
            <Button
              variant="primary"
              size="md"
              icon={Eye}
              disabled={pendingOrders.length === 0}
              onClick={handleOpenReview}
              style={{ width: '100%' }}
            >
              Review & Submit Orders ({pendingOrders.length})
            </Button>
          </div>
        </Card>
      </div>

      {/* Existing Orders Table for This Encounter */}
      <Card
        title="Diagnostic Requisitions for This Encounter"
        subtitle="Tracking status of ordered diagnostic laboratory, radiology, and cardiology investigations."
      >
        {orderList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No diagnostic orders placed for this patient encounter yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '8px 12px' }}>Order ID & Code</th>
                  <th style={{ padding: '8px 12px' }}>Test Name & Category</th>
                  <th style={{ padding: '8px 12px' }}>Priority</th>
                  <th style={{ padding: '8px 12px' }}>Clinical Indication</th>
                  <th style={{ padding: '8px 12px' }}>Timestamp</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orderList.map((ord) => {
                  const priCfg = priorityColors[ord.priority] || priorityColors.Routine;
                  const isCancelled = ord.status === 'Cancelled';
                  return (
                    <tr
                      key={ord.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        opacity: isCancelled ? 0.6 : 1
                      }}
                    >
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {ord.testCode}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          {ord.id}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {ord.testName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          {ord.category}
                        </div>
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: priCfg.bg,
                            color: priCfg.color,
                            border: `1px solid ${priCfg.border}`
                          }}
                        >
                          {ord.priority}
                        </span>
                      </td>

                      <td style={{ padding: '10px 12px', maxWidth: '240px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ord.indication || '—'}
                        </div>
                        {ord.instructions && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            Note: {ord.instructions}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--color-text-secondary)' }}>
                        {ord.orderedAt || '—'}
                      </td>

                      <td style={{ padding: '10px 12px' }}>
                        <Badge
                          variant={
                            ord.status === 'Submitted'
                              ? 'teal'
                              : ord.status === 'Draft'
                              ? 'warning'
                              : 'gray'
                          }
                          size="sm"
                        >
                          {ord.status}
                        </Badge>
                      </td>

                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        {!isCancelled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelOrder(ord.id)}
                            style={{ color: 'var(--color-error)' }}
                            title="Cancel this order"
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Review Modal before Submission */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review & Confirm Diagnostic Order Batch"
        subtitle={`Patient: ${patient?.patient_name} (${patient?.uhid})`}
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#92400E'
            }}
          >
            <strong>Local Demonstration Note:</strong> This requisition will be recorded in the local frontend state for UI validation. No backend database mutation will occur.
          </div>

          <div style={{ fontSize: '0.85rem' }}>
            <div><strong>Priority:</strong> {selectedPriority}</div>
            <div><strong>Indication:</strong> {clinicalIndication || 'None provided'}</div>
            {specialInstructions && <div><strong>Instructions:</strong> {specialInstructions}</div>}
          </div>

          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              Tests to be ordered ({pendingOrders.length}):
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            >
              {pendingOrders.map((t) => (
                <div
                  key={t.testId}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{t.testName}</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-teal)' }}>{t.testCode}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              paddingTop: '12px',
              borderTop: '1px solid var(--color-border-subtle)'
            }}
          >
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Back to Edit
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Send}
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleConfirmSubmitOrders}
            >
              Confirm & Submit Order Batch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
