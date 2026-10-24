import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Printer,
  FileText,
  Building2,
  IndianRupee,
  Calendar,
  Send,
  Eye,
  ChevronDown
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  TPA_INSURERS_LIST,
  PREAUTH_STATUS_CONFIG
} from './creditBillingConstants';

export function PreAuthDesk({
  preauthorizations = [],
  onCreatePreauth,
  onSubmitPreauth,
  onRecordDecision,
  onResolveQuery
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tpaFilter, setTpaFilter] = useState('all');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New Pre-Auth Form State
  const [formData, setFormData] = useState({
    patient_name: '',
    uhid: '',
    admission_id: '',
    room_no: 'Deluxe Room 204',
    primary_doctor: 'Dr. Anand Verma (Cardiothoracic Surgery)',
    insurance_provider: 'Star Health & Allied Insurance',
    tpa_name: 'Star In-House Health TPA',
    policy_number: '',
    member_id: '',
    corporate_name: 'Retail Individual Gold',
    sum_insured: 500000,
    copay_percentage: 10,
    claim_type: 'Planned Cashless',
    estimated_stay_days: 4,
    provisional_diagnosis: '',
    proposed_procedure: '',
    room_nursing: 20000,
    icu_charges: 0,
    ot_anesthesia: 40000,
    surgeon_fees: 50000,
    diagnostics: 15000,
    pharmacy: 25000,
    implants: 0,
    clinical_justification: ''
  });

  // Decision Form State
  const [decisionData, setDecisionData] = useState({
    status: 'approved',
    approved_amount: '',
    approval_number: '',
    rejection_reason: ''
  });

  // Query Response State
  const [queryResponse, setQueryResponse] = useState({
    response_text: '',
    doc_reference: ''
  });

  // Calculations for new pre-auth total
  const calculatedTotal =
    Number(formData.room_nursing || 0) +
    Number(formData.icu_charges || 0) +
    Number(formData.ot_anesthesia || 0) +
    Number(formData.surgeon_fees || 0) +
    Number(formData.diagnostics || 0) +
    Number(formData.pharmacy || 0) +
    Number(formData.implants || 0);

  // Filtered List
  const filteredList = preauthorizations.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.insurance_provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.approval_number && item.approval_number.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesTpa = tpaFilter === 'all' || item.insurance_provider === tpaFilter;

    return matchesSearch && matchesStatus && matchesTpa;
  });

  // KPI Metrics
  const totalCount = preauthorizations.length;
  const approvedCount = preauthorizations.filter(p => p.status === 'approved' || p.status === 'partially_approved').length;
  const queriesCount = preauthorizations.filter(p => p.status === 'queries_raised').length;
  const pendingCount = preauthorizations.filter(p => p.status === 'pending' || p.status === 'submitted').length;
  const totalApprovedAmount = preauthorizations.reduce((acc, curr) => acc + Number(curr.approved_amount || 0), 0);

  // Submit Handler for New Pre-Auth
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.policy_number || !formData.provisional_diagnosis) {
      alert('Please fill in mandatory fields: Patient Name, Policy Number, and Provisional Diagnosis.');
      return;
    }

    const newRecord = {
      ...formData,
      id: `pa-${Date.now().toString().slice(-4)}`,
      requested_amount: calculatedTotal,
      approved_amount: 0,
      status: 'submitted',
      cost_breakdown: {
        room_nursing: Number(formData.room_nursing || 0),
        icu_charges: Number(formData.icu_charges || 0),
        ot_anesthesia: Number(formData.ot_anesthesia || 0),
        surgeon_fees: Number(formData.surgeon_fees || 0),
        diagnostics: Number(formData.diagnostics || 0),
        pharmacy: Number(formData.pharmacy || 0),
        implants: Number(formData.implants || 0)
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onCreatePreauth(newRecord);
    setIsNewModalOpen(false);
  };

  // Submit Handler for Decision
  const handleDecisionSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    onRecordDecision(selectedItem.id, {
      status: decisionData.status,
      approved_amount: decisionData.status === 'rejected' ? 0 : Number(decisionData.approved_amount || 0),
      approval_number: decisionData.approval_number || `AL-${Date.now().toString().slice(-6)}`,
      rejection_reason: decisionData.rejection_reason
    });

    setIsDecisionModalOpen(false);
    setSelectedItem(null);
  };

  // Submit Handler for Query Response
  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    onResolveQuery(selectedItem.id, queryResponse);
    setIsQueryModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Total Pre-Auths</span>
            <ShieldCheck size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Active cashless patient requests
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Cashless Approved</span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ₹{totalApprovedAmount.toLocaleString('en-IN')} cumulative authorized
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>TPA Queries Raised</span>
            <HelpCircle size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {queriesCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Action required from clinical desk
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Pending / In Review</span>
            <Clock size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Turnaround time SLA: &lt; 2 hrs
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search Patient, UHID, Policy, AL No..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'partially_approved', label: 'Partially Approved' },
                  { value: 'queries_raised', label: 'Query Raised' },
                  { value: 'submitted', label: 'Submitted to TPA' },
                  { value: 'pending', label: 'Draft' },
                  { value: 'rejected', label: 'Denied' }
                ]}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                value={tpaFilter}
                onChange={(e) => setTpaFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Insurers / TPAs' },
                  ...TPA_INSURERS_LIST.map(t => ({ value: t.name, label: t.name }))
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setFormData({
                patient_name: '',
                uhid: `UHID-2026-0${Math.floor(100 + Math.random() * 900)}`,
                admission_id: `adm-${Math.floor(910 + Math.random() * 90)}`,
                room_no: 'Semi-Private 302',
                primary_doctor: 'Dr. Anand Verma (Cardiothoracic Surgery)',
                insurance_provider: 'Star Health & Allied Insurance',
                tpa_name: 'Star In-House Health TPA',
                policy_number: '',
                member_id: '',
                corporate_name: 'Individual Comprehensive Health',
                sum_insured: 500000,
                copay_percentage: 10,
                claim_type: 'Planned Cashless',
                estimated_stay_days: 3,
                provisional_diagnosis: '',
                proposed_procedure: '',
                room_nursing: 20000,
                icu_charges: 0,
                ot_anesthesia: 35000,
                surgeon_fees: 45000,
                diagnostics: 15000,
                pharmacy: 20000,
                implants: 0,
                clinical_justification: ''
              });
              setIsNewModalOpen(true);
            }}
          >
            New Pre-Authorization Request
          </Button>
        </div>
      </Card>

      {/* Main Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Patient Details</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Insurer / TPA & Policy</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Diagnosis & Procedure</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Requested</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Approved</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No pre-authorization records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = PREAUTH_STATUS_CONFIG[item.status] || PREAUTH_STATUS_CONFIG.pending;
                  const StatusIcon = statusConf.icon;

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
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.uhid} • {item.room_no || 'OPD / Day Care'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                          {item.primary_doctor}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{item.insurance_provider}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Pol: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{item.policy_number}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                          Sum Insured: ₹{Number(item.sum_insured || 0).toLocaleString('en-IN')} • Co-pay: {item.copay_percentage || 0}%
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '300px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.proposed_procedure || 'Medical Inpatient Management'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.provisional_diagnosis}
                        </div>
                        {item.claim_type && (
                          <div style={{ marginTop: '4px' }}>
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                              {item.claim_type} ({item.estimated_stay_days || 3} Days)
                            </span>
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        ₹{Number(item.requested_amount || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: item.approved_amount > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                          ₹{Number(item.approved_amount || 0).toLocaleString('en-IN')}
                        </div>
                        {item.approval_number && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>
                            {item.approval_number}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={statusConf.variant} size="sm">
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {statusConf.label}
                        </Badge>
                        {item.tpa_query && item.status === 'queries_raised' && (
                          <div style={{ fontSize: '0.7rem', color: '#B45309', marginTop: '4px', fontWeight: '500' }}>
                            Query: {item.tpa_query.query_text.slice(0, 45)}...
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {item.status === 'queries_raised' && (
                            <Button
                              size="sm"
                              variant="soft"
                              onClick={() => {
                                setSelectedItem(item);
                                setQueryResponse({
                                  response_text: '',
                                  doc_reference: 'USG Abdomen Scan + Clinical Chart Attached'
                                });
                                setIsQueryModalOpen(true);
                              }}
                            >
                              Resolve Query
                            </Button>
                          )}

                          {item.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              icon={Send}
                              onClick={() => onSubmitPreauth(item.id)}
                            >
                              Submit
                            </Button>
                          )}

                          {item.status === 'submitted' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setDecisionData({
                                  status: 'approved',
                                  approved_amount: item.requested_amount,
                                  approval_number: `AL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
                                  rejection_reason: ''
                                });
                                setIsDecisionModalOpen(true);
                              }}
                            >
                              Record Decision
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Printer}
                            title="Print / View IRDAI Pre-Auth Form"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsPrintModalOpen(true);
                            }}
                          >
                            Form
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

      {/* MODAL 1: NEW PRE-AUTHORIZATION REQUEST */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="New IRDAI Cashless Pre-Authorization Request"
        subtitle="Complete Annexure-C cashless medical authorization details for insurer submission."
        maxWidth="840px"
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient & Policy Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <Input
              label="Patient Full Name"
              required
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              placeholder="e.g. Ramesh Chandra"
            />
            <Input
              label="Patient UHID"
              required
              value={formData.uhid}
              onChange={(e) => setFormData({ ...formData, uhid: e.target.value })}
            />
            <Input
              label="Room / Ward Type"
              value={formData.room_no}
              onChange={(e) => setFormData({ ...formData, room_no: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <Select
              label="Insurance Provider / Company"
              required
              value={formData.insurance_provider}
              onChange={(e) => {
                const ins = e.target.value;
                setFormData({
                  ...formData,
                  insurance_provider: ins,
                  tpa_name: `${ins} In-House / Designated Desk`
                });
              }}
              options={TPA_INSURERS_LIST.map(t => ({ value: t.name, label: t.name }))}
            />
            <Input
              label="Insurance Policy Number"
              required
              value={formData.policy_number}
              onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
              placeholder="e.g. STAR-IND-9940129"
            />
            <Input
              label="Member ID / TPA Card No"
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              placeholder="e.g. MEM-881920"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <Select
              label="Cashless Claim Type"
              value={formData.claim_type}
              onChange={(e) => setFormData({ ...formData, claim_type: e.target.value })}
              options={[
                { value: 'Planned Cashless', label: 'Planned Cashless (Elective)' },
                { value: 'Emergency Cashless', label: 'Emergency Cashless' },
                { value: 'Day Care Procedure', label: 'Day Care Procedure' }
              ]}
            />
            <Input
              label="Sum Insured (₹)"
              type="number"
              value={formData.sum_insured}
              onChange={(e) => setFormData({ ...formData, sum_insured: e.target.value })}
            />
            <Input
              label="Co-Pay Clause (%)"
              type="number"
              value={formData.copay_percentage}
              onChange={(e) => setFormData({ ...formData, copay_percentage: e.target.value })}
            />
            <Input
              label="Expected Stay (Days)"
              type="number"
              value={formData.estimated_stay_days}
              onChange={(e) => setFormData({ ...formData, estimated_stay_days: e.target.value })}
            />
          </div>

          {/* Clinical Details */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.88rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
              Clinical Details & Surgical Proposal
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <Input
                label="Provisional Diagnosis (with ICD-10)"
                required
                value={formData.provisional_diagnosis}
                onChange={(e) => setFormData({ ...formData, provisional_diagnosis: e.target.value })}
                placeholder="e.g. Inguinal Hernia (ICD-10: K40.9)"
              />
              <Input
                label="Proposed Procedure / Treatment"
                required
                value={formData.proposed_procedure}
                onChange={(e) => setFormData({ ...formData, proposed_procedure: e.target.value })}
                placeholder="e.g. Laparoscopic TEP Hernia Repair with Prolene Mesh"
              />
              <Input
                label="Attending Consultant Doctor"
                value={formData.primary_doctor}
                onChange={(e) => setFormData({ ...formData, primary_doctor: e.target.value })}
              />
            </div>
          </div>

          {/* Itemized Cost Breakdown */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '0.86rem', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                Itemized Estimated Cost Breakdown
              </h4>
              <div style={{ fontSize: '0.94rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                Total Request: ₹{calculatedTotal.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              <Input
                label="Room & Nursing (₹)"
                type="number"
                value={formData.room_nursing}
                onChange={(e) => setFormData({ ...formData, room_nursing: e.target.value })}
              />
              <Input
                label="ICU / HDU (₹)"
                type="number"
                value={formData.icu_charges}
                onChange={(e) => setFormData({ ...formData, icu_charges: e.target.value })}
              />
              <Input
                label="OT & Anesthesia (₹)"
                type="number"
                value={formData.ot_anesthesia}
                onChange={(e) => setFormData({ ...formData, ot_anesthesia: e.target.value })}
              />
              <Input
                label="Surgeon Fees (₹)"
                type="number"
                value={formData.surgeon_fees}
                onChange={(e) => setFormData({ ...formData, surgeon_fees: e.target.value })}
              />
              <Input
                label="Diagnostics (₹)"
                type="number"
                value={formData.diagnostics}
                onChange={(e) => setFormData({ ...formData, diagnostics: e.target.value })}
              />
              <Input
                label="Pharmacy & Meds (₹)"
                type="number"
                value={formData.pharmacy}
                onChange={(e) => setFormData({ ...formData, pharmacy: e.target.value })}
              />
              <Input
                label="Implants / Stents (₹)"
                type="number"
                value={formData.implants}
                onChange={(e) => setFormData({ ...formData, implants: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Clinical Justification & Case History Summary
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '0.84rem',
                minHeight: '70px',
                resize: 'vertical'
              }}
              value={formData.clinical_justification}
              onChange={(e) => setFormData({ ...formData, clinical_justification: e.target.value })}
              placeholder="Clinical symptoms, investigation findings, and reasons why surgical intervention/admission is required..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Send}>
              Submit Request to Insurer
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RECORD TPA DECISION */}
      {selectedItem && (
        <Modal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          title="Record Insurer / TPA Pre-Auth Decision"
          subtitle={`Recording authorization decision for ${selectedItem.patient_name} (${selectedItem.insurance_provider}).`}
          maxWidth="520px"
        >
          <form onSubmit={handleDecisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFB', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <div><strong>Requested Amount:</strong> ₹{Number(selectedItem.requested_amount || 0).toLocaleString('en-IN')}</div>
              <div><strong>Procedure:</strong> {selectedItem.proposed_procedure}</div>
            </div>

            <Select
              label="Authorization Decision"
              value={decisionData.status}
              onChange={(e) => setDecisionData({ ...decisionData, status: e.target.value })}
              options={[
                { value: 'approved', label: 'Cashless Approved in Full' },
                { value: 'partially_approved', label: 'Partially Approved (Reduced Limit)' },
                { value: 'rejected', label: 'Cashless Denied / Repudiated' }
              ]}
            />

            {decisionData.status !== 'rejected' ? (
              <>
                <Input
                  label="Approved Amount (₹)"
                  required
                  type="number"
                  value={decisionData.approved_amount}
                  onChange={(e) => setDecisionData({ ...decisionData, approved_amount: e.target.value })}
                  placeholder="e.g. 250000"
                />
                <Input
                  label="Approval Letter Reference (AL Number)"
                  required
                  value={decisionData.approval_number}
                  onChange={(e) => setDecisionData({ ...decisionData, approval_number: e.target.value })}
                  placeholder="e.g. AL-2026-STAR-99201"
                />
              </>
            ) : (
              <Input
                label="Rejection / Denial Reason"
                required
                value={decisionData.rejection_reason}
                onChange={(e) => setDecisionData({ ...decisionData, rejection_reason: e.target.value })}
                placeholder="e.g. Non-disclosure of pre-existing ailment / treatment outside policy scope"
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setIsDecisionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save & Update Pre-Auth
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: RESOLVE TPA QUERY */}
      {selectedItem && selectedItem.tpa_query && (
        <Modal
          isOpen={isQueryModalOpen}
          onClose={() => setIsQueryModalOpen(false)}
          title="Resolve TPA Query & Submit Clarification"
          subtitle={`Responding to query raised by ${selectedItem.insurance_provider} on claim.`}
          maxWidth="560px"
        >
          <form onSubmit={handleQuerySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#FEF3C7', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #FCD34D' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#92400E', textTransform: 'uppercase' }}>
                Query from TPA ({selectedItem.tpa_query.query_id || 'QRY-01'}):
              </div>
              <div style={{ fontSize: '0.86rem', color: '#78350F', marginTop: '4px', lineHeight: '1.4' }}>
                "{selectedItem.tpa_query.query_text}"
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
                Hospital Clarification & Medical Justification Response *
              </label>
              <textarea
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontFamily: 'inherit',
                  fontSize: '0.84rem',
                  minHeight: '90px',
                  resize: 'vertical'
                }}
                required
                value={queryResponse.response_text}
                onChange={(e) => setQueryResponse({ ...queryResponse, response_text: e.target.value })}
                placeholder="Explain the clinical necessity or address the missing document requirement requested by the auditor..."
              />
            </div>

            <Input
              label="Supporting Documents Attached"
              value={queryResponse.doc_reference}
              onChange={(e) => setQueryResponse({ ...queryResponse, doc_reference: e.target.value })}
              placeholder="e.g. Pelvic USG Scan Plate Signed + Previous 6 Month Prescriptions PDF"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button variant="outline" onClick={() => setIsQueryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Send}>
                Submit Query Resolution
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: IRDAI CASHLESS PRE-AUTH FORM PRINT PREVIEW */}
      {selectedItem && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="IRDAI Cashless Request Form (Annexure-C)"
          subtitle="Standardized insurance pre-authorization requisition for in-patient cashless hospitalization."
          maxWidth="760px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              id="irdai-preauth-sheet"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '24px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: '#1E293B',
                lineHeight: '1.45'
              }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0D9488', paddingBottom: '12px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A', textTransform: 'uppercase' }}>
                  MEDICS PRIME MULTISPECIALTY HOSPITAL
                </h3>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  ROHINI Registered Hospital Code: 89004812 • NABH Accredited Cashless Desk
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.88rem', fontWeight: '700', color: '#0D9488', letterSpacing: '0.04em' }}>
                  REQUEST FOR CASHLESS HOSPITALIZATION FOR MEDICAL INSURANCE POLICY (ANNEXURE - C)
                </div>
              </div>

              {/* Grid 1: Patient & TPA */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>1. PATIENT IDENTIFICATION</div>
                  <div><strong>Name:</strong> {selectedItem.patient_name}</div>
                  <div><strong>UHID:</strong> {selectedItem.uhid}</div>
                  <div><strong>Admission Ref:</strong> {selectedItem.admission_id}</div>
                  <div><strong>Ward/Bed:</strong> {selectedItem.room_no || 'Inpatient Bed'}</div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>2. INSURANCE & TPA DETAILS</div>
                  <div><strong>Insurer:</strong> {selectedItem.insurance_provider}</div>
                  <div><strong>TPA Name:</strong> {selectedItem.tpa_name || 'In-House'}</div>
                  <div><strong>Policy No:</strong> {selectedItem.policy_number}</div>
                  <div><strong>Member Card No:</strong> {selectedItem.member_id || 'N/A'}</div>
                </div>
              </div>

              {/* Grid 2: Clinical */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '4px', marginBottom: '14px' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>3. CLINICAL ADMISSION DETAILS</div>
                <div><strong>Provisional Diagnosis:</strong> {selectedItem.provisional_diagnosis}</div>
                <div><strong>Proposed Procedure:</strong> {selectedItem.proposed_procedure}</div>
                <div><strong>Attending Doctor:</strong> {selectedItem.primary_doctor}</div>
                <div><strong>Expected Stay:</strong> {selectedItem.estimated_stay_days || 3} Days • <strong>Type:</strong> {selectedItem.claim_type}</div>
              </div>

              {/* Grid 3: Cost Breakup */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>4. ESTIMATED CHARGES SUMMARY</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #CBD5E1', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9' }}>
                      <th style={{ padding: '6px', border: '1px solid #CBD5E1', textAlign: 'left' }}>Charge Head</th>
                      <th style={{ padding: '6px', border: '1px solid #CBD5E1', textAlign: 'right' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>Room Rent, Nursing & Service Charges</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.room_nursing || 20000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>ICU / HDU Specialized Charges</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.icu_charges || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>OT, Anesthesia & Equipment Charges</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.ot_anesthesia || 35000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>Professional Surgeon & Consultant Fees</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.surgeon_fees || 45000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>Investigation, Diagnostic Pathology & Radiology</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.diagnostics || 15000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1' }}>Pharmacy, Consumables & Medicines</td>
                      <td style={{ padding: '5px', border: '1px solid #CBD5E1', textAlign: 'right' }}>
                        ₹{Number(selectedItem.cost_breakdown?.pharmacy || 20000).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr style={{ fontWeight: '700', backgroundColor: '#F8FAFC' }}>
                      <td style={{ padding: '6px', border: '1px solid #CBD5E1' }}>TOTAL ESTIMATED CASHLESS COST</td>
                      <td style={{ padding: '6px', border: '1px solid #CBD5E1', textAlign: 'right', color: '#0D9488' }}>
                        ₹{Number(selectedItem.requested_amount || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #94A3B8' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '35px' }} />
                  <div style={{ borderTop: '1px solid #64748B', paddingTop: '4px', fontWeight: '600' }}>
                    Signature of Patient / Insured
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '35px' }} />
                  <div style={{ borderTop: '1px solid #64748B', paddingTop: '4px', fontWeight: '600' }}>
                    Authorized Signatory & Hospital Stamp
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>TPA Cashless Desk • MedicsPrime HMS</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Annexure-C Form
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
