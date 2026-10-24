import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  IndianRupee,
  Layers,
  Send,
  Eye,
  History,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { ENHANCEMENT_STATUS_CONFIG } from './creditBillingConstants';

export function EnhancementRequestDesk({
  enhancements = [],
  onCreateEnhancement,
  onSubmitEnhancement,
  onRecordDecision
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // New Enhancement Form State
  const [newForm, setNewForm] = useState({
    patient_name: 'Rajesh Sharma',
    uhid: 'UHID-2026-0042',
    admission_id: 'adm-901',
    preauthorization_id: 'pa-001',
    room_no: 'ICU Bed 04 (Cardiac Wing)',
    tpa_name: 'Star Health & Allied Insurance',
    current_approved_amount: 350000,
    current_running_bill: 382400,
    requested_additional_amount: 60000,
    justification_category: 'ICU / CCU Shift & High-End Drugs',
    reason: 'Prolonged inotropic support and delayed extubation requiring 2 more ICU days',
    doctor_notes: 'Patient experienced post-operative ventricular arrhythmias. Inotropic infusions (Norad + Milrinone) continued for hemodynamic support.',
    supporting_details: 'Telemetry strip + ABG report x 4 + Echo report showing LVEF 40%'
  });

  // Decision Form State
  const [decisionForm, setDecisionForm] = useState({
    status: 'approved',
    approved_additional_amount: '',
    cumulative_approved_amount: '',
    enhancement_number: '',
    rejection_reason: ''
  });

  const revisedTotalRequested =
    Number(newForm.current_approved_amount || 0) + Number(newForm.requested_additional_amount || 0);

  // Filtered List
  const filteredList = enhancements.filter((item) => {
    const matchesSearch =
      item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.uhid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tpa_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalCount = enhancements.length;
  const underReviewCount = enhancements.filter(e => e.status === 'requested' || e.status === 'under_review').length;
  const approvedCount = enhancements.filter(e => e.status === 'approved' || e.status === 'partially_approved').length;
  const totalApprovedAdditional = enhancements.reduce((acc, curr) => acc + Number(curr.approved_additional_amount || 0), 0);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newForm.requested_additional_amount || Number(newForm.requested_additional_amount) <= 0) {
      alert('Please enter a valid requested additional amount.');
      return;
    }

    const createdRecord = {
      ...newForm,
      id: `enh-${Date.now().toString().slice(-4)}`,
      previous_approved_amount: Number(newForm.current_approved_amount),
      requested_additional_amount: Number(newForm.requested_additional_amount),
      revised_requested_amount: revisedTotalRequested,
      approved_additional_amount: 0,
      cumulative_approved_amount: Number(newForm.current_approved_amount),
      status: 'requested',
      enhancement_number: `ENH-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      history: [
        {
          stage: 'Initial Pre-Auth',
          requested: newForm.current_approved_amount,
          approved: newForm.current_approved_amount,
          date: '2026-10-18T14:30:00Z',
          ref: 'AL-INITIAL'
        },
        {
          stage: 'Enhancement Request',
          requested: Number(newForm.requested_additional_amount),
          approved: 0,
          date: new Date().toISOString(),
          ref: 'PENDING'
        }
      ]
    };

    onCreateEnhancement(createdRecord);
    setIsNewModalOpen(false);
  };

  const handleDecisionSubmit = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const addApproved = decisionForm.status === 'rejected' ? 0 : Number(decisionForm.approved_additional_amount || 0);
    const cumApproved = Number(selectedItem.current_approved_amount || 0) + addApproved;

    onRecordDecision(selectedItem.id, {
      status: decisionForm.status,
      approved_additional_amount: addApproved,
      cumulative_approved_amount: cumApproved,
      enhancement_number: decisionForm.enhancement_number || `ENH-APP-${Date.now().toString().slice(-4)}`,
      rejection_reason: decisionForm.rejection_reason
    });

    setIsDecisionModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Active Enhancements</span>
            <TrendingUp size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Mid-stay cashless limit extensions
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Under TPA Review</span>
            <Clock size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {underReviewCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Awaiting revised authorization letter
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Enhancements Approved</span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            ₹{totalApprovedAdditional.toLocaleString('en-IN')} additional limit granted
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Running Bill Breaches</span>
            <AlertTriangle size={18} style={{ color: 'var(--color-error)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-error)', marginTop: '6px' }}>
            {enhancements.filter(e => (e.current_running_bill || 0) > (e.current_approved_amount || 0)).length}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Bill exceeding authorized ceiling
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '300px' }}>
              <Input
                placeholder="Search Inpatient, UHID, TPA, Reason..."
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
                  { value: 'requested', label: 'Submitted to TPA' },
                  { value: 'under_review', label: 'Under Review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'partially_approved', label: 'Partially Approved' },
                  { value: 'rejected', label: 'Denied' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsNewModalOpen(true)}
          >
            Create Enhancement Request
          </Button>
        </div>
      </Card>

      {/* Active Cashless Running Bill Gauge Cards & Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Inpatient & TPA</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', minWidth: '220px' }}>
                  Bill vs Approved Ceiling
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Clinical Justification</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Addl. Requested</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Revised Total</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No enhancement requests found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = ENHANCEMENT_STATUS_CONFIG[item.status] || ENHANCEMENT_STATUS_CONFIG.draft;
                  const StatusIcon = statusConf.icon;

                  const runningBill = Number(item.current_running_bill || 0);
                  const approvedCap = Number(item.current_approved_amount || 0);
                  const utilizationPercent = approvedCap > 0 ? Math.round((runningBill / approvedCap) * 100) : 100;
                  const isBreached = runningBill > approvedCap;
                  const isWarning = utilizationPercent >= 85 && !isBreached;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: isBreached ? '#FFF8F8' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{item.patient_name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.uhid} • {item.room_no}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', marginTop: '2px', fontWeight: '500' }}>
                          {item.tpa_name}
                        </div>
                      </td>

                      {/* Visual Bill vs Cap Gauge */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', color: isBreached ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                            Bill: ₹{runningBill.toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            Cap: ₹{approvedCap.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            height: '7px',
                            backgroundColor: '#E2E8F0',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(utilizationPercent, 100)}%`,
                              height: '100%',
                              backgroundColor: isBreached ? 'var(--color-error)' : isWarning ? '#F59E0B' : 'var(--color-success)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem' }}>
                          <span style={{ fontWeight: '600', color: isBreached ? 'var(--color-error)' : isWarning ? '#D97706' : '#16A34A' }}>
                            {utilizationPercent}% Used
                          </span>
                          {isBreached && (
                            <span style={{ color: 'var(--color-error)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                              <AlertCircle size={10} /> Shortfall ₹{(runningBill - approvedCap).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '280px' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B', fontSize: '0.8rem' }}>
                          {item.justification_category || 'Clinical Stay Extension'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                          {item.reason}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                          +₹{Number(item.requested_additional_amount || 0).toLocaleString('en-IN')}
                        </div>
                        {item.approved_additional_amount > 0 && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '2px', fontWeight: '600' }}>
                            Apprv: +₹{Number(item.approved_additional_amount).toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'right', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        ₹{Number(item.revised_requested_amount || (approvedCap + Number(item.requested_additional_amount || 0))).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={statusConf.variant} size="sm">
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {statusConf.label}
                        </Badge>
                        {item.enhancement_number && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '3px', fontFamily: 'monospace' }}>
                            {item.enhancement_number}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          {item.status === 'requested' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedItem(item);
                                setDecisionForm({
                                  status: 'approved',
                                  approved_additional_amount: item.requested_additional_amount,
                                  cumulative_approved_amount: (Number(item.current_approved_amount || 0) + Number(item.requested_additional_amount || 0)),
                                  enhancement_number: `ENH-AL-${Date.now().toString().slice(-5)}`,
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
                            icon={History}
                            title="View Enhancement Approval Log"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsHistoryModalOpen(true);
                            }}
                          >
                            History
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

      {/* MODAL 1: NEW ENHANCEMENT REQUEST */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Raise Cashless Enhancement Request to TPA"
        subtitle="Request mid-admission authorized limit increment with medical justification."
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
              label="Current Inpatient Ward / Bed"
              value={newForm.room_no}
              onChange={(e) => setNewForm({ ...newForm, room_no: e.target.value })}
            />
          </div>

          {/* Limits Comparison Strip */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Current Approved Limit</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                  ₹{Number(newForm.current_approved_amount).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Current Running Bill</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-error)', marginTop: '2px' }}>
                  ₹{Number(newForm.current_running_bill).toLocaleString('en-IN')}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Revised Total Request</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                  ₹{revisedTotalRequested.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Additional Amount Requested (₹) *"
              required
              type="number"
              value={newForm.requested_additional_amount}
              onChange={(e) => setNewForm({ ...newForm, requested_additional_amount: e.target.value })}
            />

            <Select
              label="Clinical Justification Category"
              value={newForm.justification_category}
              onChange={(e) => setNewForm({ ...newForm, justification_category: e.target.value })}
              options={[
                { value: 'ICU / CCU Shift & High-End Drugs', label: 'ICU / CCU Shift & High-End Drugs' },
                { value: 'Extended Length of Stay (Complications)', label: 'Extended Length of Stay (Complications)' },
                { value: 'Additional Surgical Procedure', label: 'Additional Surgical Procedure' },
                { value: 'Higher Grade Implants / Mesh / Stents', label: 'Higher Grade Implants / Mesh / Stents' },
                { value: 'Specialized Blood Components / Dialysis', label: 'Specialized Blood Components / Dialysis' }
              ]}
            />
          </div>

          <Input
            label="Brief Reason for Enhancement"
            required
            value={newForm.reason}
            onChange={(e) => setNewForm({ ...newForm, reason: e.target.value })}
            placeholder="e.g. Patient shifted to ICU due to severe postoperative sepsis and inotropic requirement"
          />

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Doctor Clinical Notes & Medical Audit Justification *
            </label>
            <textarea
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontFamily: 'inherit',
                fontSize: '0.84rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
              required
              value={newForm.doctor_notes}
              onChange={(e) => setNewForm({ ...newForm, doctor_notes: e.target.value })}
              placeholder="Clinical reason signed by treating consultant explaining why stay or cost exceeded initial authorization..."
            />
          </div>

          <Input
            label="Supporting Diagnostic Reports Attached"
            value={newForm.supporting_details}
            onChange={(e) => setNewForm({ ...newForm, supporting_details: e.target.value })}
            placeholder="e.g. Serial ABG, CT Scan Abdomen, Blood Culture Reports"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsNewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Send}>
              Submit Enhancement to TPA
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: RECORD DECISION */}
      {selectedItem && (
        <Modal
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          title="Record TPA Enhancement Authorization"
          subtitle={`Logging decision from ${selectedItem.tpa_name} for ${selectedItem.patient_name}.`}
          maxWidth="500px"
        >
          <form onSubmit={handleDecisionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFB', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              <div><strong>Initial Limit:</strong> ₹{Number(selectedItem.current_approved_amount).toLocaleString('en-IN')}</div>
              <div><strong>Requested Additional:</strong> ₹{Number(selectedItem.requested_additional_amount).toLocaleString('en-IN')}</div>
            </div>

            <Select
              label="Enhancement Decision"
              value={decisionForm.status}
              onChange={(e) => setDecisionForm({ ...decisionForm, status: e.target.value })}
              options={[
                { value: 'approved', label: 'Enhancement Approved in Full' },
                { value: 'partially_approved', label: 'Partially Approved (Reduced Amount)' },
                { value: 'rejected', label: 'Enhancement Denied' }
              ]}
            />

            {decisionForm.status !== 'rejected' ? (
              <>
                <Input
                  label="Approved Additional Amount (₹)"
                  required
                  type="number"
                  value={decisionForm.approved_additional_amount}
                  onChange={(e) => setDecisionForm({ ...decisionForm, approved_additional_amount: e.target.value })}
                />
                <Input
                  label="Revised Approval Letter Ref (AL Number)"
                  required
                  value={decisionForm.enhancement_number}
                  onChange={(e) => setDecisionForm({ ...decisionForm, enhancement_number: e.target.value })}
                  placeholder="e.g. ENH-STAR-2026-9901"
                />
              </>
            ) : (
              <Input
                label="Denial / Repudiation Reason"
                required
                value={decisionForm.rejection_reason}
                onChange={(e) => setDecisionForm({ ...decisionForm, rejection_reason: e.target.value })}
                placeholder="e.g. Extended ICU stay not substantiated by medical audit records"
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsDecisionModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Decision
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: MULTI-STAGE ENHANCEMENT HISTORY */}
      {selectedItem && (
        <Modal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          title="Enhancement Audit Trail & Limit History"
          subtitle={`Chronological cashless approval stages for ${selectedItem.patient_name} (${selectedItem.uhid}).`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(selectedItem.history || []).map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'flex-start',
                    padding: '12px',
                    backgroundColor: '#F8FAFB',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: '4px solid var(--color-primary-teal)'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.86rem', minWidth: '120px', color: '#0F172A' }}>
                    {step.stage}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span><strong>Requested:</strong> ₹{Number(step.requested).toLocaleString('en-IN')}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: '700' }}>
                        <strong>Approved:</strong> ₹{Number(step.approved).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                      Ref: <span style={{ fontFamily: 'monospace' }}>{step.ref}</span> • {new Date(step.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
