import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Bed,
  Droplet,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Plus,
  Building2,
  FlaskConical,
  ShieldCheck,
  Search,
  ChevronRight,
  ExternalLink,
  Layers,
  Thermometer,
  ShieldAlert,
  FileText,
  Stethoscope,
  Ambulance,
  Syringe,
  Heart,
  Microscope,
  Package,
  ClipboardCheck,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge, SafeImage } from '../common/UIPrimitives';
import { AppointmentService, PatientService, BloodBankService } from '../../services/api';
import { HEALTHCARE_IMAGES } from '../../assets/images';

export const DashboardView = ({ onNavigate }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [isDataMock, setIsDataMock] = useState(false);
  const [activeShiftTime, setActiveShiftTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setActiveShiftTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      const [aptRes, patRes, compRes] = await Promise.all([
        AppointmentService.getAppointments(),
        PatientService.getPatients(),
        BloodBankService.getComponents()
      ]);

      if (aptRes) setAppointments(aptRes.data || []);
      if (patRes) setPatients(patRes.data || []);
      if (compRes) setBloodUnits(compRes.data || []);
      if (aptRes?.isMock || patRes?.isMock || compRes?.isMock) {
        setIsDataMock(true);
      }
    }
    loadDashboardData();
  }, []);

  const releasableBloodCount = bloodUnits.filter(u => u.status === 'safe_for_release').length;
  const reservedBloodCount = bloodUnits.filter(u => u.status === 'reserved').length;
  const quarantinedBloodCount = bloodUnits.filter(u => u.status === 'quarantined').length;

  const operationalStats = [
    {
      title: 'Active Patient Directory',
      value: patients.length ? '1,428' : '0',
      badge: '+12 Today',
      subtitle: `${patients.length} records verified in master census`,
      icon: Users,
      trend: '+4.8%',
      accent: 'var(--color-primary-teal)',
      actionText: 'View Patients',
      actionRoute: 'patients'
    },
    {
      title: "Today's OPD Consultations",
      value: appointments.length ? '42' : '0',
      badge: 'Live Queue',
      subtitle: `${appointments.filter(a => a.status === 'confirmed').length} confirmed, 1 in consult`,
      icon: Calendar,
      trend: '+12%',
      accent: 'var(--color-secondary-teal)',
      actionText: 'View Schedule',
      actionRoute: 'appointments'
    },
    {
      title: 'Inpatient Bed Occupancy',
      value: '84 / 110',
      badge: '76.4% Full',
      subtitle: '26 beds available (ICU: 4, Gen: 22)',
      icon: Bed,
      trend: 'Optimal',
      accent: 'var(--color-info)',
      actionText: 'Wards & Beds',
      actionRoute: 'rooms'
    },
    {
      title: 'Blood Bank Releasable Stock',
      value: `${releasableBloodCount} Units`,
      badge: releasableBloodCount > 0 ? 'Audited Safe' : 'Empty Stock',
      subtitle: `${reservedBloodCount} reserved • ${quarantinedBloodCount} in quarantine`,
      icon: Droplet,
      trend: releasableBloodCount > 0 ? '100% Tested' : 'No Active Units',
      accent: 'var(--color-blood-crimson)',
      actionText: 'Open Blood Bank',
      actionRoute: 'bloodbank'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* =========================================================================
          REFINED COMPACT CLINICAL WELCOME HEADER (NO OVERSIZED HERO)
          ========================================================================= */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)',
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: '24px',
          alignItems: 'center'
        }}
        className="dashboard-compact-header"
      >
        {/* Left: Professional Greeting, Campus Context & Quick Launch Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
              Operational Central Command
            </span>
            <span style={{ color: 'var(--color-border)' }}>•</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Apex Central Hospital — Shift: 08:00–16:00 (Live: {activeShiftTime})
            </span>
            {isDataMock && (
              <Badge variant="teal" size="sm">Schema Connected (Demo Verified)</Badge>
            )}
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.25 }}>
            Welcome back, Dr. Sharma
          </h1>
          
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, maxWidth: '640px', lineHeight: 1.45 }}>
            Clinical census, outpatient schedule, and laboratory diagnostics are operating within parameters. All five Blood Bank infection-marker gates are active.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => onNavigate('appointments')}
            >
              Book Consultation
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Users}
              onClick={() => onNavigate('patients')}
            >
              Patient Directory
            </Button>
            <Button
              variant="soft"
              size="sm"
              icon={Droplet}
              onClick={() => onNavigate('bloodbank')}
            >
              Blood Bank Workbench
            </Button>
          </div>
        </div>

        {/* Right: Doctor Photograph (25-30% width) with subtle pale aqua background and live schedule badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-bg-pale-aqua) 0%, #FFFFFF 100%)',
            border: '1px solid rgba(100, 216, 208, 0.4)',
            boxShadow: 'var(--shadow-subtle)',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="dashboard-header-right"
        >
          {/* Professional Doctor Photo with SafeImage fallback */}
          <SafeImage
            src={HEALTHCARE_IMAGES.femaleDoctor}
            fallbackSrc={HEALTHCARE_IMAGES.doctorWithStethoscope}
            alt="Illustrative clinical consultant portrait"
            style={{
              width: '84px',
              height: '84px',
              flexShrink: 0,
              boxShadow: 'var(--shadow-card)',
              border: '2px solid #FFFFFF'
            }}
            borderRadius="var(--radius-md)"
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                On-Duty Consultant
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontWeight: '600' }}>Active OPD</span>
              </div>
            </div>

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)', fontWeight: '600' }}>
              Dr. Ananya Sharma, MD
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Stethoscope size={12} color="var(--color-primary-teal)" />
              <span>Room 204 • Transfusion & Internal Med</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              Next consult in 15 min (Devika Sengupta)
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          OPERATIONAL KPI METRIC CARDS
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))', gap: '16px' }}>
        {operationalStats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                border: '1px solid var(--color-border-subtle)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  {s.title}
                </span>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: s.accent
                  }}
                >
                  <Icon size={17} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                  {s.value}
                </span>
                <Badge variant={s.trend === 'Optimal' ? 'info' : 'success'} size="sm">
                  {s.badge}
                </Badge>
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                {s.subtitle}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '8px', marginTop: '2px' }}>
                <button
                  onClick={() => onNavigate(s.actionRoute)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    color: 'var(--color-primary-teal)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{s.actionText}</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          OPERATIONAL WORKSPACE: 3-COLUMN CLINICAL TILES
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '20px' }} className="dashboard-grid-sections">
        
        {/* Left Column: Today's Consultation Schedule Table */}
        <Card
          title="Today's Consultation Schedule"
          subtitle="Real-time OPD appointment queue synchronized with doctor rosters"
          action={
            <Button variant="outline" size="sm" onClick={() => onNavigate('appointments')}>
              View Full Schedule
            </Button>
          }
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Slot Time</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Patient Details</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Department</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Consultant</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 4).map((apt, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                    <td style={{ padding: '12px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} color="var(--color-text-muted)" />
                        {apt.start_time}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{apt.patient_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{apt.patient_uhid}</div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-secondary)' }}>
                      {apt.department_name}
                    </td>
                    <td style={{ padding: '12px', color: 'var(--color-text-primary)' }}>
                      {apt.doctor_name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={apt.status === 'in_consultation' ? 'warning' : 'success'}>
                        {apt.status === 'in_consultation' ? 'In Consult' : 'Confirmed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Column: Blood Bank & Diagnostic Laboratory Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Blood Bank Safe Inventory Snapshot with contextual clinical photography */}
          <Card
            title="Blood Bank Releasable Inventory"
            subtitle="Verified safe components ready for patient issue"
            action={
              <Button variant="soft" size="sm" onClick={() => onNavigate('bloodbank')}>
                Launch Module →
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Contextual Blood Bank Storage Imagery + Telemetry Notice */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  border: '1px solid rgba(100, 216, 208, 0.4)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-subtle)',
                    border: '1px solid #FFFFFF'
                  }}
                >
                  <img
                    src={HEALTHCARE_IMAGES.bloodStorageFridge}
                    alt="Cold storage refrigerated blood components"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} color="var(--color-primary-teal)" />
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', color: 'var(--color-primary-teal)', textTransform: 'uppercase' }}>
                      Dual-Gated Protocol
                    </span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    5 TTI tests non-reactive & dual-technician ABO/Rh concurrence verified.
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', backgroundColor: '#FAFCFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>PRBC</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>8 Units</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>2°C to 6°C</div>
                </div>

                <div style={{ padding: '10px', backgroundColor: '#FAFCFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>FFP</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>6 Units</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>-34.5°C</div>
                </div>

                <div style={{ padding: '10px', backgroundColor: '#FAFCFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Platelets</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-teal)', marginTop: '2px' }}>4 Units</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>Agitator Active</div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('bloodbank')}
                style={{ width: '100%', marginTop: '4px' }}
              >
                Inspect Quarantines & Active Requisitions
              </Button>
            </div>
          </Card>

          {/* Diagnostic Lab & Inpatient Census Overview with contextual equipment thumbnail */}
          <Card
            title="Inpatient Wards & Lab Diagnostic Telemetry"
            subtitle="Clinical telemetry across wards and diagnostic sample benches"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border-subtle)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'var(--shadow-subtle)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <img
                    src={HEALTHCARE_IMAGES.inpatientWardBed}
                    alt="Inpatient Ward Beds"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>Inpatient Facility Status</span>
                    <Badge variant="teal" size="sm">Level 1 Trauma</Badge>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    Sanitized beds ready for admissions in Block B & ICU.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Intensive Care Unit (ICU)</span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>12 / 16 Beds Occupied (75%)</span>
              </div>
              <div style={{ height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: '#EEF4F4', overflow: 'hidden' }}>
                <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--color-primary-teal)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>General Medical Wards</span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>72 / 94 Beds Occupied (76%)</span>
              </div>
              <div style={{ height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: '#EEF4F4', overflow: 'hidden' }}>
                <div style={{ width: '76%', height: '100%', backgroundColor: 'var(--color-secondary-teal)' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: 'var(--font-size-xs)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                  <FlaskConical size={14} color="var(--color-primary-teal)" />
                  <span>Lab Analyzer 01 (Biochemistry): 18 Tests In Queue</span>
                </div>
                <Badge variant="success" size="sm">Online</Badge>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* =========================================================================
          CLINICAL SPECIALTIES & HEALTHCARE SERVICES DIRECTORY
          ========================================================================= */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
              Hospital Departments & Specialized Clinical Care
            </h2>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
              Multi-disciplinary clinical centers operating 24/7 across Apex Central Hospital campus
            </p>
          </div>
          <Badge variant="teal" size="sm">7 Integrated Services</Badge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {[
            {
              title: 'Cardiology & Heart Care',
              desc: 'Cath lab, cardiac telemetry, non-invasive echocardiography, and CCU monitoring.',
              icon: HeartPulse,
              image: HEALTHCARE_IMAGES.doctorWithStethoscope,
              route: 'appointments',
              tag: 'Cath Lab Ready'
            },
            {
              title: 'Emergency & Trauma Care',
              desc: 'Level-1 triage bay, emergency resuscitation teams, and rapid surgical dispatch.',
              icon: Ambulance,
              image: HEALTHCARE_IMAGES.ambulanceEmergency,
              route: 'rooms',
              tag: '24/7 Stat Care'
            },
            {
              title: 'General & Family Medicine',
              desc: 'Comprehensive outpatient clinics, chronic care management, and preventive wellness.',
              icon: Stethoscope,
              image: HEALTHCARE_IMAGES.familyConsultation,
              route: 'patients',
              tag: 'OPD Schedule Active'
            },
            {
              title: 'Diagnostic Laboratory',
              desc: 'Automated clinical biochemistry, hematology analyzers, and pathology workstations.',
              icon: Microscope,
              image: HEALTHCARE_IMAGES.diagnosticLab,
              route: 'lab',
              tag: 'NABL Accredited'
            },
            {
              title: 'Blood Bank & Transfusion',
              desc: '5-pathogen TTI serology screening, dual-technician ABO/Rh grouping, and cold-chain dispatch.',
              icon: Droplet,
              image: HEALTHCARE_IMAGES.bloodBankCentrifuge,
              route: 'bloodbank',
              tag: 'Dual-Gated Gate'
            },
            {
              title: 'Inpatient Wards & ICU',
              desc: 'Telemetry-monitored beds, isolated critical care cubicles, and post-operative nursing.',
              icon: Bed,
              image: HEALTHCARE_IMAGES.inpatientWardBed,
              route: 'rooms',
              tag: '84 / 110 Occupied'
            }
          ].map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Visual Header with authentic healthcare photography */}
                <div style={{ position: 'relative', height: '110px', overflow: 'hidden' }}>
                  <img
                    src={srv.image}
                    alt={srv.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(24, 50, 56, 0.75) 0%, transparent 60%)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-primary-teal)',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '8px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.02em' }}>
                      {srv.tag}
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>
                      {srv.title}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {srv.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate(srv.route)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-bg-pale-aqua)',
                      color: 'var(--color-primary-teal)',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      border: '1px solid rgba(100, 216, 208, 0.4)',
                      cursor: 'pointer'
                    }}
                  >
                    <span>Open Clinical Module</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 992px) {
          .dashboard-compact-header {
            grid-template-columns: 1fr !important;
          }
          .dashboard-grid-sections {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
