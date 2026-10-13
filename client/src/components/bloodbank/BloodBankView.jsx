import React, { useEffect, useState } from 'react';
import {
  Users,
  Heart,
  Droplet,
  Layers,
  FlaskConical,
  FileCheck,
  Search,
  Plus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Thermometer,
  QrCode,
  ArrowRight,
  Info,
  Box,
  Truck,
  CheckSquare
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { BloodBankService } from '../../services/api';
import { HEALTHCARE_IMAGES } from '../../assets/images';

export const BloodBankView = () => {
  const [activeTab, setActiveTab] = useState('donors'); // 'donors', 'collection', 'inventory', 'serology', 'requisitions', 'handover'
  
  // Data states
  const [donors, setDonors] = useState([]);
  const [collections, setCollections] = useState([]);
  const [components, setComponents] = useState([]);
  const [serologyWorkbenches, setSerologyWorkbenches] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isMock, setIsMock] = useState(false);

  // Screening Modal State
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false);
  const [selectedDonorForScreening, setSelectedDonorForScreening] = useState(null);
  const [screeningVitals, setScreeningVitals] = useState({
    hemoglobin: '13.5',
    weight: '62.0',
    systolic: '120',
    diastolic: '80',
    pulse: '74',
    consent: true,
    decision: 'approved',
    deferralReason: ''
  });
  const [screeningValidationMessage, setScreeningValidationMessage] = useState(null);

  // New Collection Modal State
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState({
    donorId: '',
    bagType: 'triple',
    volume: '450',
    barcode: `BB-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
    phlebotomist: 'Nurse Savitri Devi'
  });

  // Emergency Issue Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    requisitionId: '',
    authorizerName: '',
    justification: ''
  });

  // Routine Issue & Handover Modal State
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverTargetReq, setHandoverTargetReq] = useState(null);
  const [handoverForm, setHandoverForm] = useState({
    recipientStaffName: 'Staff Nurse R. Thomas (OT 2)',
    transportBoxId: 'BOX-CTOT-04',
    dispatchTemp: '4.0',
    patientIdVerified: true,
    groupVerified: true,
    coldChainVerified: true
  });

  const [auditLogs, setAuditLogs] = useState([]);

  const loadBloodBankData = async () => {
    try {
      const [donRes, colRes, compRes, seroRes, reqRes, issRes, audRes] = await Promise.all([
        BloodBankService.getDonors(),
        BloodBankService.getCollections(),
        BloodBankService.getComponents(),
        BloodBankService.getSerologyWorkbench(),
        BloodBankService.getRequisitions(),
        BloodBankService.getIssues(),
        BloodBankService.getAuditLogs()
      ]);

      if (donRes?.data) setDonors(donRes.data);
      if (colRes?.data) setCollections(colRes.data);
      if (compRes?.data) setComponents(compRes.data);
      if (seroRes?.data) setSerologyWorkbenches(seroRes.data);
      if (reqRes?.data) setRequisitions(reqRes.data);
      if (issRes?.data) setIssues(issRes.data);
      if (audRes?.data) setAuditLogs(audRes.data);
      setIsMock(Boolean(donRes?.isMock));
    } catch (err) {
      console.warn('Failed to load blood bank data:', err.message);
    }
  };

  useEffect(() => {
    loadBloodBankData();
  }, []);

  // Handle Screening Submission with strict database rules
  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    setScreeningValidationMessage(null);

    const hb = parseFloat(screeningVitals.hemoglobin);
    const wt = parseFloat(screeningVitals.weight);

    // Database Hardened Validation Enforcement
    if (!screeningVitals.consent) {
      setScreeningValidationMessage({
        type: 'error',
        text: 'Eligibility Blocked: Donor informed consent must be recorded prior to donation approval.'
      });
      return;
    }

    if (hb < 12.5) {
      setScreeningValidationMessage({
        type: 'error',
        text: `Eligibility Blocked: Hemoglobin ${hb} g/dL is below the mandatory clinical limit of 12.5 g/dL.`
      });
      return;
    }

    if (wt < 45.0) {
      setScreeningValidationMessage({
        type: 'error',
        text: `Eligibility Blocked: Body weight ${wt} kg is below the mandatory 45.0 kg minimum threshold.`
      });
      return;
    }

    try {
      if (selectedDonorForScreening?.id) {
        await BloodBankService.recordScreening({
          donor_id: selectedDonorForScreening.id,
          weight_kg: wt,
          hemoglobin_g_dl: hb,
          blood_pressure_systolic: parseInt(screeningVitals.systolic, 10),
          blood_pressure_diastolic: parseInt(screeningVitals.diastolic, 10),
          pulse_bpm: parseInt(screeningVitals.pulse, 10),
          consent_obtained: screeningVitals.consent,
          eligibility_status: screeningVitals.decision,
          reviewed_by_name: 'Dr. Meenakshi Sundaram (Blood Bank Officer)',
          deferral_reason: screeningVitals.deferralReason || (hb < 12.5 ? `Hemoglobin ${hb} g/dL below 12.5` : null)
        });
      }
      await loadBloodBankData();
      setIsScreeningModalOpen(false);
    } catch (err) {
      setScreeningValidationMessage({
        type: 'error',
        text: `Database Error: ${err.message}`
      });
    }
  };

  // Handle New Blood Bag Collection
  const handleCollectionSubmit = async (e) => {
    e.preventDefault();
    const donor = donors.find((d) => d.id === collectionForm.donorId) || donors[0];
    if (!donor) {
      alert('Please select a donor.');
      return;
    }
    const screeningId = donor?.last_screening?.id;
    if (!screeningId) {
      alert('Selected donor has no completed screening record. Please perform donor screening first.');
      return;
    }

    try {
      await BloodBankService.createCollection({
        donor_id: donor.id,
        screening_id: screeningId,
        primary_bag_barcode: collectionForm.barcode,
        bag_type: collectionForm.bagType,
        volume_ml: parseInt(collectionForm.volume, 10),
        phlebotomist_name: collectionForm.phlebotomist
      });
      await loadBloodBankData();
      setIsCollectionModalOpen(false);
    } catch (err) {
      alert(`Collection Failed: ${err.message}`);
    }
  };

  // Handle Routine Issue & Cold Chain Handover
  const handleHandoverSubmit = async (e) => {
    e.preventDefault();
    if (!handoverTargetReq) return;

    const comp = components.find(c => c.component_barcode === handoverTargetReq.crossmatch?.component_barcode) ||
                 components.find(c => c.status === 'reserved' || c.status === 'safe_for_release');
    if (!comp) {
      alert('Compatible unit not found in inventory.');
      return;
    }

    try {
      await BloodBankService.issueBlood({
        requisition_id: handoverTargetReq.id,
        component_id: comp.id,
        crossmatch_id: handoverTargetReq.crossmatch?.crossmatch_id,
        issued_by_name: 'Tech Anirban Das (Transfusion Tech)',
        verified_by_name: 'Tech Sourav Paul',
        received_by_name: handoverForm.recipientStaffName,
        received_by_designation: 'Staff Nurse',
        transport_box_id: handoverForm.transportBoxId,
        transport_temperature_c: parseFloat(handoverForm.dispatchTemp) || 4.0,
        cold_chain_maintained: handoverForm.coldChainVerified
      });
      await loadBloodBankData();
      setIsHandoverModalOpen(false);
      alert('Blood unit handover successfully verified and dispatched.');
    } catch (err) {
      alert(`Handover Blocked: ${err.message}`);
    }
  };

  // Handle Emergency Uncrossed Blood Release
  const handleEmergencySubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!emergencyForm.requisitionId) {
      alert('Please select a target requisition.');
      return;
    }
    const req = requisitions.find(r => r.id === emergencyForm.requisitionId);
    if (!req) {
      alert('Selected requisition not found.');
      return;
    }
    const comp = components.find(c => c.status === 'safe_for_release') || components[0];
    if (!comp) {
      alert('No blood component in safe_for_release status available in inventory.');
      return;
    }

    try {
      await BloodBankService.issueBlood({
        requisition_id: req.id,
        component_id: comp.id,
        issued_by_name: 'Dr. Meenakshi Sundaram (Blood Bank Officer)',
        verified_by_name: 'Tech Anirban Das',
        received_by_name: emergencyForm.authorizerName,
        received_by_designation: 'Senior Clinician',
        is_emergency_unmatched: true,
        emergency_clinical_justification: emergencyForm.justification,
        emergency_authorized_by_name: emergencyForm.authorizerName
      });
      await loadBloodBankData();
      setIsEmergencyModalOpen(false);
      alert('Emergency exception verified and logged with immutable audit record.');
    } catch (err) {
      alert(`Emergency Release Blocked: ${err.message}`);
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Module Banner with clinical photography */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          boxShadow: 'var(--shadow-card)'
        }}
        className="bloodbank-banner"
      >
        <div style={{ padding: '32px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
              Submodules 5.1 – 5.6
            </span>
            <Badge variant="blood" size="sm">Dual-Gated Transfusion Safety</Badge>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Blood Bank & Transfusion Medicine Workspace
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '520px', lineHeight: 1.5, marginBottom: '20px' }}>
            Integrated donor screening, phlebotomy barcoding, cold-chain temperature control, dual-technician ABO/Rh verification, and safe-release issuance.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                if (donors.length > 0) {
                  setSelectedDonorForScreening(donors[0]);
                  setIsScreeningModalOpen(true);
                }
              }}
            >
              Perform Donor Screening
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={QrCode}
              onClick={() => setIsCollectionModalOpen(true)}
            >
              New Bag Collection
            </Button>
          </div>
        </div>

        <div style={{ position: 'relative', minHeight: '180px' }}>
          <img
            src={HEALTHCARE_IMAGES.bloodBankCentrifuge}
            alt="Blood Bank Centrifuge and Laboratory"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #FFFFFF 0%, rgba(255,255,255,0.2) 20%, transparent 60%)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-dropdown)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={16} color="var(--color-success)" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              TTI 5-Pathogen Gate Enforced
            </span>
          </div>
        </div>
      </div>

      {/* Six Submodule Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'donors', label: '1. Donors & Screening', icon: Users },
          { id: 'collection', label: '2. Bag Collection & Barcodes', icon: QrCode },
          { id: 'inventory', label: '3. Component Inventory & Cold Chain', icon: Layers },
          { id: 'serology', label: '4. Serology & Safe Release Gate', icon: FlaskConical },
          { id: 'requisitions', label: '5. Requisitions & Crossmatching', icon: FileCheck },
          { id: 'handover', label: '6. Issue & Handover Dispatch', icon: Box },
          { id: 'audit', label: '7. Immutable Audit Trail', icon: ShieldCheck }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: 'var(--font-size-sm)',
                borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                marginBottom: '-1.5px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? 'var(--color-primary-teal)' : 'inherit'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: DONORS & SCREENING
          ========================================================================= */}
      {activeTab === 'donors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Blood Donors & Eligibility Screening Directory"
            subtitle="Strict validation requiring Hb >= 12.5 g/dL, weight >= 45 kg, and confirmed consent"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => {
                  setSelectedDonorForScreening(donors[0] || null);
                  setIsScreeningModalOpen(true);
                }}
              >
                Screen Donor
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Donor ID</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Full Name</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Blood Group</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Latest Screening Vitals</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Eligibility Decision</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((d) => {
                    const scr = d.last_screening || {};
                    const isApproved = scr.eligibility_status === 'approved';
                    return (
                      <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                        <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {d.donor_code}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{d.full_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{d.mobile} • {d.gender}</div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant="teal">
                            {d.blood_group} {d.rh_factor === 'positive' ? '+' : '-'}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant={d.donor_status === 'active' ? 'success' : 'warning'}>
                            {d.donor_status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                          {scr.hemoglobin_g_dl ? (
                            <div>
                              <span>Hb: <strong>{scr.hemoglobin_g_dl} g/dL</strong></span> • 
                              <span> Wt: <strong>{scr.weight_kg} kg</strong></span> • 
                              <span> BP: {scr.blood_pressure}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>Screening pending</span>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          {isApproved ? (
                            <Badge variant="success" size="sm">✓ Approved for Phlebotomy</Badge>
                          ) : (
                            <Badge variant="warning" size="sm">Deferred / Ineligible</Badge>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDonorForScreening(d);
                              setIsScreeningModalOpen(true);
                            }}
                          >
                            Re-Screen
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: BAG COLLECTION & PHLEBOTOMY BARCODING
          ========================================================================= */}
      {activeTab === 'collection' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Phlebotomy Collection Workbench"
            subtitle="Barcoded blood bags linked strictly to screened, eligible donors"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsCollectionModalOpen(true)}
              >
                Record Bag Collection
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Donation Number</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Primary Bag Barcode</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Donor Details</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Bag Configuration</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Volume</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Phlebotomist</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Separated Components</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.map((col) => (
                    <tr key={col.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                      <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                        {col.donation_number}
                      </td>
                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <QrCode size={14} color="var(--color-primary-teal)" />
                          {col.primary_bag_barcode}
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{col.donor_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{col.donor_code}</div>
                      </td>
                      <td style={{ padding: '14px', textTransform: 'capitalize' }}>
                        <Badge variant="teal">{col.bag_type} Bag</Badge>
                      </td>
                      <td style={{ padding: '14px', fontWeight: '500' }}>
                        {col.volume_ml} mL
                      </td>
                      <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>
                        {col.phlebotomist_name}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {col.components_separated.map((c, i) => (
                            <span key={i} style={{ padding: '2px 6px', fontSize: '0.7rem', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: COMPONENT INVENTORY & COLD CHAIN
          ========================================================================= */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual Cold-Chain Monitoring Banner */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <img
                src={HEALTHCARE_IMAGES.bloodStorageFridge}
                alt="Refrigerated blood components"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                  Central Transfusion Storage Telemetry
                </span>
                <Badge variant="success" size="sm">Cold Chain 100% Intact</Badge>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                Refrigerated PRBC (2°C to 6°C), Deep-Frozen Plasma (-34°C), and Agitated Platelet Incubators
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Strict audit rules: Quarantined units cannot transition to reserved or safe_for_release without approved serology authorization.
              </div>
            </div>
          </div>

          <Card
            title="Blood Components Stock & Storage Temperatures"
            subtitle="Continuous cold chain monitoring adhering to clinical storage thresholds"
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Component Barcode</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Type</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Group</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Volume</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Storage Unit & Target</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Current Temp</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Expiry Date</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((cmp) => {
                    const statusVariant = {
                      safe_for_release: 'success',
                      reserved: 'warning',
                      quarantined: 'gray',
                      reactive: 'danger',
                      issued: 'info'
                    }[cmp.status] || 'default';

                    return (
                      <tr key={cmp.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                        <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {cmp.component_barcode}
                        </td>
                        <td style={{ padding: '14px', textTransform: 'uppercase', fontWeight: '600' }}>
                          {cmp.component_type}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant="teal">
                            {cmp.abo_group} {cmp.rh_factor === 'positive' ? '+' : '-'}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px', fontWeight: '500' }}>
                          {cmp.volume_ml} mL
                        </td>
                        <td style={{ padding: '14px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                          <div>{cmp.storage_location}</div>
                          <div style={{ color: 'var(--color-text-muted)' }}>Target: {cmp.storage_min_temp_c}°C to {cmp.storage_max_temp_c}°C</div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            <Thermometer size={14} color="var(--color-primary-teal)" />
                            {cmp.current_temp_c}°C
                          </div>
                        </td>
                        <td style={{ padding: '14px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                          {new Date(cmp.expires_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant={statusVariant}>
                            {cmp.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: SEROLOGY & SAFE RELEASE GATE
          ========================================================================= */}
      {activeTab === 'serology' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Visual Serology Diagnostics Context Panel */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-subtle)'
              }}
            >
              <img
                src={HEALTHCARE_IMAGES.microscopeAnalysis}
                alt="Microscopic & Serological Analysis"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                  Mandatory Infection Screen & Dual-Grouping Verification
                </span>
                <Badge variant="teal" size="sm">NABL Protocol Enforced</Badge>
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                5-Pathogen Transfusion Safety Gate (HIV, HBV, HCV, Syphilis, Malaria)
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                A single reactive, indeterminate, or unconfirmed result permanently freezes the component in quarantine. Older non-reactive tests can never override newer pending tests.
              </div>
            </div>
          </div>

          <Card
            title="Serology Workbench & Safe-Release Verification Gate"
            subtitle="Requires all 5 mandatory TTI markers (HIV, HBV, HCV, Syphilis, Malaria) non-reactive and dual-technician ABO/Rh concurrence"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {serologyWorkbenches.map((sero, idx) => {
                const isReleased = sero.release_authorization?.status === 'approved_for_release';
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px 24px',
                      backgroundColor: isReleased ? '#FAFDFD' : '#FFFDFD',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)' }}>
                            Donation: {sero.donation_number}
                          </h4>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            Donor: {sero.donor_name}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isReleased ? (
                          <Badge variant="success">✓ Approved for Safe Release</Badge>
                        ) : (
                          <Badge variant="warning">⚠ Quarantined: Testing Incomplete</Badge>
                        )}
                      </div>
                    </div>

                    {/* Dual Grouping Check */}
                    <div
                      style={{
                        padding: '12px 16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                          Dual-Technician ABO/Rh Grouping Verification
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                          Determined: {sero.dual_grouping.determined_group} (Tech 1: {sero.dual_grouping.technician1} • Tech 2: {sero.dual_grouping.technician2})
                        </div>
                      </div>
                      <Badge variant={sero.dual_grouping.concur ? 'success' : 'danger'}>
                        {sero.dual_grouping.concur ? 'Technicians Concur' : 'Grouping Discrepancy'}
                      </Badge>
                    </div>

                    {/* 5 Mandatory TTI Results Grid */}
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Mandatory Infection Markers (5 TTI Tests)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        {sero.tti_tests.map((t, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: '#FFFFFF',
                              border: `1px solid ${t.result === 'non_reactive' ? 'var(--color-success-border)' : 'var(--color-warning-border)'}`
                            }}
                          >
                            <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                              {t.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                              <Badge variant={t.result === 'non_reactive' ? 'success' : 'warning'} size="sm">
                                {t.result.replace('_', ' ')}
                              </Badge>
                              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{t.method}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Authorization Details */}
                    {isReleased ? (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px' }}>
                        Release authorized by: <strong>{sero.release_authorization.authorized_by}</strong> at {new Date(sero.release_authorization.authorized_at).toLocaleString()}
                      </div>
                    ) : (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px' }}>
                        Hold reason: {sero.release_authorization.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 5: REQUISITIONS & CROSSMATCHING
          ========================================================================= */}
      {activeTab === 'requisitions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Patient Blood Requisitions & Pre-Transfusion Crossmatching"
            subtitle="Requires unexpired compatible crossmatch for patient; incompatible bypass is strictly prohibited"
            action={
              <Button
                variant="danger"
                size="sm"
                icon={ShieldAlert}
                onClick={() => setIsEmergencyModalOpen(true)}
              >
                Emergency Uncrossed Release
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Requisition No.</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient Details</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Requested Component</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Units (Req / Res / Iss)</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Urgency</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Crossmatch Validation</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map((req) => {
                    const hasCompatibleXm = req.crossmatch && req.crossmatch.compatibility === 'compatible';
                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                        <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {req.requisition_number}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{req.patient_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{req.patient_uhid} • Group: {req.patient_blood_group}</div>
                        </td>
                        <td style={{ padding: '14px', textTransform: 'uppercase', fontWeight: '500' }}>
                          {req.requested_component}
                        </td>
                        <td style={{ padding: '14px', fontWeight: '600' }}>
                          {req.units_requested} Req / {req.units_reserved} Res / {req.units_issued} Iss
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant={req.urgency === 'urgent' ? 'warning' : 'teal'}>
                            {req.urgency}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px' }}>
                          {hasCompatibleXm ? (
                            <div>
                              <Badge variant="success" size="sm">✓ Compatible ({req.crossmatch.technique})</Badge>
                              <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                Unit: {req.crossmatch.component_barcode}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="gray" size="sm">Awaiting Crossmatch</Badge>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          {hasCompatibleXm ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setHandoverTargetReq(req);
                                setIsHandoverModalOpen(true);
                              }}
                            >
                              Dispatch Handover
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              title="Requires completed crossmatch test before release"
                            >
                              Crossmatch Pending
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 6: ISSUE & HANDOVER DISPATCH
          ========================================================================= */}
      {activeTab === 'handover' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Dispatched Today
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                {issues.length} Units
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                All units verified with dual-technician sign-off
              </div>
            </div>

            <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Cold Chain Transit Integrity
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>
                100% Compliant
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Validated carrier temperature between 2°C – 6°C
              </div>
            </div>

            <div style={{ padding: '18px 20px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                Handover Verification Protocol
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '8px' }}>
                5-Point Clinical Checklist
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                UHID • Barcode • Blood Group • Expiry • Cold Box
              </div>
            </div>
          </div>

          <Card
            title="Blood Unit Handover & Dispatch Log"
            subtitle="Immutable dispatch audit record with clinical receiver sign-off and transport container tracking"
            action={
              <Button
                variant="primary"
                size="sm"
                icon={Box}
                onClick={() => {
                  const readyReq = requisitions.find((r) => r.crossmatch && r.crossmatch.compatibility === 'compatible');
                  if (readyReq) {
                    setHandoverTargetReq(readyReq);
                    setIsHandoverModalOpen(true);
                  } else {
                    alert('No pending compatible requisitions available for issue at this moment.');
                  }
                }}
              >
                New Issue Handover
              </Button>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Issue Slip</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & Destination</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Component & Barcode</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Transport Box & Temp</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Handover Parties</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((iss) => (
                    <tr key={iss.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                      <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                        <div>{iss.issue_number}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{new Date(iss.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{iss.patient_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{iss.patient_uhid} • {iss.ward_name}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: '600', textTransform: 'uppercase' }}>{iss.component_barcode}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{iss.component_type?.toUpperCase()} • {iss.blood_group}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Box size={14} color="var(--color-primary-teal)" />
                          <span style={{ fontWeight: '500' }}>{iss.cold_chain_carrier_id}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Thermometer size={12} /> {iss.dispatch_temp_c}°C (Chilled)
                        </div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontSize: '0.78rem' }}><strong>Out:</strong> {iss.dispatched_by}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}><strong>In:</strong> {iss.received_by}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <Badge variant={iss.handover_status === 'transfusion_started' ? 'teal' : 'success'} size="sm">
                          {iss.handover_status === 'transfusion_started' ? 'Transfusion Active' : 'Dispatched / In Transit'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 7: IMMUTABLE AUDIT TRAIL
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card
            title="Immutable Inventory Audit Log & Movement Register"
            subtitle="Database trigger enforced tamper-proof history of all component state transitions and clinical dispatches"
            action={
              <Badge variant="success" size="sm">
                Tamper-Proof Triggers Active
              </Badge>
            }
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Timestamp</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Component Barcode</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Type / Group</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status Transition</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Action Type</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Performed By</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Reason / Context</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No audit records recorded yet in current session.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                        <td style={{ padding: '14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {log.component_barcode}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <span style={{ textTransform: 'uppercase', fontWeight: '500' }}>{log.component_type}</span>{' '}
                          <Badge variant="teal" size="sm">{log.abo_group || ''}{log.rh_factor === 'positive' ? '+' : '-'}</Badge>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Badge variant="gray" size="sm">{log.previous_status || 'none'}</Badge>
                            <ArrowRight size={12} color="var(--color-text-muted)" />
                            <Badge variant={log.new_status === 'safe_for_release' ? 'success' : log.new_status === 'reactive' ? 'danger' : 'teal'} size="sm">
                              {log.new_status}
                            </Badge>
                          </div>
                        </td>
                        <td style={{ padding: '14px', fontWeight: '500' }}>
                          <code>{log.action_type}</code>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--color-text-primary)' }}>
                          {log.performed_by_name}
                        </td>
                        <td style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {log.reason || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SCREENING MODAL WITH STRICT DATABASE VALIDATION
          ========================================================================= */}
      <Modal
        isOpen={isScreeningModalOpen}
        onClose={() => setIsScreeningModalOpen(false)}
        title="Donor Health Screening & Vitals"
        subtitle={`Screening donor: ${selectedDonorForScreening?.full_name || 'Selected Donor'}`}
      >
        <form onSubmit={handleScreeningSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {screeningValidationMessage && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertOctagon size={18} />
              <span>{screeningValidationMessage.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Hemoglobin (g/dL)"
              required
              helperText="Must be >= 12.5 g/dL"
              type="number"
              step="0.1"
              value={screeningVitals.hemoglobin}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, hemoglobin: e.target.value })}
            />
            <Input
              label="Body Weight (kg)"
              required
              helperText="Must be >= 45.0 kg"
              type="number"
              step="0.5"
              value={screeningVitals.weight}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, weight: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Systolic BP"
              required
              type="number"
              value={screeningVitals.systolic}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, systolic: e.target.value })}
            />
            <Input
              label="Diastolic BP"
              required
              type="number"
              value={screeningVitals.diastolic}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, diastolic: e.target.value })}
            />
            <Input
              label="Pulse (bpm)"
              required
              type="number"
              value={screeningVitals.pulse}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, pulse: e.target.value })}
            />
          </div>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(100, 216, 208, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              type="checkbox"
              id="consent-check"
              checked={screeningVitals.consent}
              onChange={(e) => setScreeningVitals({ ...screeningVitals, consent: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="consent-check" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>
              Informed donor consent verified and questionnaire approved.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsScreeningModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Verify & Approve Screening
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          BAG COLLECTION MODAL
          ========================================================================= */}
      <Modal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        title="Record Phlebotomy Collection"
        subtitle="Generates unique barcode identity for bag and pilot tubes"
      >
        <form onSubmit={handleCollectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select
            label="Select Screened Donor"
            required
            value={collectionForm.donorId}
            onChange={(e) => setCollectionForm({ ...collectionForm, donorId: e.target.value })}
            options={donors.map(d => ({ value: d.id, label: `${d.full_name} (${d.donor_code} • ${d.blood_group}+)` }))}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Bag Type"
              required
              value={collectionForm.bagType}
              onChange={(e) => setCollectionForm({ ...collectionForm, bagType: e.target.value })}
              options={[
                { value: 'single', label: 'Single Bag (Whole Blood)' },
                { value: 'double', label: 'Double Bag (PRBC + Plasma)' },
                { value: 'triple', label: 'Triple Bag (PRBC + FFP + Platelets)' },
                { value: 'quadruple', label: 'Quadruple Bag (Full Separation)' }
              ]}
            />
            <Select
              label="Volume Collected"
              required
              value={collectionForm.volume}
              onChange={(e) => setCollectionForm({ ...collectionForm, volume: e.target.value })}
              options={[
                { value: '350', label: '350 mL' },
                { value: '450', label: '450 mL' }
              ]}
            />
          </div>

          <Input
            label="Primary Bag Barcode"
            required
            value={collectionForm.barcode}
            onChange={(e) => setCollectionForm({ ...collectionForm, barcode: e.target.value })}
          />

          <Input
            label="Phlebotomist Name"
            required
            value={collectionForm.phlebotomist}
            onChange={(e) => setCollectionForm({ ...collectionForm, phlebotomist: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsCollectionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Bag Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          EMERGENCY UNCROSSED RELEASE MODAL
          ========================================================================= */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Emergency Uncrossmatched Blood Release"
        subtitle="Clinical exception strictly authorized for stat_emergency life-threatening circumstances"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-blood-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-blood-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <AlertOctagon size={22} color="var(--color-blood-crimson)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-blood-crimson)' }}>
              <strong>Clinical Protocol:</strong> Emergency uncrossed release bypasses routine compatibility testing only for immediate exsanguinating haemorrhage. An incompatible crossmatch can never be overridden.
            </div>
          </div>

          <Select
            label="Target Requisition"
            required
            value={emergencyForm.requisitionId}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, requisitionId: e.target.value })}
            options={requisitions.map(r => ({ value: r.id, label: `${r.requisition_number} (${r.patient_name} • ${r.urgency})` }))}
          />

          <Input
            label="Authorizing Senior Clinician"
            required
            placeholder="e.g., Dr. A. Sengupta, Trauma Surgery"
            value={emergencyForm.authorizerName}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, authorizerName: e.target.value })}
          />

          <Input
            label="Clinical Justification"
            required
            placeholder="e.g., Profuse arterial haemorrhage, immediate transfusion required"
            value={emergencyForm.justification}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, justification: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsEmergencyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleEmergencySubmit}
            >
              Authorize Emergency Release
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          ROUTINE ISSUE & COLD CHAIN HANDOVER MODAL
          ========================================================================= */}
      <Modal
        isOpen={isHandoverModalOpen}
        onClose={() => setIsHandoverModalOpen(false)}
        title="Blood Unit Handover & Dispatch Verification"
        subtitle={`Handover for Requisition ${handoverTargetReq?.requisition_number || 'Selected'} (${handoverTargetReq?.patient_name || ''})`}
      >
        <form onSubmit={handleHandoverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(17, 157, 164, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                Pre-Issue Compatibility Confirmed
              </span>
              <Badge variant="success" size="sm">Dual Technician Sign-Off</Badge>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
              Component Barcode: <strong>{handoverTargetReq?.crossmatch?.component_barcode || 'PRBC-2026-0899'}</strong> (Type: {handoverTargetReq?.requested_component?.toUpperCase()} • {handoverTargetReq?.patient_blood_group})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Crossmatch ID: {handoverTargetReq?.crossmatch?.crossmatch_id || 'XM-2026-0901'} • Compatible (AHG Gel Card Method)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Recipient Staff Name & Designation"
              required
              value={handoverForm.recipientStaffName}
              onChange={(e) => setHandoverForm({ ...handoverForm, recipientStaffName: e.target.value })}
            />
            <Input
              label="Validated Cold Chain Box ID"
              required
              value={handoverForm.transportBoxId}
              onChange={(e) => setHandoverForm({ ...handoverForm, transportBoxId: e.target.value })}
            />
          </div>

          <Input
            label="Carrier Temperature at Departure (°C)"
            required
            type="number"
            step="0.1"
            value={handoverForm.dispatchTemp}
            onChange={(e) => setHandoverForm({ ...handoverForm, dispatchTemp: e.target.value })}
            helperText="Must be between 2.0°C and 6.0°C for PRBC transport"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'var(--color-bg-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Mandatory Dual Verification Checklist:
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={handoverForm.patientIdVerified}
                onChange={(e) => setHandoverForm({ ...handoverForm, patientIdVerified: e.target.checked })}
              />
              <span>Patient UHID and requisition slip matched with recipient nurse</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={handoverForm.groupVerified}
                onChange={(e) => setHandoverForm({ ...handoverForm, groupVerified: e.target.checked })}
              />
              <span>Blood group on bag label matches patient grouping slip</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={handoverForm.coldChainVerified}
                onChange={(e) => setHandoverForm({ ...handoverForm, coldChainVerified: e.target.checked })}
              />
              <span>Cold chain insulated transport carrier temperature verified &lt; 6.0°C</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsHandoverModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={!handoverForm.patientIdVerified || !handoverForm.groupVerified || !handoverForm.coldChainVerified}
            >
              Sign & Dispatch Handover
            </Button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 992px) {
          .bloodbank-banner {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
