import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  UserCheck,
  Building2,
  Bed,
  FlaskConical,
  Droplet,
  FileText,
  Settings,
  Bell,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Activity,
  LogOut,
  LogIn,
  Lock,
  User,
  Receipt,
  Egg,
  Siren,
  RotateCcw,
  AlertTriangle,
  Database,
  Check,
  Copy,
  Utensils,
  FileSpreadsheet,
  HeartPulse,
  Archive
} from 'lucide-react';
import { Button, Modal, Badge } from '../common/UIPrimitives';
import { useHospitalState } from '../../context/HospitalStateContext';
import { useAuth } from '../../context/AuthContext';
import { MODULE_GROUPS, SUBMODULES } from '../appointments/submoduleRegistry';
import { BILLING_GROUPS } from '../billing/billingConstants';

export const AppShell = ({
  currentRoute,
  onNavigate,
  children
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { storageWarning, quarantineData, resetDemoData, dismissStorageWarning, retryPersistence } = useHospitalState();
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState(false);
  const [isQuarantineInspectModalOpen, setIsQuarantineInspectModalOpen] = useState(false);
  const [resetFeedback, setResetFeedback] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState({});

  const handleCopyRawPayload = async (incidentId, rawText) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard || !navigator.clipboard.writeText) {
      setCopyFeedback(prev => ({
        ...prev,
        [incidentId]: { status: 'error', message: 'Clipboard API not supported' }
      }));
      setTimeout(() => {
        setCopyFeedback(prev => {
          const next = { ...prev };
          delete next[incidentId];
          return next;
        });
      }, 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(rawText || '');
      setCopyFeedback(prev => ({
        ...prev,
        [incidentId]: { status: 'success', message: 'Copied!' }
      }));
      setTimeout(() => {
        setCopyFeedback(prev => {
          const next = { ...prev };
          delete next[incidentId];
          return next;
        });
      }, 2000);
    } catch (err) {
      console.warn('[AppShell] Clipboard copy failed:', err);
      setCopyFeedback(prev => ({
        ...prev,
        [incidentId]: { status: 'error', message: 'Copy denied by browser' }
      }));
      setTimeout(() => {
        setCopyFeedback(prev => {
          const next = { ...prev };
          delete next[incidentId];
          return next;
        });
      }, 3000);
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medicsprime_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const [expandedSectionsManual, setExpandedSectionsManual] = useState({});
  const [expandedAppointmentGroups, setExpandedAppointmentGroups] = useState({});
  const [expandedBillingGroups, setExpandedBillingGroups] = useState({});
  const [expandedSubmodules, setExpandedSubmodules] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand current active module accordion while collapsing inactive ones to prevent sidebar clutter
  useEffect(() => {
    if (typeof currentRoute !== 'string') return;
    const baseRoute = currentRoute.split(':')[0];

    let activeSectionId = baseRoute;
    if (baseRoute === 'insurance') activeSectionId = 'credit-billing';
    if (baseRoute === 'diet') activeSectionId = 'dietary';
    if (baseRoute === 'lab') activeSectionId = 'laboratory';
    if (baseRoute === 'submodule') {
      const parts = currentRoute.split(':');
      const subId = parts[1] || '';
      if (subId.startsWith('1.') || subId.startsWith('2.') || subId.startsWith('4.')) activeSectionId = 'billing';
      else if (subId.startsWith('5.')) activeSectionId = 'bloodbank';
      else if (subId.startsWith('7.')) activeSectionId = 'credit-billing';
      else if (subId.startsWith('8.')) activeSectionId = 'daycare';
      else if (subId.startsWith('9.')) activeSectionId = 'dietary';
      else if (subId.startsWith('10.') || subId === '10.0') activeSectionId = 'embryology';
      else if (subId.startsWith('11.')) activeSectionId = 'emergency';
      else if (subId.startsWith('12.')) activeSectionId = 'emr';
      else if (subId.startsWith('18.')) activeSectionId = 'ivf';
      else if (subId.startsWith('19.')) activeSectionId = 'laboratory';
      else if (subId.startsWith('20.')) activeSectionId = 'mrd';
      else if (subId.startsWith('21.')) activeSectionId = 'nursing';
      else if (subId.startsWith('22.')) activeSectionId = 'opd';
    }

    // Keep only the active module expanded by default so sidebar doesn't get cluttered with multiple open accordions
    setExpandedSectionsManual({ [activeSectionId]: true });

    // Auto-expand Level 2 submodule if present
    const routeParts = currentRoute.split(':');
    if (routeParts.length >= 2) {
      const subIdKey = `${activeSectionId}:${routeParts[1]}`;
      setExpandedSubmodules({ [subIdKey]: true });
    }

    if (activeSectionId === 'billing') {
      const parts = currentRoute.split(':');
      const subId = parts[1];
      if (subId) {
        const groupNum = subId.split('.')[0];
        if (groupNum) {
          setExpandedBillingGroups({ [groupNum]: true });
        }
      }
    }

    if (activeSectionId === 'appointments') {
      if (currentRoute.startsWith('appointments:')) {
        const parts = currentRoute.split(':');
        if (parts[1] === 'group') {
          const gId = parts[2];
          if (gId) {
            setExpandedAppointmentGroups({ [gId]: true });
          }
        } else {
          const subId = parts[1]?.replace('submodule:', '');
          const found = SUBMODULES.find(s => s.id === subId);
          if (found) {
            setExpandedAppointmentGroups({ [found.groupId]: true });
          }
        }
      } else {
        setExpandedAppointmentGroups({ '3': true });
      }
    }
  }, [currentRoute]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medicsprime_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Clinical Operations',
      items: [
        { id: 'patients', label: 'Patients', icon: Users, badge: '4 New' },
        {
          id: 'appointments',
          label: 'Appointments',
          icon: Calendar,
          badge: '30 Groups',
          isAppointmentHierarchy: true
        },
        {
          id: 'billing',
          label: 'Billing',
          icon: Receipt,
          badge: '16 Modules',
          isBillingHierarchy: true
        },
        {
          id: 'credit-billing',
          label: 'Credit Billing',
          icon: ShieldCheck,
          badge: '5 Modules',
          subItems: [
            { id: 'credit-billing:7.1', label: '7.1 TPA Pre-Authorization' },
            { id: 'credit-billing:7.2', label: '7.2 Enhancement Requests' },
            { id: 'credit-billing:7.3', label: '7.3 Claim Dossiers' },
            { id: 'credit-billing:7.4', label: '7.4 Co-Pay & Deductibles' },
            { id: 'credit-billing:7.5', label: '7.5 TPA Reconciliation' }
          ]
        },
        {
          id: 'embryology',
          label: 'Embryology',
          icon: Egg,
          badge: '5 Modules',
          subItems: [
            { id: 'embryology:10.1', label: 'Oocyte Retrieval (OPU) Recording' },
            { id: 'embryology:10.2', label: 'Fertilization (Conventional IVF / ICSI)' },
            { id: 'embryology:10.3', label: 'Embryo Morphological Grading' },
            { id: 'embryology:10.4', label: 'Embryo Transfer (ET) Protocol' },
            { id: 'embryology:10.5', label: 'Embryo Cryostorage Management' }
          ]
        },
        {
          id: 'emergency',
          label: 'Emergency',
          icon: Siren,
          badge: '5 Modules',
          subItems: [
            { id: 'emergency:11.1', label: '11.1 Triage Assessment (Level 1 to 4)' },
            { id: 'emergency:11.2', label: '11.2 Medico-Legal Case (MLC) Registry' },
            { id: 'emergency:11.3', label: '11.3 Emergency Bay & Bed Allocation' },
            { id: 'emergency:11.4', label: '11.4 Trauma Clinical Charting' },
            { id: 'emergency:11.5', label: '11.5 Rapid Disposition (ICU/OT/Ward/Discharge)' }
          ]
        },
        {
          id: 'clinical',
          label: 'Clinical Desk',
          icon: Stethoscope,
          subItems: [
            { id: 'clinical:consultation', label: 'Doctor Consultation Desk' },
            { id: 'clinical:vitals', label: 'Vitals Recording & Physical Examination' },
            { id: 'clinical:history', label: 'Chief Complaints & Clinical History' },
            { id: 'clinical:orders', label: 'Orders (CPOE)' },
            { id: 'clinical:notes', label: 'Clinical Progress Notes' }
          ]
        },
        {
          id: 'daycare',
          label: 'Day Care',
          icon: Bed,
          subItems: [
            { id: 'daycare:8.1', label: 'Admission & Procedure' },
            { id: 'daycare:8.2', label: 'Chair & Bed Allocation' },
            { id: 'daycare:8.3', label: 'Procedure Monitoring' },
            { id: 'daycare:8.4', label: 'Discharge Summary' }
          ]
        },
        {
          id: 'dietary',
          label: 'Diet & Nutrition',
          icon: Utensils,
          subItems: [
            { id: 'dietary:9.1', label: 'Nutritional Assessment' },
            { id: 'dietary:9.2', label: 'Patient Diet Ordering' },
            { id: 'dietary:9.3', label: 'Kitchen Batch Production' },
            { id: 'dietary:9.4', label: 'Ward Meal Delivery' }
          ]
        },
        {
          id: 'emr',
          label: 'EMR Records',
          icon: FileSpreadsheet,
          subItems: [
            { id: 'emr:12.1', label: 'Patient Timeline' },
            { id: 'emr:12.2', label: 'Prescription Studio' },
            { id: 'emr:12.3', label: 'ICD-10 Diagnoses' },
            { id: 'emr:12.4', label: 'Encounters Browser' },
            { id: 'emr:12.5', label: 'Clinical Documents' }
          ]
        },
        {
          id: 'bloodbank',
          label: 'Blood Bank',
          icon: Droplet,
          highlight: true,
          subItems: [
            { id: 'bloodbank:donors', label: 'Donors & Screening' },
            { id: 'bloodbank:collection', label: 'Bag Collection & Barcodes' },
            { id: 'bloodbank:inventory', label: 'Inventory & Cold Chain' },
            { id: 'bloodbank:serology', label: 'Serology & Safe Release' },
            { id: 'bloodbank:requisitions', label: 'Requisitions & Crossmatch' },
            { id: 'bloodbank:handover', label: 'Issue & Handover Dispatch' },
            { id: 'bloodbank:audit', label: 'Immutable Audit Trail' }
          ]
        },
        {
          id: 'ivf',
          label: 'IVF',
          icon: HeartPulse,
          subItems: [
            {
              id: 'ivf:18.1',
              label: 'Couple Registration & Consent',
              subsubItems: [
                { id: 'ivf:18.1:18.1.1', label: 'Registration & Bonded Identifier' },
                { id: 'ivf:18.1:18.1.2', label: 'Legal ART Consent Verification' },
                { id: 'ivf:18.1:18.1.3', label: 'Pre-Treatment Serology Screening' }
              ]
            },
            {
              id: 'ivf:18.2',
              label: 'Controlled Ovarian Stimulation',
              subsubItems: [
                { id: 'ivf:18.2:18.2.1', label: 'Stimulation Protocol & Dosage' },
                { id: 'ivf:18.2:18.2.2', label: 'Hormonal Surge Monitoring (E2/P4)' },
                { id: 'ivf:18.2:18.2.3', label: 'Medication Dispense Schedule' }
              ]
            },
            {
              id: 'ivf:18.3',
              label: 'Bilateral Follicular USG',
              subsubItems: [
                { id: 'ivf:18.3:18.3.1', label: 'TVS Folliculometry' },
                { id: 'ivf:18.3:18.3.2', label: 'Bilateral Ovary Follicle Grid' },
                { id: 'ivf:18.3:18.3.3', label: 'Endometrial Thickness & Grading' }
              ]
            },
            {
              id: 'ivf:18.4',
              label: 'Ovulatory Trigger & OPU',
              subsubItems: [
                { id: 'ivf:18.4:18.4.1', label: 'Trigger Administration Clock' },
                { id: 'ivf:18.4:18.4.2', label: '35-36h OPU Surgery Slot' },
                { id: 'ivf:18.4:18.4.3', label: 'Anesthesia & Pre-Op Clearance' }
              ]
            },
            {
              id: 'ivf:18.5',
              label: 'Pregnancy Outcome & Beta-hCG',
              subsubItems: [
                { id: 'ivf:18.5:18.5.1', label: 'Luteal Phase Support Tracking' },
                { id: 'ivf:18.5:18.5.2', label: 'Day 14 Serum Beta-hCG Testing' },
                { id: 'ivf:18.5:18.5.3', label: 'Gestational Sac Ultrasound' }
              ]
            }
          ]
        },
        {
          id: 'laboratory',
          label: 'Laboratory',
          icon: FlaskConical,
          subItems: [
            {
              id: 'laboratory:19.1',
              label: 'Test Requisition & Billing',
              subsubItems: [
                { id: 'laboratory:19.1:19.1.1', label: 'Order Intake & Walk-in' },
                { id: 'laboratory:19.1:19.1.2', label: 'Billing & Ledger Routing' },
                { id: 'laboratory:19.1:19.1.3', label: 'LIS Accession Worklist' }
              ]
            },
            {
              id: 'laboratory:19.2',
              label: 'Phlebotomy & Tube Barcoding',
              subsubItems: [
                { id: 'laboratory:19.2:19.2.1', label: 'Phlebotomy Queue & Chair' },
                { id: 'laboratory:19.2:19.2.2', label: 'Color-Coded Tube Barcodes' },
                { id: 'laboratory:19.2:19.2.3', label: 'Specimen Draw Allocation' },
                { id: 'laboratory:19.2:19.2.4', label: 'Collection Timestamp Verification' }
              ]
            },
            {
              id: 'laboratory:19.3',
              label: 'Instrument Interfacing',
              subsubItems: [
                { id: 'laboratory:19.3:19.3.1', label: 'Specimen Bench Check-in' },
                { id: 'laboratory:19.3:19.3.2', label: 'ASTM / HL7 Profile Query' },
                { id: 'laboratory:19.3:19.3.3', label: 'Analytical Run & Raw Data' }
              ]
            },
            {
              id: 'laboratory:19.4',
              label: 'Result Entry & Panic Alerts',
              subsubItems: [
                { id: 'laboratory:19.4:19.4.1', label: 'Automated & Manual Result Entry' },
                { id: 'laboratory:19.4:19.4.2', label: 'Reference Interval Validation' },
                { id: 'laboratory:19.4:19.4.3', label: 'Abnormal High / Low Flags' },
                { id: 'laboratory:19.4:19.4.4', label: 'Life-Threatening Panic Alerts' }
              ]
            },
            {
              id: 'laboratory:19.5',
              label: 'Pathologist Authorization',
              subsubItems: [
                { id: 'laboratory:19.5:19.5.1', label: 'Historical Trend & Flag Review' },
                { id: 'laboratory:19.5:19.5.2', label: 'Clinical Interpretation Remarks' },
                { id: 'laboratory:19.5:19.5.3', label: 'Digital Signature & Authorization' },
                { id: 'laboratory:19.5:19.5.4', label: 'Multi-Channel EMR Publishing' }
              ]
            }
          ]
        },
        {
          id: 'mrd',
          label: 'MRD',
          icon: Archive,
          subItems: [
            {
              id: 'mrd:20.1',
              label: 'Physical Archival & Tracking',
              subsubItems: [
                { id: 'mrd:20.1:20.1.1', label: '48h Inpatient File Inward' },
                { id: 'mrd:20.1:20.1.2', label: 'File Completeness Inspection' },
                { id: 'mrd:20.1:20.1.3', label: 'Physical Coordinate Assignment' },
                { id: 'mrd:20.1:20.1.4', label: 'Permanent Record Room Index' }
              ]
            },
            {
              id: 'mrd:20.2',
              label: 'ICD-10 & CPT Clinical Coding',
              subsubItems: [
                { id: 'mrd:20.2:20.2.1', label: 'Operative & Discharge Review' },
                { id: 'mrd:20.2:20.2.2', label: 'Primary Cause ICD-10-CM' },
                { id: 'mrd:20.2:20.2.3', label: 'Surgical Procedure CPT Mapping' },
                { id: 'mrd:20.2:20.2.4', label: 'Morbidity Statistics & Indexing' }
              ]
            },
            {
              id: 'mrd:20.3',
              label: 'Birth & Death Registration',
              subsubItems: [
                { id: 'mrd:20.3:20.3.1', label: 'Obstetric Birth Intimation' },
                { id: 'mrd:20.3:20.3.2', label: 'Form 4 / 4A Cause of Death' }
              ]
            },
            {
              id: 'mrd:20.4',
              label: 'File Checkout & Audit Lending',
              subsubItems: [
                { id: 'mrd:20.4:20.4.1', label: 'Requisition & Subpoena Intake' },
                { id: 'mrd:20.4:20.4.2', label: 'Checkout Logging & Deadlines' },
                { id: 'mrd:20.4:20.4.3', label: 'Overdue Loan Tracking & Alerts' }
              ]
            }
          ]
        },
        {
          id: 'nursing',
          label: 'Nursing',
          icon: HeartPulse,
          subItems: [
            {
              id: 'nursing:21.1',
              label: 'Ward Nursing Workstation',
              subsubItems: [
                { id: 'nursing:21.1:21.1.1', label: 'Assigned Wing Shift Dashboard' },
                { id: 'nursing:21.1:21.1.2', label: 'Bedside Vital Alerts & Census' },
                { id: 'nursing:21.1:21.1.3', label: 'Active Care Plan Launcher' }
              ]
            },
            {
              id: 'nursing:21.2',
              label: 'Vitals & Intake-Output',
              subsubItems: [
                { id: 'nursing:21.2:21.2.1', label: 'Bedside Scheduled Vitals' },
                { id: 'nursing:21.2:21.2.2', label: 'Fluid Intake Logging' },
                { id: 'nursing:21.2:21.2.3', label: 'Fluid Output Logging' },
                { id: 'nursing:21.2:21.2.4', label: '24h Cumulative Fluid Balance' }
              ]
            },
            {
              id: 'nursing:21.3',
              label: 'Medication Administration (MAR)',
              subsubItems: [
                { id: 'nursing:21.3:21.3.1', label: 'Shift Scheduled Medication Grid' },
                { id: 'nursing:21.3:21.3.2', label: 'Wristband & Barcode Verification' },
                { id: 'nursing:21.3:21.3.3', label: 'Administered Electronic Time' },
                { id: 'nursing:21.3:21.3.4', label: 'Withheld Dose & Reason' }
              ]
            },
            {
              id: 'nursing:21.4',
              label: 'Doctor Order Execution',
              subsubItems: [
                { id: 'nursing:21.4:21.4.1', label: 'Real-time Inpatient Order Queue' },
                { id: 'nursing:21.4:21.4.2', label: 'Bedside Execution Sign-off' }
              ]
            },
            {
              id: 'nursing:21.5',
              label: 'Shift Handover Notes',
              subsubItems: [
                { id: 'nursing:21.5:21.5.1', label: 'Shift End Summary Compilation' },
                { id: 'nursing:21.5:21.5.2', label: 'Outgoing Nurse SBAR Notes' },
                { id: 'nursing:21.5:21.5.3', label: 'Incoming Nurse Acceptance' }
              ]
            }
          ]
        },
        {
          id: 'opd',
          label: 'OPD',
          icon: Stethoscope,
          subItems: [
            {
              id: 'opd:22.1',
              label: 'OPD Clinic Desk Dashboard',
              subsubItems: [
                { id: 'opd:22.1:22.1.1', label: 'Specialty Session Activation' },
                { id: 'opd:22.1:22.1.2', label: 'Doctor Roster & Room Assign' },
                { id: 'opd:22.1:22.1.3', label: 'Clinic Flow & Wait Telemetry' }
              ]
            },
            {
              id: 'opd:22.2',
              label: 'Patient Arrival & Check-in',
              subsubItems: [
                { id: 'opd:22.2:22.2.1', label: 'Reception Desk Check-in' },
                { id: 'opd:22.2:22.2.2', label: 'Arrival Status Flip' }
              ]
            },
            {
              id: 'opd:22.3',
              label: 'Consultation Queue',
              subsubItems: [
                { id: 'opd:22.3:22.3.1', label: 'Live Queue Pacing' },
                { id: 'opd:22.3:22.3.2', label: 'Emergency & Senior Priority' },
                { id: 'opd:22.3:22.3.3', label: 'Cabin Waiting Count Display' }
              ]
            },
            {
              id: 'opd:22.4',
              label: 'OPD Visit Slip Printout',
              subsubItems: [
                { id: 'opd:22.4:22.4.1', label: 'Automated Visit Slip Gen' },
                { id: 'opd:22.4:22.4.2', label: 'Barcode & Token Slip Printing' }
              ]
            },
            {
              id: 'opd:22.5',
              label: 'Follow-up Tracking',
              subsubItems: [
                { id: 'opd:22.5:22.5.1', label: 'Review Date Scheduling' },
                { id: 'opd:22.5:22.5.2', label: 'Recall SMS & WhatsApp' }
              ]
            }
          ]
        },
        { id: 'doctors', label: 'Staff & Doctors', icon: UserCheck },
        { id: 'departments', label: 'Departments & Wards', icon: Building2 },
        { id: 'rooms', label: 'Beds & Inpatient', icon: Bed }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'reports', label: 'Reports & Audit Logs', icon: FileText },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  const handleSelectNav = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const effectiveCollapsed = isCollapsed && !isMobileMenuOpen;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 50, 56, 0.45)',
            zIndex: 90,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isMobileMenuOpen ? 'translateX(0)' : undefined
        }}
        className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: effectiveCollapsed ? '0 12px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: effectiveCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF',
            flexShrink: 0
          }}
        >
          {!effectiveCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(8, 127, 140, 0.25)',
                    flexShrink: 0
                  }}
                >
                  <Activity size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--color-primary-teal)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    MedicsPrime
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hospital Management
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="desktop-collapse-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-close-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                  title="Close navigation"
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(8, 127, 140, 0.25)'
                }}
                title="MedicsPrime Hospital Management"
              >
                <Activity size={18} />
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="desktop-collapse-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Hospital Identity Header */}
        <div style={{ padding: effectiveCollapsed ? '8px 10px 4px' : '10px 12px 4px', flexShrink: 0 }}>
          {!effectiveCollapsed ? (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--color-primary-teal)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Apex Central Hospital
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Main Clinical Campus
                  </div>
                </div>
              </div>
              <ShieldCheck size={14} color="var(--color-primary-teal)" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '34px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Apex Central Hospital • Main Clinical Campus"
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)'
                }}
              />
              <ShieldCheck size={14} color="var(--color-primary-teal)" />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: effectiveCollapsed ? '8px 8px' : '8px 10px' }}>
          {navSections.map((section, idx) => (
            <div key={section.title} style={{ marginBottom: effectiveCollapsed ? '8px' : '12px' }}>
              {!effectiveCollapsed ? (
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '8px 10px 4px',
                    textAlign: 'left'
                  }}
                >
                  {section.title}
                </div>
              ) : (
                idx > 0 && (
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--color-border-subtle)',
                      margin: '6px 6px 8px'
                    }}
                  />
                )
              )}

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map((item) => {
                  const isItemActive = currentRoute === item.id ||
                    (typeof currentRoute === 'string' && currentRoute.startsWith(item.id + ':'));
                  const Icon = item.icon;
                  const hasSubItems = Boolean(item.isAppointmentHierarchy || item.isBillingHierarchy || (item.subItems && item.subItems.length > 0));
                  const isExpanded = Boolean(
                    expandedSectionsManual[item.id] !== undefined
                      ? expandedSectionsManual[item.id]
                      : isItemActive
                  ) && !effectiveCollapsed;

                  const handleItemClick = () => {
                    if (item.isBillingHierarchy) {
                      if (effectiveCollapsed) {
                        handleSelectNav('billing:4.1');
                      } else {
                        if (currentRoute !== 'billing' && !currentRoute.startsWith('billing:')) {
                          handleSelectNav('billing:4.1');
                          setExpandedSectionsManual(prev => ({ ...prev, billing: true }));
                        } else {
                          setExpandedSectionsManual(prev => ({ ...prev, billing: !isExpanded }));
                        }
                      }
                      return;
                    }

                    if (item.isAppointmentHierarchy) {
                      if (effectiveCollapsed) {
                        handleSelectNav('appointments:3.1');
                      } else {
                        if (currentRoute !== 'appointments' && !currentRoute.startsWith('appointments:')) {
                          handleSelectNav('appointments:3.1');
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: true }));
                          setExpandedAppointmentGroups(prev => ({ ...prev, '3': true }));
                        } else {
                          setExpandedSectionsManual(prev => ({ ...prev, appointments: !isExpanded }));
                        }
                      }
                      return;
                    }

                    if (hasSubItems) {
                      if (effectiveCollapsed) {
                        handleSelectNav(item.id);
                      } else {
                        setExpandedSectionsManual(prev => ({
                          ...prev,
                          [item.id]: !isExpanded
                        }));
                        if (!isItemActive) {
                          handleSelectNav(item.id);
                        }
                      }
                    } else {
                      handleSelectNav(item.id);
                    }
                  };

                  return (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        onClick={handleItemClick}
                        title={effectiveCollapsed ? item.label : undefined}
                        aria-label={item.label}
                        className={`nav-item ${isItemActive ? 'nav-item-active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                          width: '100%',
                          textAlign: 'left',
                          padding: effectiveCollapsed ? '8px 0' : '8px 10px',
                          minHeight: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isItemActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                          color: isItemActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                          fontWeight: isItemActive ? '600' : '500',
                          fontSize: 'var(--font-size-sm)',
                          border: '1px solid',
                          borderColor: isItemActive ? 'rgba(8, 127, 140, 0.2)' : 'transparent',
                          boxShadow: isItemActive && !effectiveCollapsed ? 'inset 3px 0 0 var(--color-primary-teal)' : 'none',
                          transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: 0,
                            flex: effectiveCollapsed ? 'none' : 1,
                            textAlign: 'left'
                          }}
                        >
                          <Icon
                            size={18}
                            color={isItemActive ? 'var(--color-primary-teal)' : 'currentColor'}
                            style={{ flexShrink: 0 }}
                          />
                          {!effectiveCollapsed && (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'left'
                              }}
                            >
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!effectiveCollapsed && item.badge && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              flexShrink: 0,
                              padding: '2px 7px',
                              fontSize: '0.68rem',
                              fontWeight: '600',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isItemActive ? 'var(--color-primary-teal)' : '#EEF2F2',
                              color: isItemActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                              lineHeight: 1.3
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {!effectiveCollapsed && hasSubItems && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              color: 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        )}

                        {effectiveCollapsed && item.badge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '12px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isItemActive ? 'var(--color-primary-teal)' : 'var(--color-aqua-accent)'
                            }}
                          />
                        )}
                      </button>

                      {/* Expandable Appointment Module Complete Hierarchy */}
                      {item.isAppointmentHierarchy && isExpanded && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            marginTop: '3px',
                            marginLeft: '10px',
                            paddingLeft: '8px',
                            borderLeft: '1.5px solid var(--color-border)',
                            maxHeight: '360px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--color-primary-teal, #0D9488) transparent'
                          }}
                        >
                          {MODULE_GROUPS.map((group) => {
                            const isGroupExpanded = Boolean(expandedAppointmentGroups[group.id]);
                            const groupSubmodules = SUBMODULES.filter(s => s.groupId === group.id);
                            const isGroupActive =
                              currentRoute === `appointments:group:${group.id}` ||
                              (typeof currentRoute === 'string' &&
                                (currentRoute.startsWith(`appointments:${group.id}.`) ||
                                 currentRoute.startsWith(`appointments:submodule:${group.id}.`)));

                            return (
                              <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Group Header Row */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '5px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: isGroupActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                    color: isGroupActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                    fontSize: '0.76rem',
                                    fontWeight: isGroupActive ? '600' : '500',
                                    transition: 'all 0.12s ease'
                                  }}
                                  className="group-tree-row"
                                >
                                  {/* Click group title -> Level 2 Group Dashboard */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectNav(`appointments:group:${group.id}`);
                                      setExpandedAppointmentGroups(prev => ({ ...prev, [group.id]: true }));
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      textAlign: 'left',
                                      color: 'inherit',
                                      fontWeight: 'inherit',
                                      fontSize: 'inherit',
                                      cursor: 'pointer',
                                      flex: 1,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                    title={group.label}
                                  >
                                    {group.label}
                                  </button>

                                  {/* Toggle Group Chevron */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedAppointmentGroups(prev => ({
                                        ...prev,
                                        [group.id]: !isGroupExpanded
                                      }));
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: '2px',
                                      color: 'var(--color-text-muted)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      flexShrink: 0
                                    }}
                                    title={isGroupExpanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
                                    aria-label={isGroupExpanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
                                  >
                                    {isGroupExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                  </button>
                                </div>

                                {/* Nested Sub-modules (Simple non-numerical bullet points) */}
                                {isGroupExpanded && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '1px',
                                      marginLeft: '8px',
                                      paddingLeft: '8px',
                                      borderLeft: '1px solid var(--color-border-subtle)',
                                      marginTop: '2px',
                                      marginBottom: '4px'
                                    }}
                                  >
                                    {groupSubmodules.map((sub) => {
                                      const isSubActive =
                                        currentRoute === `appointments:${sub.id}` ||
                                        currentRoute === `appointments:submodule:${sub.id}`;

                                      return (
                                        <button
                                          type="button"
                                          key={sub.id}
                                          onClick={() => handleSelectNav(`appointments:${sub.id}`)}
                                          className={`nav-subitem ${isSubActive ? 'nav-subitem-active' : ''}`}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '4px 6px',
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                            color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                            fontWeight: isSubActive ? '600' : '400',
                                            fontSize: '0.73rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.12s ease'
                                          }}
                                          title={sub.title}
                                        >
                                          {/* Simple non-numerical bullet point */}
                                          <span
                                            style={{
                                              width: '4px',
                                              height: '4px',
                                              borderRadius: '50%',
                                              backgroundColor: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                                              flexShrink: 0
                                            }}
                                          />
                                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {sub.title}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Expandable Billing Module Complete Hierarchy */}
                      {item.isBillingHierarchy && isExpanded && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            marginTop: '3px',
                            marginLeft: '10px',
                            paddingLeft: '8px',
                            borderLeft: '1.5px solid var(--color-border)',
                            maxHeight: '360px',
                            overflowY: 'auto',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'var(--color-primary-teal, #0D9488) transparent'
                          }}
                        >
                          {BILLING_GROUPS.map((group) => {
                            const isGroupExpanded = Boolean(expandedBillingGroups[group.id]);
                            const groupSubmodules = group.submodules;
                            const isGroupActive =
                              typeof currentRoute === 'string' &&
                              (currentRoute === `billing:group:${group.id}` ||
                               groupSubmodules.some(s => currentRoute === `billing:${s.id}`));

                            return (
                              <div key={group.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Group Header Row */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '5px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: isGroupActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                    color: isGroupActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                    fontSize: '0.76rem',
                                    fontWeight: isGroupActive ? '600' : '500',
                                    transition: 'all 0.12s ease'
                                  }}
                                  className="group-tree-row"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSelectNav(`billing:${group.submodules[0].id}`);
                                      setExpandedBillingGroups(prev => ({ ...prev, [group.id]: true }));
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      textAlign: 'left',
                                      color: 'inherit',
                                      fontWeight: 'inherit',
                                      fontSize: 'inherit',
                                      cursor: 'pointer',
                                      flex: 1,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}
                                    title={group.title}
                                  >
                                    {group.shortTitle || group.title}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedBillingGroups(prev => ({
                                        ...prev,
                                        [group.id]: !isGroupExpanded
                                      }));
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: '2px',
                                      color: 'var(--color-text-muted)',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      flexShrink: 0
                                    }}
                                    title={isGroupExpanded ? `Collapse ${group.title}` : `Expand ${group.title}`}
                                  >
                                    {isGroupExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                  </button>
                                </div>

                                {/* Submodules */}
                                {isGroupExpanded && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '1px',
                                      marginLeft: '8px',
                                      paddingLeft: '8px',
                                      borderLeft: '1px solid var(--color-border-subtle)',
                                      marginTop: '2px',
                                      marginBottom: '4px'
                                    }}
                                  >
                                    {groupSubmodules.map((sub) => {
                                      const isSubActive =
                                        currentRoute === `billing:${sub.id}` ||
                                        (currentRoute === 'billing' && sub.id === '4.1');

                                      return (
                                        <button
                                          type="button"
                                          key={sub.id}
                                          onClick={() => handleSelectNav(`billing:${sub.id}`)}
                                          className={`nav-subitem ${isSubActive ? 'nav-subitem-active' : ''}`}
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '4px 6px',
                                            borderRadius: 'var(--radius-sm)',
                                            backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                            color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                            fontWeight: isSubActive ? '600' : '400',
                                            fontSize: '0.73rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.12s ease'
                                          }}
                                          title={sub.title}
                                        >
                                          <span
                                            style={{
                                              width: '4px',
                                              height: '4px',
                                              borderRadius: '50%',
                                              backgroundColor: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                                              flexShrink: 0
                                            }}
                                          />
                                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {sub.title}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Expandable Sub-Navigation for other modules (e.g. Clinical) */}
                      {!item.isAppointmentHierarchy && !item.isBillingHierarchy && hasSubItems && isExpanded && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            marginTop: '2px',
                            marginLeft: '12px',
                            paddingLeft: '14px',
                            borderLeft: '1.5px solid var(--color-border)',
                            maxHeight: 'none'
                          }}
                        >
                          {item.subItems.map((sub) => {
                            const hasSubsub = Boolean(sub.subsubItems && sub.subsubItems.length > 0);
                            const isSubExpanded = Boolean(expandedSubmodules[sub.id]);

                            const isSubActive = (() => {
                              if (currentRoute === sub.id) return true;
                              if (typeof currentRoute === 'string' && currentRoute.startsWith(sub.id + ':')) return true;
                              if (sub.id === 'clinical:consultation' && currentRoute === 'clinical') return true;
                              if (sub.id === 'daycare:8.1' && currentRoute === 'daycare') return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('daycare:') && currentRoute === `submodule:${sub.id.replace('daycare:', '')}`) return true;
                              if (sub.id === 'dietary:9.1' && (currentRoute === 'dietary' || currentRoute === 'diet')) return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('dietary:') && currentRoute === `submodule:${sub.id.replace('dietary:', '')}`) return true;
                              if (sub.id === 'emr:12.1' && currentRoute === 'emr') return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('emr:') && currentRoute === `submodule:${sub.id.replace('emr:', '')}`) return true;
                              if (sub.id === 'bloodbank:donors' && currentRoute === 'bloodbank') return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('bloodbank:') && currentRoute === `submodule:${sub.id.replace('bloodbank:', '')}`) return true;
                              if (sub.id === 'credit-billing:7.1' && currentRoute === 'credit-billing') return true;
                              if (sub.id === 'embryology:10.1' && (currentRoute === 'embryology' || currentRoute === 'embryology:overview')) return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('embryology:') && (currentRoute === `submodule:${sub.id.replace('embryology:', '')}` || currentRoute === `appointments:${sub.id.replace('embryology:', '')}`)) return true;
                              if (sub.id === 'emergency:11.1' && (currentRoute === 'emergency' || currentRoute === 'emergency:overview')) return true;
                              if (typeof currentRoute === 'string' && sub.id.startsWith('emergency:') && (currentRoute === `submodule:${sub.id.replace('emergency:', '')}` || currentRoute === `appointments:${sub.id.replace('emergency:', '')}`)) return true;
                              if (typeof currentRoute === 'string') {
                                const parts = currentRoute.split(':');
                                const subParts = sub.id.split(':');
                                if (subParts.length >= 2 && parts[0] === subParts[0] && parts[1] === subParts[1]) return true;
                                if (parts[0] === 'submodule' && parts[1] && subParts[1] === parts[1]) return true;
                              }
                              return false;
                            })();

                            if (hasSubsub) {
                              return (
                                <div key={sub.id} style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '4px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                      color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                      fontSize: '0.78rem',
                                      fontWeight: isSubActive ? '600' : '500',
                                      transition: 'all 0.12s ease'
                                    }}
                                    className="group-tree-row"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectNav(sub.subsubItems[0]?.id || sub.id);
                                        setExpandedSubmodules({ [sub.id]: true });
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: 0,
                                        textAlign: 'left',
                                        color: 'inherit',
                                        fontWeight: 'inherit',
                                        fontSize: 'inherit',
                                        cursor: 'pointer',
                                        flex: 1,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                      title={sub.label}
                                    >
                                      {sub.label}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedSubmodules(prev => ({
                                          ...prev,
                                          [sub.id]: !isSubExpanded
                                        }));
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexShrink: 0
                                      }}
                                      title={isSubExpanded ? `Collapse ${sub.label}` : `Expand ${sub.label}`}
                                      aria-label={isSubExpanded ? `Collapse ${sub.label}` : `Expand ${sub.label}`}
                                    >
                                      {isSubExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                    </button>
                                  </div>

                                  {/* Level 3 items with circular bullets */}
                                  {isSubExpanded && (
                                    <div
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '1px',
                                        marginLeft: '8px',
                                        paddingLeft: '8px',
                                        borderLeft: '1px solid var(--color-border-subtle)',
                                        marginTop: '2px',
                                        marginBottom: '4px'
                                      }}
                                    >
                                      {sub.subsubItems.map((subsub) => {
                                        const isSubsubActive =
                                          currentRoute === subsub.id ||
                                          (typeof currentRoute === 'string' && (
                                            currentRoute.endsWith(`:${subsub.id.split(':').pop()}`) ||
                                            currentRoute === `submodule:${subsub.id.split(':').pop()}`
                                          ));

                                        return (
                                          <button
                                            type="button"
                                            key={subsub.id}
                                            onClick={() => handleSelectNav(subsub.id)}
                                            className={`nav-subitem ${isSubsubActive ? 'nav-subitem-active' : ''}`}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              width: '100%',
                                              textAlign: 'left',
                                              padding: '4px 6px',
                                              borderRadius: 'var(--radius-sm)',
                                              backgroundColor: isSubsubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                              color: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                              fontWeight: isSubsubActive ? '600' : '400',
                                              fontSize: '0.73rem',
                                              border: 'none',
                                              cursor: 'pointer',
                                              transition: 'all 0.12s ease'
                                            }}
                                            title={subsub.label}
                                          >
                                            <span
                                              style={{
                                                width: '4px',
                                                height: '4px',
                                                borderRadius: '50%',
                                                backgroundColor: isSubsubActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                                                flexShrink: 0
                                              }}
                                            />
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {subsub.label}
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <button
                                type="button"
                                key={sub.id}
                                onClick={() => handleSelectNav(sub.id)}
                                className={`nav-subitem ${isSubActive ? 'nav-subitem-active' : ''}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                  color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                  fontWeight: isSubActive ? '600' : '400',
                                  fontSize: '0.8rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span
                                  style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                                    flexShrink: 0
                                  }}
                                />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {sub.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div
          style={{
            padding: effectiveCollapsed ? '10px 8px' : '12px 14px',
            borderTop: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: effectiveCollapsed ? 'center' : 'space-between',
            flexShrink: 0
          }}
        >
          {isAuthenticated && user ? (
            !effectiveCollapsed ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-teal)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    {user.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {user.full_name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {user.role ? user.role.replace(/_/g, ' ') : 'Staff'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openLoginModal()}
                    style={{ color: 'var(--color-text-muted)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    title="Switch Staff Account"
                    aria-label="Switch Staff Account"
                  >
                    <User size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    style={{ color: 'var(--color-error)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title={`${user.full_name} (${user.role ? user.role.replace(/_/g, ' ') : 'Staff'}) • Click to switch user`}
                aria-label="User profile"
              >
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
              </button>
            )
          ) : (
            !effectiveCollapsed ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#E2E8F0',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Lock size={14} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      Not Signed In
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      Public Terminal
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogIn}
                  onClick={() => openLoginModal()}
                  style={{ width: '100%', padding: '6px 12px' }}
                >
                  Staff Login
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#E2E8F0',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Staff Login"
                aria-label="Staff Login"
              >
                <LogIn size={16} />
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <div
        style={{
          flex: 1,
          marginLeft: effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="main-container"
      >
        {/* Top Navigation Bar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-menu-trigger"
              style={{ display: 'none', padding: '8px', color: 'var(--color-text-primary)' }}
              title="Open menu"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Global Patient Search Input */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--color-bg-soft-cyan)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid var(--color-border)',
                  width: '340px',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <Search size={16} color="var(--color-text-muted)" />
                <input
                  type="text"
                  placeholder="Search modules, doctors, patients, UHID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    width: '100%',
                    fontSize: 'var(--font-size-xs)',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.8rem', padding: '0 2px' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {searchQuery.trim().length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    width: '420px',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-modal, 0 10px 25px rgba(0,0,0,0.15))',
                    border: '1px solid var(--color-border)',
                    zIndex: 150,
                    padding: '8px'
                  }}
                >
                  <div style={{ padding: '4px 8px 6px', fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Matching Modules & Submodules
                  </div>
                  {SUBMODULES.filter(s =>
                    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (s.subtitle && s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).slice(0, 8).map(sub => (
                    <button
                      type="button"
                      key={sub.id}
                      onClick={() => {
                        if (sub.id.startsWith('3.')) {
                          handleSelectNav(`appointments:${sub.id}`);
                        } else if (sub.id.startsWith('1.') || sub.id.startsWith('2.') || sub.id.startsWith('4.')) {
                          handleSelectNav(`billing:${sub.id}`);
                        } else if (sub.id.startsWith('10.')) {
                          handleSelectNav(`embryology:${sub.id}`);
                        } else if (sub.id.startsWith('11.')) {
                          handleSelectNav(`emergency:${sub.id}`);
                        } else {
                          handleSelectNav(`submodule:${sub.id}`);
                        }
                        setSearchQuery('');
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.1s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                          {sub.title}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--color-primary-teal)', fontWeight: '500' }}>
                          {sub.groupName}
                        </span>
                      </div>
                      {sub.subtitle && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {sub.subtitle}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Live Clinical Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                All Systems Operational
              </span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)'
              }}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-error)'
                }}
              />
            </button>

            {/* Demo Storage Mode Indicator & Reset Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  border: '1px solid rgba(8, 127, 140, 0.25)',
                  color: 'var(--color-primary-teal)',
                  fontSize: '0.72rem',
                  fontWeight: '600'
                }}
                title="Prototype running in isolated localStorage mode (v1 schema)"
              >
                <Database size={13} />
                <span>Demo v1</span>
              </div>

              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="desktop-collapse-btn"
                title="Reset demo data to clean seed state"
                aria-label="Reset Demo Data"
              >
                <RotateCcw size={13} />
                <span>Reset Demo</span>
              </button>
            </div>

            {/* Department Quick Switcher */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#F8FBFB',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                color: 'var(--color-text-primary)'
              }}
            >
              <span>Emergency & Clinical OP</span>
              <ChevronDown size={14} color="var(--color-text-muted)" />
            </div>

            {/* Staff Role Badge or Sign In Button */}
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(8, 127, 140, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  color: 'var(--color-primary-teal)',
                  cursor: 'pointer'
                }}
                title="Click to switch staff role"
              >
                <ShieldCheck size={14} />
                <span>{user.role ? user.role.replace(/_/g, ' ').toUpperCase() : 'STAFF'}</span>
              </button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={LogIn}
                onClick={() => openLoginModal()}
              >
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Storage Recovery Warning Banner */}
        {storageWarning && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              borderBottom: '1px solid #FDE68A',
              padding: '12px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              zIndex: 40
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D97706',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: '#92400E' }}>
                  {storageWarning.type === 'PERSISTENCE_FAILED'
                    ? 'Storage Write Warning: Persistence Paused'
                    : storageWarning.type === 'STORAGE_UNAVAILABLE'
                    ? 'Local Storage Unavailable: Memory-Only Mode'
                    : 'Storage Recovery Activated: Clean Demo State Loaded'}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: '#B45309', marginTop: '1px' }}>
                  {storageWarning.message}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {storageWarning.type === 'PERSISTENCE_FAILED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (typeof retryPersistence === 'function') {
                      retryPersistence();
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    backgroundColor: 'var(--color-primary-teal)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Retry Save
                </button>
              )}
              {quarantineData && quarantineData.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsQuarantineInspectModalOpen(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  color: '#92400E',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Inspect Quarantined Data
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsResetConfirmModalOpen(true)}
                style={{
                  padding: '6px 12px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  backgroundColor: '#D97706',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer'
                }}
              >
                Reset Demo Data
              </button>
              <button
                type="button"
                onClick={dismissStorageWarning}
                style={{
                  padding: '6px 8px',
                  color: '#B45309',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1
                }}
                title="Dismiss notice"
                aria-label="Dismiss notice"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Content Workspace */}
        <main style={{ flex: 1, padding: '32px', backgroundColor: 'var(--color-bg-main)' }}>
          {children}
        </main>
      </div>

      {/* Reset Demo Data Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmModalOpen}
        onClose={() => {
          setIsResetConfirmModalOpen(false);
          setResetFeedback(null);
        }}
        title="Reset Hospital Demo Data"
        subtitle="Restore clean seed dataset for prototype testing"
        maxWidth="540px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(8, 127, 140, 0.2)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.5
            }}
          >
            <strong>Scoped Demo Reset Policy:</strong>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              This operation strictly purges <code>medicsprime_hms_demo_v1</code> and <code>medicsprime_hms_demo_v1_quarantine</code> from your browser&apos;s localStorage. It resets all patients, appointment queue tokens, IPD admissions, billing ledgers, and lab data back to the clean factory demo state.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
              Your UI preferences (such as collapsed sidebar) and active staff session remain completely unaffected.
            </p>
          </div>

          {resetFeedback && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: resetFeedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${resetFeedback.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                borderRadius: 'var(--radius-md)',
                color: resetFeedback.type === 'success' ? '#065F46' : '#991B1B',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {resetFeedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{resetFeedback.message}</span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button
              variant="outline"
              onClick={() => {
                setIsResetConfirmModalOpen(false);
                setResetFeedback(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={RotateCcw}
              onClick={() => {
                const res = resetDemoData();
                if (res && res.success) {
                  setResetFeedback({
                    type: 'success',
                    message: 'Demo data successfully reset to clean factory seed!'
                  });
                  setTimeout(() => {
                    setResetFeedback(null);
                    setIsResetConfirmModalOpen(false);
                  }, 1000);
                } else {
                  setResetFeedback({
                    type: 'error',
                    message: `Reset failed: ${res?.error || 'Storage write failed'}. Demo data was not cleared.`
                  });
                }
              }}
              style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quarantined Data Inspector Modal */}
      <Modal
        isOpen={isQuarantineInspectModalOpen}
        onClose={() => setIsQuarantineInspectModalOpen(false)}
        title="Quarantined Storage Records"
        subtitle="Preserved corrupted or incompatible payloads (non-destructive recovery)"
        maxWidth="750px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            When corrupted JSON or incompatible schema versions are encountered, MedicsPrime safely moves the raw unparsed payload into quarantine storage (<code>medicsprime_hms_demo_v1_quarantine</code>) without overwriting or deleting it.
          </div>

          {quarantineData && quarantineData.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {quarantineData.map((item, idx) => (
                <div
                  key={item.incidentId || idx}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge variant="warning">{item.errorType || 'CORRUPT_PAYLOAD'}</Badge>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {item.incidentId}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  {item.parseError && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', marginBottom: '8px' }}>
                      <strong>Parse Error:</strong> {item.parseError}
                    </div>
                  )}

                  {item.versionFound !== undefined && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: '#92400E', marginBottom: '8px' }}>
                      <strong>Schema Version Detected:</strong> {item.versionFound} (Supported: v1)
                    </div>
                  )}

                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Preserved Raw Payload
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyRawPayload(item.incidentId, item.rawPayload)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'none',
                          border: 'none',
                          color: copyFeedback[item.incidentId]?.status === 'error' ? 'var(--color-error)' : 'var(--color-primary-teal)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        {copyFeedback[item.incidentId]?.status === 'success' ? (
                          <>
                            <Check size={12} /> Copied!
                          </>
                        ) : copyFeedback[item.incidentId]?.status === 'error' ? (
                          <>
                            <AlertTriangle size={12} /> {copyFeedback[item.incidentId].message}
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Raw Text
                          </>
                        )}
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '10px',
                        backgroundColor: '#1E293B',
                        color: '#F1F5F9',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem',
                        maxHeight: '140px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all'
                      }}
                    >
                      {item.rawPayload || '(empty)'}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              No active quarantine records found. Storage is healthy.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="outline" onClick={() => setIsQuarantineInspectModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .nav-item {
          outline: none;
        }
        .nav-item:hover {
          background-color: var(--color-bg-soft-cyan) !important;
          color: var(--color-text-primary) !important;
        }
        .nav-item-active:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
        }
        .nav-subitem {
          outline: none;
        }
        .nav-subitem:hover {
          background-color: var(--color-bg-soft-cyan) !important;
          color: var(--color-text-primary) !important;
        }
        .nav-subitem-active:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
        }
        .desktop-collapse-btn:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
          border-color: rgba(8, 127, 140, 0.3) !important;
        }
        @media (max-width: 900px) {
          .app-sidebar {
            transform: translateX(-100%) !important;
            width: 260px !important;
            box-shadow: var(--shadow-modal) !important;
          }
          .app-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .desktop-collapse-btn {
            display: none !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
          .mobile-menu-trigger {
            display: inline-flex !important;
          }
          .main-container {
            margin-left: 0 !important;
          }
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
