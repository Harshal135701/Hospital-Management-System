import React, { useState, useMemo } from 'react';
import {
  Search,
  Printer,
  Percent,
  Eye
} from 'lucide-react';
import { Card, Button, Badge, Modal,Input  } from '../common/UIPrimitives';
import { formatINR, formatDateIN } from '../../utils/formatters';
import { DOCTOR_PAYOUT_STATUSES } from './financeConstants';

export function DoctorPayoutDesk({
  doctors,
  onDisbursePayout,
  onCalculatePayout
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [selectedDoctorForCases, setSelectedDoctorForCases] = useState(null);
  const [selectedDoctorForSlip, setSelectedDoctorForSlip] = useState(null);

  // Calculations for KPI Cards
  const stats = useMemo(() => {
    let totalBillings = 0;
    let totalHospitalRetained = 0;
    let totalDoctorGross = 0;
    let totalTdsDeducted = 0;
    let totalNetPayout = 0;
    let disbursedCount = 0;

    doctors.forEach(doc => {
      totalBillings += doc.totalBillings;
      totalHospitalRetained += doc.hospitalRetained;
      totalDoctorGross += doc.doctorGrossShare;
      totalTdsDeducted += doc.tdsAmount;
      totalNetPayout += doc.netPayout;
      if (doc.status === 'disbursed') disbursedCount++;
    });

    return {
      totalBillings,
      totalHospitalRetained,
      totalDoctorGross,
      totalTdsDeducted,
      totalNetPayout,
      disbursedCount
    };
  }, [doctors]);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [doctors, searchQuery, selectedStatus]);

  // Handle Disburse Action
  const handleDisburseClick = (doc) => {
    onDisbursePayout(doc.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Financial KPI Cards for Doctor Revenue Share */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Gross Clinical Billings */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Gross Doctor Billings
            </span>
            <Badge variant="teal">Total Pool</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(stats.totalBillings)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Patient OPD tokens, surgical packages & diagnostics
          </span>
        </div>

        {/* Hospital Share Retained */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-success)', textTransform: 'uppercase' }}>
              Hospital Retained Share
            </span>
            <Badge variant="success">HMS Margin</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-success)' }}>
            {formatINR(stats.totalHospitalRetained)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Hospital facility, OT equipment & nursing retention
          </span>
        </div>

        {/* Doctor Gross Share */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase' }}>
              Consultant Gross Share
            </span>
            <span style={{ backgroundColor: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: '700' }}>
              Pre-Tax
            </span>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(stats.totalDoctorGross)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Contracted professional fees (50% - 70%)
          </span>
        </div>

        {/* TDS Deductions (Sec 194J) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#D97706', textTransform: 'uppercase' }}>
              Statutory TDS (10%)
            </span>
            <Badge variant="warning">Sec 194J</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
            {formatINR(stats.totalTdsDeducted)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Withholding tax remitted to Indian Income Tax Dept
          </span>
        </div>

        {/* Net Payout Disbursed / Due */}
        <div
          style={{
            backgroundColor: 'var(--color-bg-pale-aqua)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '1.5px solid rgba(8, 127, 140, 0.3)',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Net Payable Pool
            </span>
            <Badge variant="teal">{stats.disbursedCount} / {doctors.length} Settled</Badge>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
            {formatINR(stats.totalNetPayout)}
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
            Net bank remittance into doctor checking accounts
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header & Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            {/* Search */}
            <div style={{ flex: '1 1 240px', maxWidth: '340px' }}>
              <Input
                placeholder="Search consultant doctor, department..."
                icon={Search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter by Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="all">All Payout Statuses</option>
                <option value="disbursed">Disbursed / Paid</option>
                <option value="calculated">Calculated / Approved</option>
                <option value="pending">Pending Calculation</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={Percent}
                onClick={onCalculatePayout}
              >
                Recalculate All Payouts
              </Button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Doctor & Department</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Case Load</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Split Ratio</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Total Billings</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Doctor Gross</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>TDS (10%)</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'right' }}>Net Remittance</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No consultant doctors found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc) => {
                    const statusObj = DOCTOR_PAYOUT_STATUSES[doc.status] || DOCTOR_PAYOUT_STATUSES.pending;

                    return (
                      <tr
                        key={doc.id}
                        style={{
                          borderBottom: '1px solid var(--color-border-subtle)',
                          transition: 'background-color 0.1s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                            {doc.designation} • {doc.department}
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                          <div><strong>{doc.casesCount.opd}</strong> OPD Visits</div>
                          <div><strong>{doc.casesCount.procedures}</strong> OT/Procedures</div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                            {doc.opdShareRate}% OPD / {doc.procedureShareRate}% OT
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {formatINR(doc.totalBillings)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {formatINR(doc.doctorGrossShare)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--color-error)', fontWeight: '600' }}>
                          - {formatINR(doc.tdsAmount)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                          {formatINR(doc.netPayout)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <Badge variant={statusObj.variant} size="sm">
                            {statusObj.label}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              title="View Patient Breakdown"
                              onClick={() => setSelectedDoctorForCases(doc)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: '#FFFFFF',
                                color: 'var(--color-primary-teal)',
                                border: '1px solid var(--color-border)',
                                fontSize: '0.74rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Eye size={12} />
                              <span>Cases</span>
                            </button>

                            {doc.status !== 'disbursed' ? (
                              <button
                                type="button"
                                title="Process Bank Disbursement"
                                onClick={() => handleDisburseClick(doc)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-primary-teal)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontSize: '0.74rem',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                Disburse
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Print Doctor Remittance Slip"
                                onClick={() => setSelectedDoctorForSlip(doc)}
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--color-bg-pale-aqua)',
                                  color: 'var(--color-primary-teal)',
                                  border: '1px solid rgba(8, 127, 140, 0.3)',
                                  fontSize: '0.74rem',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Printer size={12} />
                                <span>Payslip</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modal 1: Doctor Case Breakdown Drawer */}
      <Modal
        isOpen={Boolean(selectedDoctorForCases)}
        onClose={() => setSelectedDoctorForCases(null)}
        title={selectedDoctorForCases ? `Clinical Case Billings: ${selectedDoctorForCases.name}` : 'Case Breakdown'}
        subtitle={selectedDoctorForCases?.department}
        maxWidth="720px"
      >
        {selectedDoctorForCases && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.2)'
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Total Billings</div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                  {formatINR(selectedDoctorForCases.totalBillings)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Hospital Margin</div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--color-success)' }}>
                  {formatINR(selectedDoctorForCases.hospitalRetained)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>TDS Sec 194J</div>
                <div style={{ fontSize: '0.96rem', fontWeight: '800', color: 'var(--color-error)' }}>
                  {formatINR(selectedDoctorForCases.tdsAmount)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Net Payout</div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  {formatINR(selectedDoctorForCases.netPayout)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Itemized Clinical Procedures & Consultation Logs:
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border-subtle)', backgroundColor: 'var(--color-bg-card-subtle)' }}>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                    <th style={{ padding: '8px 12px' }}>Patient & UHID</th>
                    <th style={{ padding: '8px 12px' }}>Service / Procedure</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Billed Amount</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Share %</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Doctor Share</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDoctorForCases.cases.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{formatDateIN(c.date)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: '600' }}>{c.patient}</div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{c.uhid}</div>
                      </td>
                      <td style={{ padding: '8px 12px' }}>{c.service}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '600' }}>{formatINR(c.billAmount)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--color-primary-teal)', fontWeight: '700' }}>{c.sharePct}%</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                        {formatINR(c.doctorAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedDoctorForCases(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal 2: Doctor Remittance Advice / Payslip */}
      <Modal
        isOpen={Boolean(selectedDoctorForSlip)}
        onClose={() => setSelectedDoctorForSlip(null)}
        title="Doctor Professional Remittance Advice"
        subtitle="Consultant Revenue Share Remittance Statement & TDS Certificate"
        maxWidth="660px"
      >
        {selectedDoctorForSlip && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                border: '2px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                backgroundColor: '#FFFFFF'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '12px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                    MEDICSPRIME MULTI-SPECIALTY HOSPITAL
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>
                    Doctor Professional Remittance Advice • Period: October 2026
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant="success">DISBURSED / PAID</Badge>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Ref: {selectedDoctorForSlip.voucherRef || 'PV-2026-0842'}
                  </div>
                </div>
              </div>

              {/* Consultant Details */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.84rem', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Consultant Name: </span>
                  <strong>{selectedDoctorForSlip.name}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Department: </span>
                  <strong>{selectedDoctorForSlip.department}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Income Tax PAN: </span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedDoctorForSlip.panNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Bank Account: </span>
                  <strong style={{ fontSize: '0.78rem' }}>{selectedDoctorForSlip.bankAccount}</strong>
                </div>
              </div>

              {/* Remittance Calculation Box */}
              <div
                style={{
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid rgba(8, 127, 140, 0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px dashed var(--color-border)' }}>
                  <span>Total Patient Revenue Billed:</span>
                  <strong>{formatINR(selectedDoctorForSlip.totalBillings)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border)' }}>
                  <span>Less: Hospital Infrastructure & Nursing Retained (Avg 35%):</span>
                  <strong>- {formatINR(selectedDoctorForSlip.hospitalRetained)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border)', fontWeight: '700' }}>
                  <span>Gross Consultant Revenue Share:</span>
                  <span>{formatINR(selectedDoctorForSlip.doctorGrossShare)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--color-border)', color: 'var(--color-error)' }}>
                  <span>Less: Statutory TDS under Section 194J (10%):</span>
                  <strong>- {formatINR(selectedDoctorForSlip.tdsAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontSize: '1.2rem', color: 'var(--color-primary-teal)', fontWeight: '800' }}>
                  <span>Net Disbursed to Bank A/c:</span>
                  <span>{formatINR(selectedDoctorForSlip.netPayout)}</span>
                </div>
              </div>

              {/* Footer text */}
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginBottom: '20px' }}>
                * Tax Deducted at Source (TDS) has been credited under Section 194J of the Indian Income Tax Act. Form 16A TDS certificate will be dispatched electronically at the end of the financial quarter.
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                <div>
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Chief Financial Officer (CFO)
                  </div>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #CBD5E1', paddingTop: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Consultant Doctor Acknowledgment
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="outline" onClick={() => setSelectedDoctorForSlip(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={Printer}
                onClick={() => {
                  window.print();
                }}
              >
                Print Remittance Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
