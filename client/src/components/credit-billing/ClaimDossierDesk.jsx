import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  FileCheck,
  Printer,
  Calendar,
  Send,
  Eye,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  MANDATORY_DOSSIER_DOCUMENTS,
  CLAIM_DOSSIER_STATUS_CONFIG
} from './creditBillingConstants';

export function ClaimDossierDesk({
  dossiers = [],
  onCreateDossier,
  onCompileDossier,
  onSubmitDossier,
  onRecordDecision
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);

  // New Dossier Form
  const [newForm, setNewForm] = useState({
    patient_name: 'Pooja Agarwal',
    uhid: 'UHID-2026-0005',
    admission_id: 'adm-865',
    bill_id: 'bill-final-865',
    tpa_name: 'Vidal Health Insurance TPA Pvt Ltd',
    insurance_provider: 'National Insurance Co Ltd',
    policy_number: 'NIC-MED-3301982',
    claim_reference: 'CLM-VH-2026-7718',
    discharge_date: new Date().toISOString().split('T')[0],
    total_bill_amount: 168000,
    approved_amount: 145000,
    patient_paid_share: 23000,
    claim_amount: 145000
  });

  // Dispatch Form
  const [dispatchForm, setDispatchForm] = useState({
    dispatch_mode: 'BlueDart Air Express (Physical Hardcopy)',
    courier_agency: 'BlueDart Express Ltd',
    tracking_number: '',
    target_settlement_date: ''
  });

  // Settlement Form
  const [settlementForm, setSettlementForm] = useState({
    settled_amount: '',
    deduction_amount: 0,
    settlement_reference: ''
  });

  // Filtered List
  const filteredList = dossiers.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dossier_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.claim_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tpa_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tracking_number && item.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalCount = dossiers.length;
  const inCompCount = dossiers.filter(d => d.status === 'in_compilation').length;
  const readyCount = dossiers.filter(d => d.status === 'ready_for_dispatch').length;
  const dispatchedCount = dossiers.filter(d => d.status === 'dispatched' || d.status === 'acknowledged').length;
  const settledCount = dossiers.filter(d => d.status === 'settled').length;
  const totalClaimValue = dossiers.reduce((acc, curr) => acc + Number(curr.claim_amount || 0), 0);

  // Helper for document readiness
  const getDocumentStats = (docList = []) => {
    const totalMandatory = MANDATORY_DOSSIER_DOCUMENTS.filter(m => m.mandatory).length;
    const verifiedMandatory = docList.filter(d => {
      const isMandatory = MANDATORY_DOSSIER_DOCUMENTS.find(m => m.id === d.id)?.mandatory;
      return isMandatory && (d.status === 'verified' || d.status === 'not_applicable');
    }).length;
    return {
      ready: verifiedMandatory >= totalMandatory,
      countStr: `${verifiedMandatory}/${totalMandatory} Mandatory Verified`
    };
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    // Default documents list from MANDATORY_DOSSIER_DOCUMENTS
    const defaultDocs = MANDATORY_DOSSIER_DOCUMENTS.map(m => ({
      id: m.id,
      code: m.code,
      name: m.name,
      status: m.code === 'IMP_05' ? 'not_applicable' : 'verified',
      pages: m.code === 'IMP_05' ? 0 : 2
    }));

    const createdRecord = {
      ...newForm,
      id: `dos-${Date.now().toString().slice(-4)}`,
      dossier_number: `DOS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ready_for_dispatch',
      documents: defaultDocs,
      dispatch_mode: 'TPA e-Portal Direct Switch',
      courier_agency: 'Portal Direct Switch',
      tracking_number: '',
      dispatch_date: null,
      target_settlement_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onCreateDossier(createdRecord);
    setIsNewModalOpen(false);
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!selectedDossier) return;

    onSubmitDossier(selectedDossier.id, {
      ...dispatchForm,
      dispatch_date: new Date().toISOString()
    });

    setIsDispatchModalOpen(false);
    setSelectedDossier(null);
  };

  const handleSettlementSubmit = (e) => {
    e.preventDefault();
    if (!selectedDossier) return;

    onRecordDecision(selectedDossier.id, {
      status: 'settled',
      settled_amount: Number(settlementForm.settled_amount || selectedDossier.claim_amount),
      deduction_amount: Number(settlementForm.deduction_amount || 0),
      settlement_reference: settlementForm.settlement_reference || `UTR-${Date.now().toString().slice(-6)}`
    });

    setIsSettlementModalOpen(false);
    setSelectedDossier(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Total Dossiers</span>
            <FileSpreadsheet size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ₹{totalClaimValue.toLocaleString('en-IN')} total claim value
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>In Compilation</span>
            <Clock size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {inCompCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Collecting OT notes / bills
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Ready for Dispatch</span>
            <FileCheck size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '6px' }}>
            {readyCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            8-point checklist complete
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Dispatched / In Transit</span>
            <Truck size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {dispatchedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Courier / e-Portal submitted
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '300px' }}>
              <Input
                placeholder="Search Dossier No, Patient, AWB, TPA..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '200px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'in_compilation', label: 'In Compilation' },
                  { value: 'ready_for_dispatch', label: 'Ready for Dispatch' },
                  { value: 'dispatched', label: 'Dispatched to TPA' },
                  { value: 'acknowledged', label: 'Acknowledged' },
                  { value: 'settled', label: 'Settled' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsNewModalOpen(true)}
          >
            Create Claim Dossier
          </Button>
        </div>
      </Card>

      {/* Main Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Dossier & Patient</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>TPA & Claim Ref</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Mandatory 8-Doc Checklist</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Claim Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Dispatch / Transit</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No claim dossiers found.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = CLAIM_DOSSIER_STATUS_CONFIG[item.status] || CLAIM_DOSSIER_STATUS_CONFIG.in_compilation;
                  const StatusIcon = statusConf.icon;
                  const docStats = getDocumentStats(item.documents);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          {item.dossier_number}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#1E293B', marginTop: '2px', fontWeight: '600' }}>
                          {item.patient_name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                          {item.uhid} • Discharged: {item.discharge_date}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.tpa_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Claim Ref: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.claim_reference}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Pol: {item.policy_number}
                        </div>
                      </td>

                      {/* Interactive Document Checklist Indicator */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div
                          onClick={() => {
                            setSelectedDossier(item);
                            setIsChecklistModalOpen(true);
                          }}
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                          title="Click to view/verify full document checklist"
                        >
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: docStats.ready ? '#ECFDF5' : '#FEF3C7',
                              color: docStats.ready ? '#065F46' : '#92400E',
                              border: `1px solid ${docStats.ready ? '#A7F3D0' : '#FDE68A'}`
                            }}
                          >
                            {docStats.countStr}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-primary-teal)', textDecoration: 'underline' }}>
                            Inspect 8 Documents
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)', fontSize: '0.92rem' }}>
                          ₹{Number(item.claim_amount || 0).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Bill: ₹{Number(item.total_bill_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        {item.dispatch_date ? (
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.78rem' }}>
                              {item.dispatch_mode}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                              {item.tracking_number || 'E-Portal Direct'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                              Due: {item.target_settlement_date || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                            Not Dispatched
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={statusConf.variant} size="sm">
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {statusConf.label}
                        </Badge>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {item.status === 'in_compilation' && (
                            <Button
                              size="sm"
                              variant="soft"
                              onClick={() => {
                                onCompileDossier(item.id);
                              }}
                            >
                              Mark Ready
                            </Button>
                          )}

                          {item.status === 'ready_for_dispatch' && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Truck}
                              onClick={() => {
                                setSelectedDossier(item);
                                setDispatchForm({
                                  dispatch_mode: item.dispatch_mode || 'TPA e-Portal Direct Switch',
                                  courier_agency: item.courier_agency || 'BlueDart Air Express',
                                  tracking_number: `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`,
                                  target_settlement_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                });
                                setIsDispatchModalOpen(true);
                              }}
                            >
                              Dispatch
                            </Button>
                          )}

                          {item.status === 'dispatched' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDossier(item);
                                setSettlementForm({
                                  settled_amount: item.claim_amount,
                                  deduction_amount: 0,
                                  settlement_reference: `UTR-NEFT-${Math.floor(100000 + Math.random() * 900000)}`
                                });
                                setIsSettlementModalOpen(true);
                              }}
                            >
                              Settle
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Printer}
                            title="Print Transmittal Slip"
                            onClick={() => {
                              setSelectedDossier(item);
                              setIsChecklistModalOpen(true);
                            }}
                          >
                            Slip
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: CREATE NEW CLAIM DOSSIER */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create Final Insurance Claim Dossier"
        subtitle="Initiate post-discharge cashless dossier compilation for TPA submission."
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Patient Name"
              required
              value={newForm.patient_name}
              onChange={(e) => setNewForm({ ...newForm, patient_name: e.target.value })}
            />
            <Input
              label="Patient UHID"
              required
              value={newForm.uhid}
              onChange={(e) => setNewForm({ ...newForm, uhid: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Insurer / TPA Name"
              required
              value={newForm.tpa_name}
              onChange={(e) => setNewForm({ ...newForm, tpa_name: e.target.value })}
            />
            <Input
              label="Policy Number"
              required
              value={newForm.policy_number}
              onChange={(e) => setNewForm({ ...newForm, policy_number: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="TPA Claim Reference Number"
              required
              value={newForm.claim_reference}
              onChange={(e) => setNewForm({ ...newForm, claim_reference: e.target.value })}
              placeholder="e.g. CLM-MA-2026-90412"
            />
            <Input
              label="Discharge Date"
              type="date"
              required
              value={newForm.discharge_date}
              onChange={(e) => setNewForm({ ...newForm, discharge_date: e.target.value })}
            />
          </div>

          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input
                label="Total Hospital Bill (₹)"
                type="number"
                required
                value={newForm.total_bill_amount}
                onChange={(e) => setNewForm({ ...newForm, total_bill_amount: e.target.value })}
              />
              <Input
                label="Patient Share Paid (₹)"
                type="number"
                value={newForm.patient_paid_share}
                onChange={(e) => setNewForm({ ...newForm, patient_paid_share: e.target.value })}
              />
              <Input
                label="Net Claim to TPA (₹) *"
                type="number"
                required
                value={newForm.claim_amount}
                onChange={(e) => setNewForm({ ...newForm, claim_amount: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus}>
              Create Dossier
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: 8-POINT MANDATORY DOCUMENT CHECKLIST */}
      {selectedDossier && (
        <Modal
          isOpen={isChecklistModalOpen}
          onClose={() => setIsChecklistModalOpen(false)}
          title={`Mandatory Claim Checklist: ${selectedDossier.dossier_number}`}
          subtitle={`Inspection of 8 essential documents for ${selectedDossier.patient_name} (${selectedDossier.tpa_name}).`}
          maxWidth="720px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(selectedDossier.documents || MANDATORY_DOSSIER_DOCUMENTS).map((doc, idx) => {
                const isVerified = doc.status === 'verified';
                const isNA = doc.status === 'not_applicable';

                return (
                  <div
                    key={doc.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: isVerified ? '#F0FDF4' : isNA ? '#F8FAFC' : '#FFFBEB',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isVerified ? '#BBF7D0' : isNA ? '#E2E8F0' : '#FDE68A'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-text-secondary)', width: '65px' }}>
                        {doc.code || `DOC_${idx+1}`}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: '600', color: '#0F172A' }}>
                          {doc.name}
                        </div>
                        {doc.pages > 0 && (
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {doc.pages} pages attached & stamped
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant={isVerified ? 'success' : isNA ? 'gray' : 'warning'} size="sm">
                        {isVerified ? 'Verified' : isNA ? 'N/A' : 'Missing'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <Button
                variant="outline"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Transmittal Slip
              </Button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="outline" onClick={() => setIsChecklistModalOpen(false)}>
                  Close
                </Button>
                {selectedDossier.status === 'in_compilation' && (
                  <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => {
                      onCompileDossier(selectedDossier.id);
                      setIsChecklistModalOpen(false);
                    }}
                  >
                    Confirm Ready for Dispatch
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: DISPATCH CLAIM DOSSIER */}
      {selectedDossier && (
        <Modal
          isOpen={isDispatchModalOpen}
          onClose={() => setIsDispatchModalOpen(false)}
          title={`Dispatch Dossier to TPA: ${selectedDossier.dossier_number}`}
          subtitle={`Log courier AWB or portal transmission for ${selectedDossier.tpa_name}.`}
          maxWidth="520px"
        >
          <form onSubmit={handleDispatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Select
              label="Submission Mode"
              value={dispatchForm.dispatch_mode}
              onChange={(e) => setDispatchForm({ ...dispatchForm, dispatch_mode: e.target.value })}
              options={[
                { value: 'TPA e-Portal Direct Switch', label: 'TPA e-Portal Direct Switch (Paperless)' },
                { value: 'BlueDart Air Express (Physical Hardcopy)', label: 'BlueDart Air Express (Physical Hardcopy)' },
                { value: 'DTDC Courier Service', label: 'DTDC Courier Service' },
                { value: 'Hand Delivery by Hospital Liaison', label: 'Hand Delivery by Hospital Liaison' }
              ]}
            />

            <Input
              label="Courier / Portal Agency Name"
              required
              value={dispatchForm.courier_agency}
              onChange={(e) => setDispatchForm({ ...dispatchForm, courier_agency: e.target.value })}
            />

            <Input
              label="Tracking / AWB Number or Portal Claim ID"
              required
              value={dispatchForm.tracking_number}
              onChange={(e) => setDispatchForm({ ...dispatchForm, tracking_number: e.target.value })}
              placeholder="e.g. BLUEDART-AWB-9940128"
            />

            <Input
              label="Target Settlement Date (SLA 21 Days)"
              type="date"
              required
              value={dispatchForm.target_settlement_date}
              onChange={(e) => setDispatchForm({ ...dispatchForm, target_settlement_date: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsDispatchModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send}>
                Confirm Dispatch
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: RECORD SETTLEMENT */}
      {selectedDossier && (
        <Modal
          isOpen={isSettlementModalOpen}
          onClose={() => setIsSettlementModalOpen(false)}
          title="Record Final Claim Settlement from TPA"
          subtitle={`Logging claim settlement for ${selectedDossier.patient_name} (${selectedDossier.tpa_name}).`}
          maxWidth="500px"
        >
          <form onSubmit={handleSettlementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFB', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <div><strong>Claim Amount Claimed:</strong> ₹{Number(selectedDossier.claim_amount).toLocaleString('en-IN')}</div>
              <div><strong>Tracking Ref:</strong> {selectedDossier.tracking_number}</div>
            </div>

            <Input
              label="Settled Remittance Amount (₹) *"
              required
              type="number"
              value={settlementForm.settled_amount}
              onChange={(e) => setSettlementForm({ ...settlementForm, settled_amount: e.target.value })}
            />

            <Input
              label="Disallowed / Deduction Amount (₹)"
              type="number"
              value={settlementForm.deduction_amount}
              onChange={(e) => setSettlementForm({ ...settlementForm, deduction_amount: e.target.value })}
            />

            <Input
              label="UTR / Settlement Voucher Reference No *"
              required
              value={settlementForm.settlement_reference}
              onChange={(e) => setSettlementForm({ ...settlementForm, settlement_reference: e.target.value })}
              placeholder="e.g. UTR-HDFC-991048201"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsSettlementModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Record Settlement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
