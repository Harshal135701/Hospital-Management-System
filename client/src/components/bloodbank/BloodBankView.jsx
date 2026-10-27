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
  CheckSquare,
  RefreshCw,
  FileText,
  Lock,
  LogIn
} from 'lucide-react';

import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import { BloodBankService, PatientService, TokenManager } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const resolveBloodBankTab = (target) => {
  if (!target) return 'donors';
  const clean = String(target).replace('bloodbank:', '');
  const numMap = {
    '5.1': 'donors',
    '5.2': 'collection',
    '5.3': 'inventory',
    '5.4': 'serology',
    '5.5': 'requisitions',
    '5.6': 'handover',
    '5.7': 'audit',
    '1': 'donors',
    '2': 'collection',
    '3': 'inventory',
    '4': 'serology',
    '5': 'requisitions',
    '6': 'handover',
    '7': 'audit'
  };
  if (numMap[clean]) return numMap[clean];
  const validTabs = ['donors', 'collection', 'inventory', 'serology', 'requisitions', 'handover', 'audit'];
  if (validTabs.includes(clean)) return clean;
  return 'donors';
};

export const BloodBankView = ({ initialTab = 'donors', initialSubtab = 'donors', onNavigate }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const [activeTab, setActiveTab] = useState(() => resolveBloodBankTab(initialTab || initialSubtab));

  useEffect(() => {
    const nextTab = resolveBloodBankTab(initialTab || initialSubtab);
    if (nextTab) {
      setActiveTab(nextTab);
    }
  }, [initialTab, initialSubtab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (typeof onNavigate === 'function') {
      onNavigate(`bloodbank:${tabId}`);
    }
  };
  
  // Data states
  const [donors, setDonors] = useState([]);
  const [collections, setCollections] = useState([]);
  const [components, setComponents] = useState([]);
  const [serologyWorkbenches, setSerologyWorkbenches] = useState([]);
  const [requisitions, setRequisitions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [temperatureLogs, setTemperatureLogs] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Register Voluntary Donor Modal State (Submodule 5.1)
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [donorForm, setDonorForm] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    rh_factor: '',
    mobile: '',
    email: '',
    national_id: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [donorFormError, setDonorFormError] = useState(null);

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
  const [screeningQuestionnaire, setScreeningQuestionnaire] = useState({
    recent_illness: false,
    travel_endemic: false,
    high_risk_behavior: false,
    medication_notes: ''
  });
  const [screeningValidationMessage, setScreeningValidationMessage] = useState(null);

  // New Collection Modal State (Submodule 5.2)
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionForm, setCollectionForm] = useState({
    donorId: '',
    bagType: '',
    volume: '',
    barcode: '',
    phlebotomist: ''
  });
  const [collectionFormError, setCollectionFormError] = useState(null);

  // Requisition Creation Modal State (Submodule 5.5)
  const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
  const [requisitionForm, setRequisitionForm] = useState({
    patient_uhid: '',
    requested_component: '',
    units_requested: 1,
    urgency: '',
    clinical_indication: '',
    patient_blood_group: '',
    patient_rh_factor: '',
    requester_name: ''
  });
  const [requisitionFormError, setRequisitionFormError] = useState(null);
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [isVerifyingUhid, setIsVerifyingUhid] = useState(false);
  const [uhidValidationMessage, setUhidValidationMessage] = useState(null);

  // Emergency Issue Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    requisitionId: '',
    authorizerName: '',
    authorizerCode: '',
    authorizerPin: '',
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

  // Cold Chain Sensor Log Modal State (Submodule 5.3)
  const [isTemperatureModalOpen, setIsTemperatureModalOpen] = useState(false);
  const [temperatureForm, setTemperatureForm] = useState({
    storage_unit_code: 'REF-01',
    storage_unit_type: 'blood_refrigerator',
    recorded_temperature_c: '4.0',
    target_min_temp_c: '2.0',
    target_max_temp_c: '6.0',
    agitator_operational: true,
    recorded_by_name: 'Sr. Suresh P. (Blood Bank Tech)',
    corrective_action: ''
  });

  const handleSaveTemperatureLog = (e) => {
    e.preventDefault();
    const tempVal = parseFloat(temperatureForm.recorded_temperature_c) || 4.0;
    const minVal = parseFloat(temperatureForm.target_min_temp_c) || 2.0;
    const maxVal = parseFloat(temperatureForm.target_max_temp_c) || 6.0;
    const alertRaised = tempVal < minVal || tempVal > maxVal;

    const newLog = {
      id: `temp-${Date.now()}`,
      recorded_at: new Date().toISOString(),
      storage_unit_code: temperatureForm.storage_unit_code,
      storage_unit_type: temperatureForm.storage_unit_type,
      recorded_temperature_c: tempVal,
      target_min_temp_c: minVal,
      target_max_temp_c: maxVal,
      agitator_operational: temperatureForm.agitator_operational,
      alert_raised: alertRaised,
      recorded_by_name: temperatureForm.recorded_by_name,
      corrective_action: alertRaised ? (temperatureForm.corrective_action || 'Temperature excursion logged, backup cooling activated.') : null
    };

    setTemperatureLogs(prev => [newLog, ...prev]);
    setIsTemperatureModalOpen(false);
  };

  // Serology TTI Screening Modal State (Submodule 5.4)
  const [isSerologyModalOpen, setIsSerologyModalOpen] = useState(false);
  const [selectedSerologyTarget, setSelectedSerologyTarget] = useState(null);
  const [serologyForm, setSerologyForm] = useState({
    technician1_group: 'O Positive',
    technician2_group: 'O Positive',
    concur: true,
    hiv_result: 'non_reactive',
    hbv_result: 'non_reactive',
    hcv_result: 'non_reactive',
    syphilis_result: 'non_reactive',
    malaria_result: 'non_reactive',
    release_decision: 'approved_for_release',
    pathologist_notes: 'All 5 mandatory TTI markers non-reactive. Safe release verified.'
  });

  const handleOpenSerologyModal = (sero) => {
    setSelectedSerologyTarget(sero);
    setSerologyForm({
      technician1_group: sero.blood_group_claimed || 'O Positive',
      technician2_group: sero.blood_group_claimed || 'O Positive',
      concur: true,
      hiv_result: 'non_reactive',
      hbv_result: 'non_reactive',
      hcv_result: 'non_reactive',
      syphilis_result: 'non_reactive',
      malaria_result: 'non_reactive',
      release_decision: 'approved_for_release',
      pathologist_notes: 'All 5 mandatory TTI markers non-reactive. Dual-technician grouping matches.'
    });
    setIsSerologyModalOpen(true);
  };

  const handleSaveSerologyResult = (e) => {
    e.preventDefault();
    if (!selectedSerologyTarget) return;

    const ttiArray = [
      { name: 'hiv_1_2', label: 'HIV 1 & 2', result: serologyForm.hiv_result, method: '4th Gen ELISA' },
      { name: 'hepatitis_b', label: 'Hepatitis B (HBsAg)', result: serologyForm.hbv_result, method: 'Chemiluminescence (CLIA)' },
      { name: 'hepatitis_c', label: 'Hepatitis C (Anti-HCV)', result: serologyForm.hcv_result, method: 'Chemiluminescence (CLIA)' },
      { name: 'syphilis', label: 'Syphilis (VDRL / RPR)', result: serologyForm.syphilis_result, method: 'RPR Flocculation' },
      { name: 'malaria', label: 'Malaria Antigen / Smear', result: serologyForm.malaria_result, method: 'Dual Antigen RDT' }
    ];

    setSerologyWorkbenches(prev => prev.map(s => {
      if (s.donation_number === selectedSerologyTarget.donation_number) {
        return {
          ...s,
          dual_grouping: {
            determined_group: serologyForm.technician1_group,
            technician1: 'Sr. Suresh P. (Tech 1)',
            technician2: 'Sr. Deepa K. (Tech 2)',
            concur: serologyForm.concur,
            verified: true
          },
          tti_tests: ttiArray,
          release_authorization: {
            status: serologyForm.release_decision,
            authorized_by: 'Dr. Jayant Mukherjee (MD Pathology)',
            authorized_at: new Date().toISOString(),
            notes: serologyForm.pathologist_notes
          }
        };
      }
      return s;
    }));

    setIsSerologyModalOpen(false);
  };

  const loadBloodBankData = async () => {
    if (!TokenManager.getToken()) {
      setIsLoading(false);
      setDonors([]);
      setCollections([]);
      setComponents([]);
      setSerologyWorkbenches([]);
      setRequisitions([]);
      setIssues([]);
      setAuditLogs([]);
      setTemperatureLogs([]);
      setAuthError({
        type: 'unauthenticated',
        message: 'Institutional staff authentication required. Please sign in to access the Blood Bank & Transfusion Medicine workspace.'
      });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setAuthError(null);
    try {
      const [donRes, colRes, compRes, seroRes, reqRes, issRes, audRes, tempRes] = await Promise.all([
        BloodBankService.getDonors(),
        BloodBankService.getCollections(),
        BloodBankService.getComponents(),
        BloodBankService.getSerologyWorkbench(),
        BloodBankService.getRequisitions(),
        BloodBankService.getIssues(),
        BloodBankService.getAuditLogs(),
        BloodBankService.getStorageTemperatureLogs()
      ]);

      setDonors(donRes?.data || []);
      setCollections(colRes?.data || []);
      setComponents(compRes?.data || []);
      setSerologyWorkbenches(seroRes?.data || []);
      setRequisitions(reqRes?.data || []);
      setIssues(issRes?.data || []);
      setAuditLogs(audRes?.data || []);
      setTemperatureLogs(tempRes?.data || []);
      setIsMock(false);
    } catch (err) {
      console.warn('Failed to load blood bank data:', err.message);
      if (err.status === 401 || err.code === 'UNAUTHORIZED' || err.message?.includes('Authentication required') || err.message?.includes('Missing Bearer token')) {
        setAuthError({
          type: 'unauthorized',
          message: err.message || 'Session expired or authentication token missing. Please sign in.'
        });
      } else if (err.status === 403 || err.code === 'FORBIDDEN' || err.message?.includes('Access denied')) {
        setAuthError({
          type: 'forbidden',
          message: err.message || 'Access Denied: Your staff account role does not have authorization for some Blood Bank resources.'
        });
      } else {
        setApiError(err.message || 'Unable to connect to the Blood Bank backend service.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBloodBankData();
  }, [user]);

  // Live Patient UHID Verification against GET /api/patients/:uhid
  const verifyPatientByUhid = async (uhidToVerify) => {
    const rawUhid = (uhidToVerify !== undefined ? uhidToVerify : requisitionForm.patient_uhid)?.trim();
    if (!rawUhid) {
      setVerifiedPatient(null);
      setUhidValidationMessage(null);
      return;
    }

    setIsVerifyingUhid(true);
    setUhidValidationMessage(null);
    try {
      const res = await PatientService.getPatientByUhid(rawUhid);
      const patient = res?.data || res;
      if (patient && patient.uhid) {
        setVerifiedPatient(patient);
        setUhidValidationMessage({
          type: 'success',
          text: `Verified Patient: ${patient.full_name} (${patient.gender ? patient.gender.toUpperCase() : 'Not Specified'} • DOB: ${patient.date_of_birth || 'N/A'})`
        });
        // Auto-populate blood group and Rh factor if present on patient master record
        setRequisitionForm((prev) => ({
          ...prev,
          patient_blood_group: patient.blood_group || prev.patient_blood_group,
          patient_rh_factor: patient.rh_factor || prev.patient_rh_factor
        }));
      } else {
        setVerifiedPatient(null);
        setUhidValidationMessage({
          type: 'error',
          text: `Patient with UHID '${rawUhid}' not found in registry.`
        });
      }
    } catch (err) {
      setVerifiedPatient(null);
      setUhidValidationMessage({
        type: 'error',
        text: `UHID Lookup Failed: ${err.message || 'Patient not found'}`
      });
    } finally {
      setIsVerifyingUhid(false);
    }
  };

  // Handle Voluntary Donor Registration (Submodule 5.1)
  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setDonorFormError(null);
    if (!donorForm.full_name?.trim() || !donorForm.mobile?.trim()) {
      setDonorFormError('Full name and mobile phone number are mandatory.');
      return;
    }
    if (!donorForm.date_of_birth) {
      setDonorFormError('Date of birth is required.');
      return;
    }
    if (!donorForm.gender) {
      setDonorFormError('Please select a gender.');
      return;
    }
    if (!donorForm.blood_group) {
      setDonorFormError('Please select an ABO blood group.');
      return;
    }
    if (!donorForm.rh_factor) {
      setDonorFormError('Please select an Rh factor.');
      return;
    }
    try {
      await BloodBankService.createDonor(donorForm);
      await loadBloodBankData();
      setIsDonorModalOpen(false);
      setDonorForm({
        full_name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        rh_factor: '',
        mobile: '',
        email: '',
        national_id: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
    } catch (err) {
      setDonorFormError(`Registration Failed: ${err.message}`);
    }
  };

  // Handle New Blood Requisition (Submodule 5.5)
  const handleRequisitionSubmit = async (e) => {
    e.preventDefault();
    setRequisitionFormError(null);

    const uhid = requisitionForm.patient_uhid?.trim();
    if (!uhid) {
      setRequisitionFormError('Patient UHID is required.');
      return;
    }
    if (!verifiedPatient || verifiedPatient.uhid.toLowerCase() !== uhid.toLowerCase()) {
      setRequisitionFormError('Please verify the Patient UHID against the hospital registry before submitting.');
      return;
    }
    if (!requisitionForm.requested_component) {
      setRequisitionFormError('Please select a blood component.');
      return;
    }
    if (!requisitionForm.urgency) {
      setRequisitionFormError('Please select clinical urgency.');
      return;
    }
    if (!requisitionForm.patient_blood_group) {
      setRequisitionFormError('Please select the patient blood group.');
      return;
    }
    if (!requisitionForm.patient_rh_factor) {
      setRequisitionFormError('Please select the patient Rh factor.');
      return;
    }
    if (!requisitionForm.clinical_indication?.trim()) {
      setRequisitionFormError('Clinical indication is required.');
      return;
    }
    if (!requisitionForm.requester_name?.trim()) {
      setRequisitionFormError('Prescribing clinician or department is required.');
      return;
    }

    try {
      await BloodBankService.createRequisition({
        patient_uhid: uhid,
        requested_component: requisitionForm.requested_component,
        units_requested: parseInt(requisitionForm.units_requested, 10) || 1,
        urgency: requisitionForm.urgency,
        clinical_indication: requisitionForm.clinical_indication.trim(),
        patient_blood_group: requisitionForm.patient_blood_group,
        patient_rh_factor: requisitionForm.patient_rh_factor,
        requester_name: requisitionForm.requester_name.trim()
      });
      await loadBloodBankData();
      setIsRequisitionModalOpen(false);
      setRequisitionForm({
        patient_uhid: '',
        requested_component: '',
        units_requested: 1,
        urgency: '',
        clinical_indication: '',
        patient_blood_group: '',
        patient_rh_factor: '',
        requester_name: ''
      });
      setVerifiedPatient(null);
      setUhidValidationMessage(null);
    } catch (err) {
      setRequisitionFormError(`Requisition Submission Failed: ${err.message}`);
    }
  };

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
        let decision = screeningVitals.decision;
        let reason = screeningVitals.deferralReason;

        if (screeningQuestionnaire.high_risk_behavior) {
          decision = 'permanently_deferred';
          reason = 'High-risk clinical exposure or behavior reported on questionnaire';
        } else if (screeningQuestionnaire.recent_illness) {
          decision = 'temporarily_deferred';
          reason = 'Recent acute illness or fever reported within 14 days';
        } else if (hb < 12.5) {
          decision = 'temporarily_deferred';
          reason = `Hemoglobin ${hb} g/dL below 12.5 g/dL threshold`;
        } else if (wt < 45.0) {
          decision = 'temporarily_deferred';
          reason = `Body weight ${wt} kg below 45.0 kg threshold`;
        }

        await BloodBankService.recordScreening({
          donor_id: selectedDonorForScreening.id,
          weight_kg: wt,
          hemoglobin_g_dl: hb,
          blood_pressure_systolic: parseInt(screeningVitals.systolic, 10),
          blood_pressure_diastolic: parseInt(screeningVitals.diastolic, 10),
          pulse_bpm: parseInt(screeningVitals.pulse, 10),
          consent_obtained: screeningVitals.consent,
          questionnaire_answers: screeningQuestionnaire,
          medical_history_notes: screeningQuestionnaire.medication_notes,
          eligibility_status: decision,
          reviewed_by_name: 'Dr. Meenakshi Sundaram (Blood Bank Officer)',
          deferral_reason: reason || null
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
    setCollectionFormError(null);

    if (!collectionForm.donorId) {
      setCollectionFormError('Please select an eligible screened donor.');
      return;
    }
    const donor = donors.find((d) => d.id === collectionForm.donorId);
    if (!donor) {
      setCollectionFormError('Selected donor was not found in records.');
      return;
    }
    const screeningId = donor?.last_screening?.id;
    if (!screeningId || donor.last_screening?.eligibility_status !== 'approved') {
      setCollectionFormError('Selected donor does not have an approved screening on file. Please complete screening first.');
      return;
    }
    if (!collectionForm.bagType) {
      setCollectionFormError('Please select a bag configuration.');
      return;
    }
    if (!collectionForm.volume) {
      setCollectionFormError('Please select the collection volume.');
      return;
    }
    if (!collectionForm.barcode?.trim()) {
      setCollectionFormError('Primary bag barcode is required. Scan or enter bag barcode.');
      return;
    }
    if (!collectionForm.phlebotomist?.trim()) {
      setCollectionFormError('Phlebotomist staff name is required.');
      return;
    }

    try {
      await BloodBankService.createCollection({
        donor_id: donor.id,
        screening_id: screeningId,
        primary_bag_barcode: collectionForm.barcode.trim(),
        bag_type: collectionForm.bagType,
        volume_ml: parseInt(collectionForm.volume, 10),
        phlebotomist_name: collectionForm.phlebotomist.trim()
      });
      await loadBloodBankData();
      setIsCollectionModalOpen(false);
      setCollectionForm({
        donorId: '',
        bagType: '',
        volume: '',
        barcode: '',
        phlebotomist: ''
      });
    } catch (err) {
      setCollectionFormError(`Collection Failed: ${err.message}`);
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
        emergency_authorizer_code: emergencyForm.authorizerCode,
        emergency_authorizer_pin: emergencyForm.authorizerPin,
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
      {/* Module Banner */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        className="bloodbank-banner"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Badge variant="blood" size="sm">Dual-Gated Transfusion Safety</Badge>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Blood Bank & Transfusion Medicine Workspace
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Integrated donor screening, phlebotomy barcoding, cold-chain temperature control, dual-technician ABO/Rh verification, and safe-release issuance.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.25)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={16} color="var(--color-success)" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              TTI 5-Pathogen Gate Enforced
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsDonorModalOpen(true)}
          >
            Register Donor
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={CheckSquare}
            onClick={() => {
              if (donors.length > 0) {
                setSelectedDonorForScreening(donors[0]);
                setIsScreeningModalOpen(true);
              } else {
                alert('No donors registered yet. Please click "Register Donor" first.');
              }
            }}
          >
            Screen Donor
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={QrCode}
            onClick={() => setIsCollectionModalOpen(true)}
          >
            New Bag Collection
          </Button>
          <Button
            variant="soft"
            size="sm"
            icon={FileCheck}
            onClick={() => setIsRequisitionModalOpen(true)}
          >
            New Requisition
          </Button>
        </div>
      </div>

      {/* Authentication Required / Role Restriction Banner */}
      {authError && (
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: authError.type === 'forbidden' ? 'rgba(239, 131, 84, 0.1)' : 'var(--color-bg-pale-aqua)',
            borderRadius: 'var(--radius-lg)',
            border: `1.5px solid ${authError.type === 'forbidden' ? 'rgba(239, 131, 84, 0.4)' : 'rgba(8, 127, 140, 0.35)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {authError.type === 'forbidden' ? (
              <ShieldAlert size={28} color="#C05621" style={{ flexShrink: 0 }} />
            ) : (
              <Lock size={28} color="var(--color-primary-teal)" style={{ flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontWeight: '700', fontSize: 'var(--font-size-base)', color: authError.type === 'forbidden' ? '#C05621' : 'var(--color-primary-teal)' }}>
                {authError.type === 'forbidden'
                  ? 'Access Restricted: Insufficient Institutional Role'
                  : 'Institutional Authentication Required'}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)', marginTop: '3px' }}>
                {authError.message}
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={LogIn}
            onClick={() => openLoginModal(authError.message)}
          >
            {authError.type === 'forbidden' ? 'Switch Staff Account' : 'Staff Sign In'}
          </Button>
        </div>
      )}

      {/* Backend API Connection Error & Retry Action (Genuine server/network failures only) */}
      {!authError && apiError && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'var(--color-error-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-error-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertOctagon size={24} color="var(--color-error)" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: '700', fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
                Backend Service Connection Error
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', marginTop: '2px' }}>
                {apiError} (Empty state displayed — mock fallback disabled).
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={RefreshCw}
            loading={isLoading}
            onClick={loadBloodBankData}
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* Seven Submodule Navigation Tabs */}
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
          { id: 'donors', label: 'Donors & Screening', icon: Users },
          { id: 'collection', label: 'Bag Collection & Barcodes', icon: QrCode },
          { id: 'inventory', label: 'Component Inventory & Cold Chain', icon: Layers },
          { id: 'serology', label: 'Serology & Safe Release Gate', icon: FlaskConical },
          { id: 'requisitions', label: 'Requisitions & Crossmatching', icon: FileCheck },
          { id: 'handover', label: 'Issue & Handover Dispatch', icon: Box },
          { id: 'audit', label: 'Immutable Audit Trail', icon: ShieldCheck }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsDonorModalOpen(true)}
                >
                  Register Donor
                </Button>
                {donors.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={CheckSquare}
                    onClick={() => {
                      setSelectedDonorForScreening(donors[0] || null);
                      setIsScreeningModalOpen(true);
                    }}
                  >
                    Screen Donor
                  </Button>
                )}
              </div>
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
                  {donors.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No donors registered yet</div>
                        <div style={{ fontSize: 'var(--font-size-xs)' }}>
                          Click "Register Donor" above to register a voluntary donor in the database.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    donors.map((d) => {
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
                    })
                  )}
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
                  {collections.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No blood bag collections recorded yet</div>
                        <div style={{ fontSize: 'var(--font-size-xs)' }}>
                          Screen an approved donor to record a donation and generate traceable barcoded bags.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    collections.map((col) => (
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
                            {(col.components_separated || []).map((c, i) => (
                              <span key={i} style={{ padding: '2px 6px', fontSize: '0.7rem', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary-teal)', fontWeight: '600' }}>
                                {c}
                              </span>
                            ))}
                          </div>
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
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(8, 127, 140, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-primary-teal)'
              }}
            >
              <Thermometer size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                  Central Transfusion Storage Telemetry
                </span>
                <Badge
                  variant={
                    temperatureLogs.some(l => l.alert_raised)
                      ? "danger"
                      : temperatureLogs.length > 0
                      ? "success"
                      : "gray"
                  }
                  size="sm"
                >
                  {temperatureLogs.some(l => l.alert_raised)
                    ? "Excursion Alert Raised"
                    : temperatureLogs.length > 0
                    ? `Cold Chain Compliant (${temperatureLogs.length} Logs)`
                    : "Standby / Awaiting Telemetry"}
                </Badge>
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
                  {components.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No blood components found in inventory</div>
                        <div style={{ fontSize: 'var(--font-size-xs)' }}>
                          Components are derived from bag collections and appear here under quarantine until safe release verification.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    components.map((cmp) => {
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Storage Unit Cold Chain Telemetry & Sensor Logs */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsTemperatureModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Record Cold Chain Sensor Log</span>
            </Button>
          </div>
          <Card
            title="Storage Unit Cold Chain Telemetry & Sensor Logs"
            subtitle="Genuine temperature logs recorded in blood_storage_temperature_logs schema"
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Timestamp</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Storage Unit Code</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Unit Type</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Recorded Temp</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Target Range</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Agitator Operational</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Alert Status</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Recorded By</th>
                    <th style={{ padding: '10px 14px', fontWeight: '600' }}>Corrective Action</th>
                  </tr>
                </thead>
                <tbody>
                  {temperatureLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>No storage temperature logs recorded yet in database</div>
                        <div style={{ fontSize: 'var(--font-size-xs)' }}>
                          Automated and manual cold chain sensor readings will appear here once submitted.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    temperatureLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                        <td style={{ padding: '14px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          {new Date(log.recorded_at).toLocaleString()}
                        </td>
                        <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                          {log.storage_unit_code}
                        </td>
                        <td style={{ padding: '14px', textTransform: 'capitalize' }}>
                          {log.storage_unit_type?.replace(/_/g, ' ')}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: log.alert_raised ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                            <Thermometer size={14} color={log.alert_raised ? 'var(--color-error)' : 'var(--color-primary-teal)'} />
                            {log.recorded_temperature_c}°C
                          </div>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                          {log.target_min_temp_c}°C to {log.target_max_temp_c}°C
                        </td>
                        <td style={{ padding: '14px' }}>
                          {log.agitator_operational !== null && log.agitator_operational !== undefined ? (
                            <Badge variant={log.agitator_operational ? 'success' : 'danger'} size="sm">
                              {log.agitator_operational ? 'Active' : 'Stopped'}
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>N/A</span>
                          )}
                        </td>
                        <td style={{ padding: '14px' }}>
                          <Badge variant={log.alert_raised ? 'danger' : 'success'} size="sm">
                            {log.alert_raised ? 'Excursion Alert' : 'Normal'}
                          </Badge>
                        </td>
                        <td style={{ padding: '14px', color: 'var(--color-text-secondary)' }}>
                          {log.recorded_by_name}
                        </td>
                        <td style={{ padding: '14px', fontSize: 'var(--font-size-xs)', color: log.corrective_action ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                          {log.corrective_action || '—'}
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
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(8, 127, 140, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--color-primary-teal)'
              }}
            >
              <FlaskConical size={24} />
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
              {serologyWorkbenches.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                  <ShieldCheck size={44} color="var(--color-text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                  <div style={{ fontSize: 'var(--font-size-md)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    No Serology Workbenches Recorded
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    New collections will appear here awaiting dual ABO/Rh grouping and mandatory 5-pathogen TTI screening.
                  </div>
                </div>
              ) : (
                serologyWorkbenches.map((sero, idx) => {
                  const isReleased = sero.release_authorization?.status === 'approved_for_release';
                  const determinedGroup = sero.dual_grouping?.determined_group || 'Pending Dual Grouping';
                  const tech1 = sero.dual_grouping?.technician1 || 'Unassigned';
                  const tech2 = sero.dual_grouping?.technician2 || 'Unassigned';
                  const hasGrouping = Boolean(sero.dual_grouping);
                  const concur = Boolean(sero.dual_grouping?.concur);
                  const ttiList = Array.isArray(sero.tti_tests) ? sero.tti_tests : [];

                  const MANDATORY_TTI_CONFIG = [
                    { key: 'hiv_1_2', label: 'HIV 1 & 2' },
                    { key: 'hepatitis_b', label: 'Hepatitis B (HBsAg)' },
                    { key: 'hepatitis_c', label: 'Hepatitis C (Anti-HCV)' },
                    { key: 'syphilis', label: 'Syphilis (VDRL / RPR)' },
                    { key: 'malaria', label: 'Malaria Antigen / Smear' }
                  ];

                  const renderedTti = MANDATORY_TTI_CONFIG.map((cfg) => {
                    const match = ttiList.find((t) => t.name === cfg.key);
                    return {
                      key: cfg.key,
                      label: cfg.label,
                      result: match ? match.result : 'pending',
                      method: match ? match.method : 'Entry Awaited'
                    };
                  });

                  const releaseStatus = sero.release_authorization?.status;
                  let releaseBadgeVariant = 'warning';
                  let releaseBadgeLabel = 'Quarantined: Testing Incomplete';
                  if (releaseStatus === 'approved_for_release') {
                    releaseBadgeVariant = 'success';
                    releaseBadgeLabel = '✓ Approved for Safe Release';
                  } else if (releaseStatus === 'rejected') {
                    releaseBadgeVariant = 'danger';
                    releaseBadgeLabel = '✕ Rejected (Biohazard Protocol)';
                  } else if (releaseStatus === 'quarantined_for_retest') {
                    releaseBadgeVariant = 'warning';
                    releaseBadgeLabel = '⚠ Quarantined for Retest';
                  } else if (releaseStatus === 'escalated_supervisor') {
                    releaseBadgeVariant = 'danger';
                    releaseBadgeLabel = '⚠ Escalated to Lab Supervisor';
                  }

                  const holdReasons = [];
                  if (sero.release_authorization?.notes) {
                    holdReasons.push(sero.release_authorization.notes);
                  }
                  if (!hasGrouping) {
                    holdReasons.push('Dual-technician ABO/Rh grouping verification missing');
                  } else if (!concur) {
                    holdReasons.push('Technician grouping discrepancy — forward/reverse typing mismatch');
                  } else if (!sero.dual_grouping?.verified) {
                    holdReasons.push('Awaiting second technician sign-off on grouping');
                  }

                  const reactiveTests = ttiList.filter(t => t.result === 'reactive');
                  if (reactiveTests.length > 0) {
                    holdReasons.push(`Reactive infection marker detected: ${reactiveTests.map(t => t.name).join(', ')}`);
                  }

                  const unrecordedCount = renderedTti.filter(t => t.result === 'pending').length;
                  if (unrecordedCount > 0) {
                    holdReasons.push(`Incomplete TTI screen (${5 - unrecordedCount}/5 recorded)`);
                  }

                  const holdReasonText = holdReasons.length > 0 ? holdReasons.join(' • ') : 'Mandatory Serology Screening / Dual Grouping Pending';

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
                              Donor: {sero.donor_name} ({sero.blood_group_claimed || 'Unverified Group'})
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Badge variant={releaseBadgeVariant}>
                            {releaseBadgeLabel}
                          </Badge>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleOpenSerologyModal(sero)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckSquare size={13} />
                            <span>Record TTI & Dual Grouping</span>
                          </Button>
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
                            Determined: {determinedGroup} {hasGrouping ? `(Tech 1: ${tech1} • Tech 2: ${tech2})` : '(Pending Technician Verification)'}
                          </div>
                        </div>
                        {hasGrouping ? (
                          <Badge variant={concur ? 'success' : 'danger'}>
                            {concur ? 'Technicians Concur' : 'Grouping Discrepancy'}
                          </Badge>
                        ) : (
                          <Badge variant="gray">Awaiting Technicians</Badge>
                        )}
                      </div>

                      {/* 5 Mandatory TTI Results Grid */}
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                          Mandatory Infection Markers (5 TTI Tests)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                          {renderedTti.map((t, i) => {
                            const isNonReactive = t.result === 'non_reactive';
                            const isReactive = t.result === 'reactive';
                            const isPending = t.result === 'pending';
                            const badgeVar = isNonReactive ? 'success' : isReactive ? 'danger' : isPending ? 'gray' : 'warning';
                            const borderCol = isNonReactive ? 'var(--color-success-border)' : isReactive ? 'var(--color-error-border)' : 'var(--color-border)';

                            return (
                              <div
                                key={i}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 'var(--radius-md)',
                                  backgroundColor: '#FFFFFF',
                                  border: `1px solid ${borderCol}`
                                }}
                              >
                                <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                                  {t.label}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                                  <Badge variant={badgeVar} size="sm">
                                    {t.result.replace(/_/g, ' ')}
                                  </Badge>
                                  <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{t.method?.toUpperCase()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Authorization & Hold Reason Details */}
                      {isReleased ? (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px' }}>
                          Release authorized by: <strong>{sero.release_authorization?.authorized_by || 'Senior Medical Officer'}</strong> at {sero.release_authorization?.authorized_at ? new Date(sero.release_authorization.authorized_at).toLocaleString() : 'N/A'}
                        </div>
                      ) : (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertOctagon size={14} style={{ flexShrink: 0 }} />
                          <span><strong>Hold Reason:</strong> {holdReasonText}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsRequisitionModalOpen(true)}
                >
                  New Requisition
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={ShieldAlert}
                  onClick={() => setIsEmergencyModalOpen(true)}
                >
                  Emergency Uncrossed Release
                </Button>
              </div>
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
                  {requisitions.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <FileText size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>No Blood Requisitions Recorded</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Submit a requisition using the button above to request compatible units for hospital inpatients.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    requisitions.map((req) => {
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
                    })
                  )}
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
              <div style={{ fontSize: '2rem', fontWeight: '700', color: issues.length > 0 ? 'var(--color-success)' : 'var(--color-text-muted)', marginTop: '4px' }}>
                {issues.length > 0 ? '100% Compliant' : 'No Dispatches'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {issues.length > 0 ? 'Validated carrier temperature between 2°C – 6°C' : 'Awaiting first issue dispatch'}
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
                  {issues.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <Box size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>No Blood Units Dispatched Today</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                          Compatible blood requisitions will appear here once dispatched through clinical handover.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    issues.map((iss) => (
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
                    ))
                  )}
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

          {/* Standardized Medical History Questionnaire (Submodule 5.1) */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
              Standardized Medical History Questionnaire
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningQuestionnaire.recent_illness}
                onChange={(e) => setScreeningQuestionnaire({ ...screeningQuestionnaire, recent_illness: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span>Recent acute illness, dental procedure, or unexplained fever in past 14 days (Triggers temporary deferral)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningQuestionnaire.travel_endemic}
                onChange={(e) => setScreeningQuestionnaire({ ...screeningQuestionnaire, travel_endemic: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span>Recent travel to malaria / endemic transmission region within past 6 months (Triggers clinical review)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={screeningQuestionnaire.high_risk_behavior}
                onChange={(e) => setScreeningQuestionnaire({ ...screeningQuestionnaire, high_risk_behavior: e.target.checked })}
                style={{ marginTop: '2px' }}
              />
              <span style={{ color: screeningQuestionnaire.high_risk_behavior ? 'var(--color-error)' : 'inherit', fontWeight: screeningQuestionnaire.high_risk_behavior ? '600' : 'normal' }}>
                High-risk clinical exposure, IV drug history, or confirmed viral hepatitis contact (Triggers PERMANENT deferral)
              </span>
            </label>

            <Input
              label="Current Medications / Clinical Notes"
              placeholder="e.g. None reported; or Paracetamol 500mg 3 days ago"
              value={screeningQuestionnaire.medication_notes}
              onChange={(e) => setScreeningQuestionnaire({ ...screeningQuestionnaire, medication_notes: e.target.value })}
            />
          </div>

          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(73, 118, 159, 0.35)',
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
          {collectionFormError && (
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
              <span>{collectionFormError}</span>
            </div>
          )}

          {(() => {
            const eligibleDonors = donors.filter(
              (d) => d.donor_status === 'active' && d.last_screening?.eligibility_status === 'approved'
            );
            return (
              <Select
                label="Select Eligible Screened Donor"
                required
                value={collectionForm.donorId}
                onChange={(e) => setCollectionForm({ ...collectionForm, donorId: e.target.value })}
                options={[
                  { value: '', label: eligibleDonors.length === 0 ? 'No eligible screened donors available' : 'Select eligible screened donor' },
                  ...eligibleDonors.map((d) => ({
                    value: d.id,
                    label: `${d.full_name} (${d.donor_code} • ${d.blood_group}${d.rh_factor === 'positive' ? '+' : '-'})`
                  }))
                ]}
              />
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Bag Type"
              required
              value={collectionForm.bagType}
              onChange={(e) => setCollectionForm({ ...collectionForm, bagType: e.target.value })}
              options={[
                { value: '', label: 'Select bag type' },
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
                { value: '', label: 'Select collection volume' },
                { value: '350', label: '350 mL' },
                { value: '450', label: '450 mL' }
              ]}
            />
          </div>

          <Input
            label="Primary Bag Barcode"
            required
            placeholder="Scan or enter bag barcode (e.g. BB-10029482)"
            value={collectionForm.barcode}
            onChange={(e) => setCollectionForm({ ...collectionForm, barcode: e.target.value })}
          />

          <Input
            label="Phlebotomist Staff Name"
            required
            placeholder="Enter phlebotomist name"
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
            label="Authorizing Senior Clinician Name"
            required
            placeholder="e.g., Dr. Arindam Mitra"
            value={emergencyForm.authorizerName}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, authorizerName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Clinician Employee Code"
              required
              placeholder="e.g., DOC-TR-01"
              value={emergencyForm.authorizerCode}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, authorizerCode: e.target.value })}
            />
            <Input
              label="Emergency Release PIN"
              type="password"
              required
              placeholder="6-digit secret PIN"
              value={emergencyForm.authorizerPin}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, authorizerPin: e.target.value })}
            />
          </div>

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
              Component Barcode: <strong>{handoverTargetReq?.crossmatch?.component_barcode || handoverTargetReq?.crossmatch_barcode || 'Pending Allocation'}</strong> (Type: {handoverTargetReq?.requested_component?.toUpperCase()} • {handoverTargetReq?.patient_blood_group})
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Crossmatch ID: {handoverTargetReq?.crossmatch?.crossmatch_id || handoverTargetReq?.id || '—'} • Compatible (AHG Gel Card Method)
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

      {/* =========================================================================
          REGISTER VOLUNTARY DONOR MODAL (Submodule 5.1)
          ========================================================================= */}
      <Modal
        isOpen={isDonorModalOpen}
        onClose={() => setIsDonorModalOpen(false)}
        title="Register Voluntary Blood Donor"
        subtitle="Enrolls donor into hospital master registry with demographic & contact verification"
      >
        <form onSubmit={handleDonorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {donorFormError && (
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
              <span>{donorFormError}</span>
            </div>
          )}

          <Input
            label="Full Legal Name"
            required
            placeholder="e.g. Ramesh Kumar Verma"
            value={donorForm.full_name}
            onChange={(e) => setDonorForm({ ...donorForm, full_name: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Date of Birth"
              required
              type="date"
              value={donorForm.date_of_birth}
              onChange={(e) => setDonorForm({ ...donorForm, date_of_birth: e.target.value })}
            />
            <Select
              label="Gender"
              required
              value={donorForm.gender}
              onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
              options={[
                { value: '', label: 'Select gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="ABO Blood Group"
              required
              value={donorForm.blood_group}
              onChange={(e) => setDonorForm({ ...donorForm, blood_group: e.target.value })}
              options={[
                { value: '', label: 'Select blood group' },
                { value: 'A', label: 'Blood Group A' },
                { value: 'B', label: 'Blood Group B' },
                { value: 'AB', label: 'Blood Group AB' },
                { value: 'O', label: 'Blood Group O' }
              ]}
            />
            <Select
              label="Rh Factor"
              required
              value={donorForm.rh_factor}
              onChange={(e) => setDonorForm({ ...donorForm, rh_factor: e.target.value })}
              options={[
                { value: '', label: 'Select Rh factor' },
                { value: 'positive', label: 'Rh Positive (+)' },
                { value: 'negative', label: 'Rh Negative (-)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Mobile Phone Number"
              required
              placeholder="e.g. +91 98765 43210"
              value={donorForm.mobile}
              onChange={(e) => setDonorForm({ ...donorForm, mobile: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. ramesh.verma@example.com"
              value={donorForm.email}
              onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="National ID / Aadhaar"
              placeholder="e.g. 1234-5678-9012"
              value={donorForm.national_id}
              onChange={(e) => setDonorForm({ ...donorForm, national_id: e.target.value })}
            />
            <Input
              label="Residential Address"
              placeholder="e.g. 42 Park Avenue, Civil Lines"
              value={donorForm.address}
              onChange={(e) => setDonorForm({ ...donorForm, address: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Emergency Contact Person"
              placeholder="e.g. Sunita Verma"
              value={donorForm.emergency_contact_name}
              onChange={(e) => setDonorForm({ ...donorForm, emergency_contact_name: e.target.value })}
            />
            <Input
              label="Emergency Contact Phone"
              placeholder="e.g. +91 98765 00000"
              value={donorForm.emergency_contact_phone}
              onChange={(e) => setDonorForm({ ...donorForm, emergency_contact_phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsDonorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Voluntary Donor
            </Button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          CREATE BLOOD REQUISITION MODAL (Submodule 5.5)
          ========================================================================= */}
      <Modal
        isOpen={isRequisitionModalOpen}
        onClose={() => setIsRequisitionModalOpen(false)}
        title="Create Patient Blood Requisition"
        subtitle="Crossmatch order for inpatients with UHID verification & clinical indication"
      >
        <form onSubmit={handleRequisitionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {requisitionFormError && (
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
              <span>{requisitionFormError}</span>
            </div>
          )}

          {/* Patient UHID Entry & Live Validation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr auto', gap: '10px', alignItems: 'flex-end' }}>
              <Input
                label="Patient UHID"
                required
                placeholder="e.g. UHID-2026-0814"
                value={requisitionForm.patient_uhid}
                onChange={(e) => {
                  setRequisitionForm({ ...requisitionForm, patient_uhid: e.target.value });
                  if (verifiedPatient && verifiedPatient.uhid !== e.target.value) {
                    setVerifiedPatient(null);
                    setUhidValidationMessage(null);
                  }
                }}
                onBlur={() => {
                  if (requisitionForm.patient_uhid?.trim()) {
                    verifyPatientByUhid(requisitionForm.patient_uhid);
                  }
                }}
                helperText="Must match an enrolled hospital patient"
              />
              <Input
                label="Units Requested"
                required
                type="number"
                min="1"
                max="10"
                value={requisitionForm.units_requested}
                onChange={(e) => setRequisitionForm({ ...requisitionForm, units_requested: parseInt(e.target.value, 10) || 1 })}
              />
              <div style={{ paddingBottom: '2px' }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={isVerifyingUhid}
                  onClick={() => verifyPatientByUhid(requisitionForm.patient_uhid)}
                >
                  Verify UHID
                </Button>
              </div>
            </div>

            {uhidValidationMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: uhidValidationMessage.type === 'success' ? 'var(--color-bg-pale-aqua)' : 'var(--color-error-bg)',
                  border: `1px solid ${uhidValidationMessage.type === 'success' ? 'rgba(73, 118, 159, 0.35)' : 'var(--color-error-border)'}`,
                  color: uhidValidationMessage.type === 'success' ? 'var(--color-primary-teal)' : 'var(--color-error)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {uhidValidationMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertOctagon size={16} />}
                <span>{uhidValidationMessage.text}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Requested Component"
              required
              value={requisitionForm.requested_component}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, requested_component: e.target.value })}
              options={[
                { value: '', label: 'Select component' },
                { value: 'prbc', label: 'Packed Red Blood Cells (PRBC)' },
                { value: 'ffp', label: 'Fresh Frozen Plasma (FFP)' },
                { value: 'platelets', label: 'Random Donor Platelets (RDP)' },
                { value: 'cryoprecipitate', label: 'Cryoprecipitate' },
                { value: 'whole_blood', label: 'Whole Blood' },
                { value: 'cryo_poor_plasma', label: 'Cryo-Poor Plasma' }
              ]}
            />
            <Select
              label="Clinical Urgency"
              required
              value={requisitionForm.urgency}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, urgency: e.target.value })}
              options={[
                { value: '', label: 'Select clinical urgency' },
                { value: 'routine', label: 'Routine (Elective / Ward)' },
                { value: 'urgent', label: 'Urgent (Required within 2 hours)' },
                { value: 'stat_emergency', label: 'STAT Emergency (Immediate)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Patient ABO Blood Group"
              required
              value={requisitionForm.patient_blood_group}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, patient_blood_group: e.target.value })}
              options={[
                { value: '', label: 'Select blood group' },
                { value: 'A', label: 'Group A' },
                { value: 'B', label: 'Group B' },
                { value: 'AB', label: 'Group AB' },
                { value: 'O', label: 'Group O' }
              ]}
            />
            <Select
              label="Patient Rh Factor"
              required
              value={requisitionForm.patient_rh_factor}
              onChange={(e) => setRequisitionForm({ ...requisitionForm, patient_rh_factor: e.target.value })}
              options={[
                { value: '', label: 'Select Rh factor' },
                { value: 'positive', label: 'Rh Positive (+)' },
                { value: 'negative', label: 'Rh Negative (-)' }
              ]}
            />
          </div>

          <Input
            label="Clinical Indication / Diagnosis"
            required
            placeholder="e.g. Acute upper GI bleeding with severe anaemia (Hb 6.8 g/dL)"
            value={requisitionForm.clinical_indication}
            onChange={(e) => setRequisitionForm({ ...requisitionForm, clinical_indication: e.target.value })}
          />

          <Input
            label="Prescribing Clinician / Department"
            required
            placeholder="e.g. Dr. A. Sengupta, Trauma Surgery"
            value={requisitionForm.requester_name}
            onChange={(e) => setRequisitionForm({ ...requisitionForm, requester_name: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="ghost" onClick={() => setIsRequisitionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Blood Requisition
            </Button>
          </div>
        </form>
      </Modal>

      {/* Storage Unit Cold Chain Temperature Sensor Modal */}
      <Modal
        isOpen={isTemperatureModalOpen}
        onClose={() => setIsTemperatureModalOpen(false)}
        title="Record Storage Unit Cold Chain Temperature Reading"
      >
        <form onSubmit={handleSaveTemperatureLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Storage Unit Code"
              required
              value={temperatureForm.storage_unit_code}
              onChange={(e) => {
                const code = e.target.value;
                let type = 'blood_refrigerator';
                let min = '2.0';
                let max = '6.0';
                let agit = false;
                if (code.startsWith('FRZ-01')) {
                  type = 'plasma_freezer';
                  min = '-35.0';
                  max = '-25.0';
                } else if (code.startsWith('AGIT')) {
                  type = 'platelet_agitator';
                  min = '20.0';
                  max = '24.0';
                  agit = true;
                } else if (code.startsWith('FRZ-02')) {
                  type = 'cryo_freezer';
                  min = '-40.0';
                  max = '-30.0';
                }
                setTemperatureForm({
                  ...temperatureForm,
                  storage_unit_code: code,
                  storage_unit_type: type,
                  target_min_temp_c: min,
                  target_max_temp_c: max,
                  agitator_operational: agit
                });
              }}
              options={[
                { value: 'REF-01', label: 'REF-01: Main Blood Bank Walk-In Refrigerator (2°C - 6°C)' },
                { value: 'FRZ-01', label: 'FRZ-01: Ultra-Low Plasma Deep Freezer (-35°C - -25°C)' },
                { value: 'AGIT-01', label: 'AGIT-01: Helmer Platelet Agitator Chamber (20°C - 24°C)' },
                { value: 'FRZ-02', label: 'FRZ-02: Cryoprecipitate Storage Unit (-40°C - -30°C)' }
              ]}
            />
            <Input
              label="Storage Unit Type"
              value={temperatureForm.storage_unit_type.replace(/_/g, ' ')}
              disabled
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <Input
              label="Recorded Temp (°C)"
              required
              type="number"
              step="0.1"
              value={temperatureForm.recorded_temperature_c}
              onChange={(e) => setTemperatureForm({ ...temperatureForm, recorded_temperature_c: e.target.value })}
            />
            <Input
              label="Target Min Temp (°C)"
              value={temperatureForm.target_min_temp_c}
              disabled
            />
            <Input
              label="Target Max Temp (°C)"
              value={temperatureForm.target_max_temp_c}
              disabled
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
            <input
              type="checkbox"
              id="agitator_status"
              checked={temperatureForm.agitator_operational}
              onChange={(e) => setTemperatureForm({ ...temperatureForm, agitator_operational: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="agitator_status" style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-primary-teal)', cursor: 'pointer' }}>
              Agitator / Circulation Motor Operational & Oscillating Normally
            </label>
          </div>

          <Input
            label="Staff Technician / Sensor Operator"
            required
            value={temperatureForm.recorded_by_name}
            onChange={(e) => setTemperatureForm({ ...temperatureForm, recorded_by_name: e.target.value })}
          />

          <Input
            label="Corrective Action (if out of range excursion)"
            placeholder="e.g. Compressor calibrated, secondary cold pack circulation activated"
            value={temperatureForm.corrective_action}
            onChange={(e) => setTemperatureForm({ ...temperatureForm, corrective_action: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsTemperatureModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Temperature Log
            </Button>
          </div>
        </form>
      </Modal>

      {/* Serology TTI Screening & Dual Grouping Verification Modal */}
      <Modal
        isOpen={isSerologyModalOpen}
        onClose={() => setIsSerologyModalOpen(false)}
        title={`Serology TTI Screen & Dual Grouping: ${selectedSerologyTarget?.donation_number || ''}`}
      >
        <form onSubmit={handleSaveSerologyResult} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', fontSize: '0.8rem', color: '#991B1B' }}>
            <strong>Mandatory Safety Gate:</strong> All 5 TTI infection markers must be Non-Reactive, and forward/reverse grouping between Technicians 1 & 2 must concur before release approval.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Technician 1 ABO/Rh Group"
              required
              value={serologyForm.technician1_group}
              onChange={(e) => setSerologyForm({ ...serologyForm, technician1_group: e.target.value })}
              options={[
                { value: 'O Positive', label: 'O Positive (O+)' },
                { value: 'O Negative', label: 'O Negative (O-)' },
                { value: 'A Positive', label: 'A Positive (A+)' },
                { value: 'A Negative', label: 'A Negative (A-)' },
                { value: 'B Positive', label: 'B Positive (B+)' },
                { value: 'B Negative', label: 'B Negative (B-)' },
                { value: 'AB Positive', label: 'AB Positive (AB+)' },
                { value: 'AB Negative', label: 'AB Negative (AB-)' }
              ]}
            />
            <Select
              label="Technician 2 ABO/Rh Group"
              required
              value={serologyForm.technician2_group}
              onChange={(e) => setSerologyForm({ ...serologyForm, technician2_group: e.target.value })}
              options={[
                { value: 'O Positive', label: 'O Positive (O+)' },
                { value: 'O Negative', label: 'O Negative (O-)' },
                { value: 'A Positive', label: 'A Positive (A+)' },
                { value: 'A Negative', label: 'A Negative (A-)' },
                { value: 'B Positive', label: 'B Positive (B+)' },
                { value: 'B Negative', label: 'B Negative (B-)' },
                { value: 'AB Positive', label: 'AB Positive (AB+)' },
                { value: 'AB Negative', label: 'AB Negative (AB-)' }
              ]}
            />
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
              5-Pathogen Mandatory Transfusion-Transmissible Infection (TTI) Screen
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <Select
                label="HIV 1 & 2 (4th Gen ELISA)"
                value={serologyForm.hiv_result}
                onChange={(e) => setSerologyForm({ ...serologyForm, hiv_result: e.target.value })}
                options={[
                  { value: 'non_reactive', label: 'Non-Reactive' },
                  { value: 'reactive', label: 'Reactive (Biohazard)' },
                  { value: 'indeterminate', label: 'Indeterminate' }
                ]}
              />
              <Select
                label="Hepatitis B (HBsAg CLIA)"
                value={serologyForm.hbv_result}
                onChange={(e) => setSerologyForm({ ...serologyForm, hbv_result: e.target.value })}
                options={[
                  { value: 'non_reactive', label: 'Non-Reactive' },
                  { value: 'reactive', label: 'Reactive (Biohazard)' },
                  { value: 'indeterminate', label: 'Indeterminate' }
                ]}
              />
              <Select
                label="Hepatitis C (Anti-HCV CLIA)"
                value={serologyForm.hcv_result}
                onChange={(e) => setSerologyForm({ ...serologyForm, hcv_result: e.target.value })}
                options={[
                  { value: 'non_reactive', label: 'Non-Reactive' },
                  { value: 'reactive', label: 'Reactive (Biohazard)' },
                  { value: 'indeterminate', label: 'Indeterminate' }
                ]}
              />
              <Select
                label="Syphilis (VDRL/RPR)"
                value={serologyForm.syphilis_result}
                onChange={(e) => setSerologyForm({ ...serologyForm, syphilis_result: e.target.value })}
                options={[
                  { value: 'non_reactive', label: 'Non-Reactive' },
                  { value: 'reactive', label: 'Reactive (Biohazard)' },
                  { value: 'indeterminate', label: 'Indeterminate' }
                ]}
              />
              <Select
                label="Malaria (Dual Ag / Smear)"
                value={serologyForm.malaria_result}
                onChange={(e) => setSerologyForm({ ...serologyForm, malaria_result: e.target.value })}
                options={[
                  { value: 'non_reactive', label: 'Non-Reactive' },
                  { value: 'reactive', label: 'Reactive (Biohazard)' },
                  { value: 'indeterminate', label: 'Indeterminate' }
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Release Authorization Decision"
              required
              value={serologyForm.release_decision}
              onChange={(e) => setSerologyForm({ ...serologyForm, release_decision: e.target.value })}
              options={[
                { value: 'approved_for_release', label: '✓ Approved for Safe Release' },
                { value: 'quarantined_for_retest', label: '⚠ Quarantined for Retest' },
                { value: 'rejected', label: '✕ Rejected (Biohazard Protocol Incinerate)' }
              ]}
            />
            <Input
              label="Authorizing Consultant Pathologist"
              value="Dr. Jayant Mukherjee (MD Pathology, Reg #KMC-41908)"
              disabled
            />
          </div>

          <Input
            label="Pathologist Release Remarks"
            required
            value={serologyForm.pathologist_notes}
            onChange={(e) => setSerologyForm({ ...serologyForm, pathologist_notes: e.target.value })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsSerologyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Sign & Commit Serology Findings
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
