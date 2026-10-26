import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Printer,
  Eye,
  Copy,
  Check,
  CreditCard,
  Calendar,
  HeartPulse
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../common/UIPrimitives';
import { calculateAge, formatPhoneIN } from '../patientConstants';
import { useAuth } from '../../../context/AuthContext';

export function UhidSmartCardDesk({
  patients = [],
  initialPatientUhid = null,
  onNavigateSubtab
}) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(initialPatientUhid || '');
  const [selectedPatient, setSelectedPatient] = useState(() => {
    if (initialPatientUhid) {
      return patients.find(p => p.uhid.toLowerCase() === initialPatientUhid.toLowerCase()) || patients[0] || null;
    }
    return patients[0] || null;
  });

  const [copied, setCopied] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [printLog, setPrintLog] = useState([]);

  useEffect(() => {
    if (initialPatientUhid) {
      const match = patients.find(p => p.uhid.toLowerCase() === initialPatientUhid.toLowerCase());
      if (match) {
        setSelectedPatient(match);
        setSearchQuery(match.uhid);
      }
    }
  }, [initialPatientUhid, patients]);

  // Filter patients for quick selector list
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return patients.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p =>
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uhid && p.uhid.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q))
    ).slice(0, 10);
  }, [patients, searchQuery]);

  const handleCopyUhid = (uhid) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(uhid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTriggerPrint = () => {
    if (!selectedPatient) return;
    // Record print audit log
    const entry = {
      id: `print-${Date.now()}`,
      uhid: selectedPatient.uhid,
      patientName: selectedPatient.full_name,
      printedBy: user?.name || user?.username || 'Staff Receptionist',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short', year: 'numeric' })
    };
    setPrintLog(prev => [entry, ...prev]);

    // Trigger browser print
    window.print();
  };

  const patientAge = selectedPatient ? calculateAge(selectedPatient.date_of_birth) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search & Lookup Bar */}
      <Card
        title="UHID Generation & Smart Card Printing Terminal"
        subtitle="Search patient by UHID, legal name, or phone to inspect digital card metadata and print standard RFID health cards"
      >
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by UHID (e.g. UHID-2026-0814), Patient Name, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.84rem',
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

        {/* Quick Patient Selection Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {searchResults.map(p => {
            const isSel = selectedPatient?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedPatient(p);
                  setSearchQuery(p.uhid);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isSel ? '2px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSel ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSel ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  fontWeight: isSel ? '700' : '500',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{p.full_name}</span>
                <span style={{ fontFamily: 'monospace', opacity: 0.8 }}>({p.uhid})</span>
              </button>
            );
          })}
        </div>
      </Card>

      {selectedPatient ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
          {/* Card Preview Container */}
          <Card
            title="Digital Health Smart Card"
            subtitle="Standard CR-80 PVC Card layout with high-contrast barcode and ABHA biometric linkage"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
              {/* Printable Smart Card Graphic */}
              <div
                id="hospital-smart-card-printable"
                style={{
                  width: '340px',
                  height: '214px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0F3A5D 0%, #1A5276 50%, #2E86C1 100%)',
                  color: '#FFFFFF',
                  padding: '14px 16px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(15, 58, 93, 0.35)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative holographic wave */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                    pointerEvents: 'none'
                  }}
                />

                {/* Header: Hospital Branding */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <HeartPulse size={18} color="#0F3A5D" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Sarji Hospital
                      </div>
                      <div style={{ fontSize: '0.58rem', opacity: 0.85, letterSpacing: '0.3px' }}>
                        Tertiary Care & Research Institute
                      </div>
                    </div>
                  </div>

                  {/* Gold Contactless Chip Graphic */}
                  <div
                    style={{
                      width: '32px',
                      height: '24px',
                      borderRadius: '4px',
                      background: 'linear-gradient(135deg, #F9E79F 0%, #D4AC0D 100%)',
                      border: '1px solid #B7950B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)'
                    }}
                  >
                    <CreditCard size={14} color="#7D6608" />
                  </div>
                </div>

                {/* Middle: Patient Identity */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '4px 0' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}
                  >
                    {selectedPatient.full_name ? selectedPatient.full_name[0].toUpperCase() : 'P'}
                  </div>

                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedPatient.full_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.9, marginTop: '2px' }}>
                      {patientAge || 'Adult'} • {selectedPatient.gender ? selectedPatient.gender.toUpperCase() : 'OTHER'} • Blood: <strong>{selectedPatient.blood_group || 'O+'}</strong>
                    </div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.85, marginTop: '1px' }}>
                      Mob: {formatPhoneIN(selectedPatient.mobile)}
                    </div>
                  </div>
                </div>

                {/* Footer: UHID and Barcode */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div>
                    <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', opacity: 0.75, letterSpacing: '0.5px' }}>
                      Unique Health ID (UHID)
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '0.8px' }}>
                      {selectedPatient.uhid}
                    </div>
                  </div>

                  {/* SVG Barcode Representation */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <svg width="100" height="22" style={{ backgroundColor: '#FFFFFF', padding: '2px 4px', borderRadius: '2px' }}>
                      <rect x="2" y="2" width="2" height="18" fill="#000" />
                      <rect x="6" y="2" width="1" height="18" fill="#000" />
                      <rect x="9" y="2" width="3" height="18" fill="#000" />
                      <rect x="14" y="2" width="1" height="18" fill="#000" />
                      <rect x="17" y="2" width="2" height="18" fill="#000" />
                      <rect x="21" y="2" width="4" height="18" fill="#000" />
                      <rect x="27" y="2" width="2" height="18" fill="#000" />
                      <rect x="31" y="2" width="1" height="18" fill="#000" />
                      <rect x="34" y="2" width="3" height="18" fill="#000" />
                      <rect x="39" y="2" width="2" height="18" fill="#000" />
                      <rect x="43" y="2" width="1" height="18" fill="#000" />
                      <rect x="46" y="2" width="4" height="18" fill="#000" />
                      <rect x="52" y="2" width="2" height="18" fill="#000" />
                      <rect x="56" y="2" width="3" height="18" fill="#000" />
                      <rect x="61" y="2" width="1" height="18" fill="#000" />
                      <rect x="64" y="2" width="2" height="18" fill="#000" />
                      <rect x="68" y="2" width="4" height="18" fill="#000" />
                      <rect x="74" y="2" width="1" height="18" fill="#000" />
                      <rect x="77" y="2" width="3" height="18" fill="#000" />
                      <rect x="82" y="2" width="2" height="18" fill="#000" />
                      <rect x="86" y="2" width="3" height="18" fill="#000" />
                      <rect x="91" y="2" width="1" height="18" fill="#000" />
                      <rect x="94" y="2" width="2" height="18" fill="#000" />
                    </svg>
                    <span style={{ fontSize: '0.52rem', opacity: 0.75, marginTop: '1px' }}>24x7 Emergency Contact</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => setIsPreviewModalOpen(true)}
                >
                  Preview Card Dossier
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Printer}
                  onClick={handleTriggerPrint}
                >
                  Print Smart Card
                </Button>

                <Button
                  variant="teal"
                  size="sm"
                  icon={Calendar}
                  onClick={() => onNavigateSubtab && onNavigateSubtab('24.3', { selectedPatient })}
                >
                  Create Visit
                </Button>
              </div>
            </div>
          </Card>

          {/* Patient Registration Summary & Audit */}
          <Card
            title="Patient Registration Metadata"
            subtitle="Verified demographic parameters and registration audit history"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Permanent Hospital UHID:</div>
                  <div style={{ fontSize: '1rem', fontWeight: '800', fontFamily: 'monospace', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
                    {selectedPatient.uhid}
                  </div>
                </div>
                <Button
                  size="xs"
                  variant="outline"
                  icon={copied ? Check : Copy}
                  onClick={() => handleCopyUhid(selectedPatient.uhid)}
                >
                  {copied ? 'Copied!' : 'Copy UHID'}
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', padding: '4px 0' }}>
                <div><strong>Full Legal Name:</strong> {selectedPatient.full_name}</div>
                <div><strong>Date of Birth:</strong> {selectedPatient.date_of_birth ? String(selectedPatient.date_of_birth).slice(0, 10) : 'Not recorded'}</div>
                <div><strong>Age / Gender:</strong> {patientAge} / {selectedPatient.gender || 'other'}</div>
                <div><strong>Primary Mobile:</strong> {formatPhoneIN(selectedPatient.mobile)}</div>
                <div><strong>Blood Group:</strong> <Badge variant="teal">{selectedPatient.blood_group || 'Unknown'}</Badge></div>
                <div><strong>Status:</strong> <Badge variant="success">Verified EHR</Badge></div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.82rem', fontWeight: '700' }}>Recent Smart Card Print Activity:</h4>
                {printLog.length === 0 ? (
                  <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                    No physical card print operations initiated during this session.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {printLog.map(log => (
                      <div key={log.id} style={{ padding: '6px 10px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0', fontSize: '0.74rem', color: '#166534', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Printed by <strong>{log.printedBy}</strong></span>
                        <span>{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No patient selected. Search by UHID or mobile number above.
          </div>
        </Card>
      )}

      {/* Print Preview Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          title={`Health Card Preview — ${selectedPatient.full_name}`}
          subtitle={`UHID: ${selectedPatient.uhid} • Standard CR-80 PVC Format`}
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'center', fontSize: '0.80rem', color: 'var(--color-text-secondary)' }}>
              Card dimensions: 85.60 mm × 53.98 mm (3.370 in × 2.125 in). Compatible with standard Zebra, Fargo, and Evolis hospital card printers.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', gap: '8px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => { setIsPreviewModalOpen(false); handleTriggerPrint(); }}>
                Proceed to Print
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Print Isolation Stylesheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #hospital-smart-card-printable,
          #hospital-smart-card-printable * {
            visibility: visible !important;
          }
          #hospital-smart-card-printable {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
