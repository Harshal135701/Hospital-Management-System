import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Printer,
  Share2,
  Lock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Eye,
  ArrowRight,
  Download,
  Building2,
  QrCode
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { REPORT_STATUS_CONFIG } from './radiologyConstants';

export function ReportVerificationDesk({
  studies = [],
  currentUser = null,
  onVerifyReport,
  onDistributeReport
}) {
  const [selectedStudyId, setSelectedStudyId] = useState(() => {
    // Pick first study that has a report
    const withReport = studies.find(s => s.report_findings || s.report_status);
    return withReport?.id || studies[0]?.id || '';
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Check role authorization: Only clinician_doctor or super_admin
  const isAuthorizedToSign = useMemo(() => {
    const role = currentUser?.role || 'clinician_doctor'; // Default in dev if not logged in
    return role === 'clinician_doctor' || role === 'super_admin';
  }, [currentUser]);

  const activeStudy = useMemo(() => {
    return studies.find(s => s.id === selectedStudyId) || studies[0] || null;
  }, [studies, selectedStudyId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleVerify = async () => {
    if (!isAuthorizedToSign) {
      alert('Authorization Denied: Only licensed Radiologist Doctors or Super Administrators may sign off on diagnostic reports.');
      return;
    }
    if (!activeStudy?.report_id) {
      alert('No report found for this study. Please author a report first in Submodule 27.4.');
      return;
    }
    setIsVerifying(true);
    try {
      if (onVerifyReport) {
        await onVerifyReport(activeStudy.report_id);
      }
      showToast(`Diagnostic Report for ${activeStudy.accession_number} verified and digitally authorized.`);
    } catch (err) {
      alert('Error verifying report: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDistribute = async () => {
    if (!activeStudy?.report_id) return;
    setIsDistributing(true);
    try {
      if (onDistributeReport) {
        await onDistributeReport(activeStudy.report_id);
      }
      showToast(`Report distributed to Patient EMR timeline & Ordering Clinician (${activeStudy.ordering_doctor_name || 'Clinician'}).`);
    } catch (err) {
      alert('Error distributing report: ' + err.message);
    } finally {
      setIsDistributing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Toast Notification */}
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
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role-Based Authorization Badge Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: isAuthorizedToSign ? 'var(--color-bg-pale-aqua)' : '#fffbeb',
          border: `1px solid ${isAuthorizedToSign ? 'var(--color-primary-teal)' : '#fde68a'}`,
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuthorizedToSign ? (
            <ShieldCheck size={18} color="var(--color-primary-teal)" />
          ) : (
            <Lock size={18} color="#d97706" />
          )}
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: isAuthorizedToSign ? 'var(--color-primary-teal)' : '#b45309' }}>
            {isAuthorizedToSign
              ? `Verification Clearance Granted: ${currentUser?.name || 'Dr. Authorized Radiologist'} (${currentUser?.role || 'clinician_doctor'})`
              : 'Restricted Access: Clinician Doctor or Super Admin role is required to verify and authorize reports.'}
          </span>
        </div>

        <Badge variant={isAuthorizedToSign ? 'teal' : 'amber'} size="sm">
          {isAuthorizedToSign ? 'DIGITAL SIGNATURE READY' : 'READ-ONLY PREVIEW'}
        </Badge>
      </div>

      {/* Main Review Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', alignItems: 'start' }}>
        {/* Left: Study Verification Worklist */}
        <Card style={{ padding: '14px' }}>
          <div style={{ fontWeight: '700', fontSize: '0.86rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Studies Awaiting Authorization
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '560px', overflowY: 'auto' }}>
            {studies.map(study => {
              const isSelected = study.id === activeStudy?.id;
              const repStatus = study.report_status || (study.report_findings ? 'draft' : 'none');
              const statusCfg = repStatus !== 'none' ? REPORT_STATUS_CONFIG[repStatus] : { label: 'Pending Authoring', variant: 'secondary' };

              return (
                <div
                  key={study.id}
                  onClick={() => setSelectedStudyId(study.id)}
                  style={{
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-bg-subtle)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                  className="hover-tab"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                      {study.accession_number}
                    </span>
                    <Badge variant={statusCfg.variant} size="sm">
                      {statusCfg.label}
                    </Badge>
                  </div>

                  <div style={{ fontWeight: '600', fontSize: '0.80rem', color: 'var(--color-text-primary)', marginTop: '4px' }}>
                    {study.patient_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                    [{study.modality_id}] {study.study_description}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    UHID: {study.patient_uhid} • Date: {new Date(study.scheduled_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Detailed Structured Report Review */}
        <Card style={{ padding: '20px' }}>
          {activeStudy ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Header Title with Status & Print Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--color-border)',
                  paddingBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                    {activeStudy.study_description}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Accession: <strong>{activeStudy.accession_number}</strong> | Modality: <strong>{activeStudy.modality_id}</strong> | Room: <strong>{activeStudy.modality_room || 'Main Suite'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Printer}
                    onClick={() => setIsPrintModalOpen(true)}
                  >
                    Print Preview
                  </Button>
                </div>
              </div>

              {/* Patient Meta Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '10px',
                  backgroundColor: 'var(--color-bg-subtle)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Patient Name: </span>
                  <span style={{ fontWeight: '700' }}>{activeStudy.patient_name}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>UHID: </span>
                  <span style={{ fontWeight: '600' }}>{activeStudy.patient_uhid}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Age/Sex: </span>
                  <span style={{ fontWeight: '600' }}>{activeStudy.patient_gender || 'Adult'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)' }}>Ordering Clinician: </span>
                  <span style={{ fontWeight: '600' }}>{activeStudy.ordering_doctor_name || 'Dr. House'}</span>
                </div>
              </div>

              {/* Clinical Indication */}
              {activeStudy.clinical_indication && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                    Clinical Indication
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                    {activeStudy.clinical_indication}
                  </div>
                </div>
              )}

              {/* Technique */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Imaging Technique
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', marginTop: '2px', lineHeight: 1.45 }}>
                  {activeStudy.report_technique || 'Standard volumetric multiplanar protocol.'}
                </div>
              </div>

              {/* Systematic Findings */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Systematic Findings
                </div>
                <div
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--color-text-primary)',
                    marginTop: '4px',
                    lineHeight: 1.55,
                    backgroundColor: '#FFFFFF',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {activeStudy.report_findings || 'No structured findings authored yet. Please draft report in Submodule 27.4.'}
                </div>
              </div>

              {/* Impression */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                  Diagnostic Impression
                </div>
                <div
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    color: 'var(--color-text-primary)',
                    marginTop: '4px',
                    lineHeight: 1.5,
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--color-primary-teal)'
                  }}
                >
                  {activeStudy.report_impression || 'Impression pending radiologist formulation.'}
                </div>
              </div>

              {/* Critical Alert Warning if active */}
              {activeStudy.report_critical_alert && (
                <div
                  style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #f87171',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <AlertTriangle size={20} color="#b91c1c" />
                  <div style={{ fontSize: '0.78rem', color: '#7f1d1d' }}>
                    <strong>CRITICAL PANIC FINDING RECORDED:</strong> This report has been flagged for direct physician-to-physician critical telephone escalation.
                  </div>
                </div>
              )}

              {/* Verification & Signature Block */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  {activeStudy.report_status === 'verified' || activeStudy.report_status === 'distributed' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <div style={{ fontSize: '0.78rem', color: '#065f46' }}>
                        <div><strong>Electronically Signed & Authorized by:</strong> {activeStudy.radiologist_name || 'Dr. Authorized Radiologist'}</div>
                        <div style={{ fontSize: '0.70rem', color: '#047857' }}>
                          Verified At: {activeStudy.report_verified_at ? new Date(activeStudy.report_verified_at).toLocaleString() : 'Recent'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      Status: <strong>Awaiting Formal Signature Authorization</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Verification Button */}
                  {activeStudy.report_status !== 'verified' && activeStudy.report_status !== 'distributed' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CheckCircle2}
                      loading={isVerifying}
                      disabled={!isAuthorizedToSign || !activeStudy.report_findings}
                      onClick={handleVerify}
                      title={!isAuthorizedToSign ? 'Restricted to Clinician Doctor / Radiologist role' : 'Authorize and apply electronic signature'}
                    >
                      Sign & Authorize Report
                    </Button>
                  )}

                  {/* Distribution Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Share2}
                    loading={isDistributing}
                    disabled={activeStudy.report_status !== 'verified' && activeStudy.report_status !== 'distributed'}
                    onClick={handleDistribute}
                    title="Publish report to patient timeline and ordering clinician EMR"
                  >
                    Distribute to EMR
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Select a study from the worklist to review diagnostic report.
            </div>
          )}
        </Card>
      </div>

      {/* Official Diagnostic Report Print Modal */}
      {isPrintModalOpen && activeStudy && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Official Diagnostic Radiology Report"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFFFF', padding: '12px' }}>
            {/* Hospital Official Header */}
            <div style={{ borderBottom: '2px solid var(--color-primary-teal)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                  SARJI SUPER SPECIALITY HOSPITAL
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                  Department of Diagnostic Radiology & Imaging • NABH & NABL Accredited
                </div>
                <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                  Helpline: +91 80 4567 8900 • PACS DICOM AE: HMS_RADIOLOGY_SCU
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.72rem' }}>
                <Badge variant="teal" size="sm">OFFICIAL REPORT</Badge>
                <div style={{ marginTop: '4px', fontFamily: 'monospace' }}>Acc: {activeStudy.accession_number}</div>
              </div>
            </div>

            {/* Patient Credentials Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.75rem', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '4px' }}>
              <div><strong>Patient:</strong> {activeStudy.patient_name} ({activeStudy.patient_gender})</div>
              <div><strong>UHID:</strong> {activeStudy.patient_uhid}</div>
              <div><strong>Ref Doctor:</strong> {activeStudy.ordering_doctor_name || 'Dr. House'}</div>
              <div><strong>Study Date:</strong> {new Date(activeStudy.scheduled_at).toLocaleDateString()}</div>
              <div><strong>Modality:</strong> {activeStudy.modality_id} - {activeStudy.study_description}</div>
              <div><strong>Body Region:</strong> {activeStudy.body_part || 'General'}</div>
            </div>

            {/* Findings */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '2px' }}>
                Systematic Observations
              </div>
              <div style={{ fontSize: '0.80rem', color: '#1e293b', marginTop: '6px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {activeStudy.report_findings || 'Normal study without acute pathology.'}
              </div>
            </div>

            {/* Impression */}
            <div style={{ backgroundColor: '#f0fdf4', padding: '10px 12px', borderRadius: '4px', borderLeft: '4px solid #16a34a' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: '700', textTransform: 'uppercase', color: '#15803d' }}>
                Impression
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#14532d', marginTop: '3px' }}>
                {activeStudy.report_impression || 'No acute abnormalities identified.'}
              </div>
            </div>

            {/* Digital Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '10px' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                This is a digitally certified radiology report in compliance with HL7/DICOM and Indian EHR Standards.
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                  {activeStudy.radiologist_name || 'Dr. Authorized Radiologist'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                  MD (Radiodiagnosis) • Consultant Radiologist
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrintModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Official Slip
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
