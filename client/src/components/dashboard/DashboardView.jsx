import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Calendar,
  Bed,
  Siren,
  Clock,
  ChevronDown,
  ChevronRight,
  UserPlus,
  CalendarPlus,
  Receipt,
  FileText,
  Activity
} from 'lucide-react';
import { useHospitalState } from '../../context/HospitalStateContext';
import { useAuth } from '../../context/AuthContext';
import './DashboardView.css';

// Helper to construct smooth SVG cubic bezier path through points
function buildSmoothPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export const DashboardView = ({ onNavigate }) => {
  const { user } = useAuth();
  const hospitalContext = useHospitalState ? useHospitalState() : null;
  const state = hospitalContext?.state || {};

  // Live Date and Time
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [chartRange, setChartRange] = useState('7d');
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Format Date: "Thu, 30 Oct 2025"
  const formattedDate = useMemo(() => {
    try {
      return currentTime.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Thu, 30 Oct 2025';
    }
  }, [currentTime]);

  // Format Time: "09:42 AM"
  const formattedTime = useMemo(() => {
    try {
      return currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '09:42 AM';
    }
  }, [currentTime]);

  const userName = user?.name || user?.full_name || 'Harshal';

  // -------------------------------------------------------------------------
  // 1. KPI Summary Cards Data
  // -------------------------------------------------------------------------
  const patientCount = 248;
  const opdCount = 86;
  const ipdCount = 18;
  const emergencyCount = 7;

  const kpiCards = [
    {
      id: 'patients',
      label: 'Total Patients',
      value: patientCount,
      trend: '12%',
      isUp: true,
      icon: Users,
      bgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      route: 'patients'
    },
    {
      id: 'opd',
      label: 'OPD Appointments',
      value: opdCount,
      trend: '8%',
      isUp: true,
      icon: Calendar,
      bgColor: '#ECFDF5',
      iconColor: '#10B981',
      route: 'appointments'
    },
    {
      id: 'ipd',
      label: 'IPD Admissions',
      value: ipdCount,
      trend: '5%',
      isUp: true,
      icon: Bed,
      bgColor: '#F5F3FF',
      iconColor: '#8B5CF6',
      route: 'ipd'
    },
    {
      id: 'emergency',
      label: 'Emergency Visits',
      value: emergencyCount,
      trend: '22%',
      isUp: false,
      icon: Siren,
      bgColor: '#FFF1F2',
      iconColor: '#F43F5E',
      route: 'emergency'
    }
  ];

  // -------------------------------------------------------------------------
  // 2. Patient Overview Line Chart (7 Days)
  // -------------------------------------------------------------------------
  const chartDays = ['24 Oct', '25 Oct', '26 Oct', '27 Oct', '28 Oct', '29 Oct', '30 Oct'];
  const opdTrend = [92, 104, 118, 122, 154, 142, 172];
  const ipdTrend = [52, 58, 52, 65, 72, 68, 70];
  const emergencyTrend = [15, 22, 18, 24, 24, 28, 26];

  // SVG Chart coordinate mappings:
  // ViewBox: 0 0 540 190
  const chartWidth = 540;
  const chartHeight = 190;
  const chartLeft = 40;
  const chartRight = 515;
  const chartTop = 15;
  const chartBottom = 155;
  const yMax = 200;

  const mapY = (val) => chartBottom - (val / yMax) * (chartBottom - chartTop);
  const mapX = (idx) => chartLeft + (idx / (chartDays.length - 1)) * (chartRight - chartLeft);

  const opdPoints = opdTrend.map((v, i) => ({ x: mapX(i), y: mapY(v), value: v }));
  const ipdPoints = ipdTrend.map((v, i) => ({ x: mapX(i), y: mapY(v), value: v }));
  const emergencyPoints = emergencyTrend.map((v, i) => ({ x: mapX(i), y: mapY(v), value: v }));

  const opdPath = buildSmoothPath(opdPoints);
  const ipdPath = buildSmoothPath(ipdPoints);
  const emergencyPath = buildSmoothPath(emergencyPoints);

  // -------------------------------------------------------------------------
  // 3. Department-wise Patients Donut Chart Data
  // -------------------------------------------------------------------------
  const departments = [
    { name: 'General Medicine', count: 68, pct: 27, color: '#2563EB' },
    { name: 'Orthopedics', count: 52, pct: 21, color: '#10B981' },
    { name: 'Pediatrics', count: 38, pct: 15, color: '#F59E0B' },
    { name: 'Gynecology', count: 32, pct: 13, color: '#EC4899' },
    { name: 'Cardiology', count: 24, pct: 10, color: '#06B6D4' },
    { name: 'Others', count: 34, pct: 14, color: '#6366F1' }
  ];

  // SVG Donut geometry:
  // Center: 70, 70 | Radius: 50 | Stroke: 18
  const donutR = 50;
  const donutCirc = 2 * Math.PI * donutR; // ~314.159
  let currentDonutOffset = 0;
  const donutSegments = departments.map((dept) => {
    const strokeDash = (dept.pct / 100) * donutCirc;
    const strokeDasharray = `${strokeDash} ${donutCirc - strokeDash}`;
    const offset = currentDonutOffset;
    currentDonutOffset -= strokeDash;
    return {
      ...dept,
      strokeDasharray,
      offset
    };
  });

  // -------------------------------------------------------------------------
  // 4. Today's Appointments Panel (Right Column Top)
  // -------------------------------------------------------------------------
  const appointmentsList = [
    {
      id: 'apt-1',
      time: '09:30 AM',
      patientName: 'Riya Sharma',
      doctorName: 'Dr. Neha Patel',
      department: 'General Medicine',
      status: 'Checked In',
      badgeClass: 'mp-badge-checked-in'
    },
    {
      id: 'apt-2',
      time: '10:00 AM',
      patientName: 'Amit Kumar',
      doctorName: 'Dr. S. Deshmukh',
      department: 'Orthopedics',
      status: 'Upcoming',
      badgeClass: 'mp-badge-upcoming'
    },
    {
      id: 'apt-3',
      time: '10:30 AM',
      patientName: 'Pooja Singh',
      doctorName: 'Dr. Meera Iyer',
      department: 'Gynecology',
      status: 'Upcoming',
      badgeClass: 'mp-badge-upcoming'
    },
    {
      id: 'apt-4',
      time: '11:00 AM',
      patientName: 'Sameer Khan',
      doctorName: 'Dr. Rajesh Nair',
      department: 'Pediatrics',
      status: 'Upcoming',
      badgeClass: 'mp-badge-upcoming'
    },
    {
      id: 'apt-5',
      time: '11:30 AM',
      patientName: 'Anjali Verma',
      doctorName: 'Dr. Kavita Sharma',
      department: 'Cardiology',
      status: 'Upcoming',
      badgeClass: 'mp-badge-upcoming'
    }
  ];

  // -------------------------------------------------------------------------
  // 5. Four Quick Action Cards
  // -------------------------------------------------------------------------
  const quickActions = [
    {
      id: 'new-patient',
      title: 'New Patient',
      subtitle: 'Register a new patient',
      icon: UserPlus,
      bgColor: '#EFF6FF',
      iconColor: '#2563EB',
      route: 'patients'
    },
    {
      id: 'book-appointment',
      title: 'Book Appointment',
      subtitle: 'Schedule OPD appointment',
      icon: CalendarPlus,
      bgColor: '#ECFDF5',
      iconColor: '#10B981',
      route: 'appointments'
    },
    {
      id: 'admit-patient',
      title: 'Admit Patient',
      subtitle: 'Create IPD admission',
      icon: Bed,
      bgColor: '#F5F3FF',
      iconColor: '#8B5CF6',
      route: 'ipd'
    },
    {
      id: 'generate-bill',
      title: 'Generate Bill',
      subtitle: 'Create patient bill',
      icon: Receipt,
      bgColor: '#F0F9FF',
      iconColor: '#0284C7',
      route: 'billing'
    }
  ];

  // -------------------------------------------------------------------------
  // 6. Recent Patients Table
  // -------------------------------------------------------------------------
  const recentPatients = [
    {
      uhid: 'D1-001234',
      patientName: 'Rohan Mehta',
      ageGender: '32 / M',
      department: 'General Medicine',
      status: 'Admitted',
      badgeClass: 'mp-badge-admitted'
    },
    {
      uhid: 'D1-001233',
      patientName: 'Priya Desai',
      ageGender: '28 / F',
      department: 'Gynecology',
      status: 'OPD',
      badgeClass: 'mp-badge-opd'
    },
    {
      uhid: 'D1-001232',
      patientName: 'Suresh Patil',
      ageGender: '45 / M',
      department: 'Orthopedics',
      status: 'OPD',
      badgeClass: 'mp-badge-opd'
    },
    {
      uhid: 'D1-001231',
      patientName: 'Sneha Joshi',
      ageGender: '12 / F',
      department: 'Pediatrics',
      status: 'Admitted',
      badgeClass: 'mp-badge-admitted'
    },
    {
      uhid: 'D1-001230',
      patientName: 'Imran Shaikh',
      ageGender: '60 / M',
      department: 'Cardiology',
      status: 'OPD',
      badgeClass: 'mp-badge-opd'
    }
  ];

  // -------------------------------------------------------------------------
  // 7. Bed Occupancy Data
  // -------------------------------------------------------------------------
  const occupancyPct = 62;
  const occupiedBeds = 62;
  const availableBeds = 38;
  const totalBeds = 100;

  // Radial progress geometry:
  // Center: 46, 46 | Radius: 35 | Stroke: 8
  const occRadius = 35;
  const occCirc = 2 * Math.PI * occRadius; // ~219.91
  const occDashoffset = occCirc * (1 - occupancyPct / 100);

  const wardBreakdown = [
    { name: 'General Ward', occupied: 32, total: 50, color: '#10B981' },
    { name: 'ICU', occupied: 8, total: 12, color: '#2563EB' },
    { name: 'Private Room', occupied: 14, total: 20, color: '#06B6D4' },
    { name: 'Special Ward', occupied: 8, total: 18, color: '#F59E0B' }
  ];

  // -------------------------------------------------------------------------
  // 8. Activities Timeline (Right Column Bottom)
  // -------------------------------------------------------------------------
  const activities = [
    {
      id: 'act-1',
      title: 'New patient registered',
      detail: 'Riya Sharma (UHID: D1-001234)',
      time: '09:21 AM',
      icon: Users,
      bgColor: '#EFF6FF',
      iconColor: '#2563EB'
    },
    {
      id: 'act-2',
      title: 'Appointment checked in',
      detail: 'Amit Kumar (OPD)',
      time: '09:05 AM',
      icon: Calendar,
      bgColor: '#EFF6FF',
      iconColor: '#2563EB'
    },
    {
      id: 'act-3',
      title: 'Patient admitted',
      detail: 'Suresh Patil (IPD - Room 204)',
      time: '08:47 AM',
      icon: Bed,
      bgColor: '#ECFDF5',
      iconColor: '#10B981'
    },
    {
      id: 'act-4',
      title: 'Bill generated',
      detail: 'Neha Gupta (INV-000123)',
      time: '08:32 AM',
      icon: Receipt,
      bgColor: '#F5F3FF',
      iconColor: '#8B5CF6'
    },
    {
      id: 'act-5',
      title: 'Prescription updated',
      detail: 'Rohan Mehta',
      time: '08:15 AM',
      icon: Activity,
      bgColor: '#FFF1F2',
      iconColor: '#F43F5E'
    }
  ];

  // Handle navigation safely
  const handleNav = (route) => {
    if (typeof onNavigate === 'function') {
      onNavigate(route);
    }
  };

  return (
    <div className="mp-dashboard-container">
      
      {/* =====================================================================
          1. HEADER: Title, Greeting, Date & Live Time
          ===================================================================== */}
      <div className="mp-dashboard-header">
        <div>
          <h1 className="mp-dashboard-title">Dashboard</h1>
          <p className="mp-dashboard-subtitle">
            Welcome back, {userName}! Here's what's happening at your hospital today.
          </p>
        </div>

        <div className="mp-dashboard-datetime">
          <div className="mp-datetime-item">
            <Calendar size={16} color="#475569" />
            <span>{formattedDate}</span>
          </div>
          <div className="mp-datetime-item" style={{ cursor: 'pointer' }} title="Current Live Shift Time">
            <Clock size={16} color="#475569" />
            <span>{formattedTime}</span>
            <ChevronDown size={14} color="#64748B" />
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. ROW 1: Four Summary KPI Cards
          ===================================================================== */}
      <div className="mp-kpi-grid">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="mp-kpi-card"
              onClick={() => handleNav(kpi.route)}
              style={{ cursor: 'pointer' }}
              title={`View ${kpi.label}`}
            >
              <div className="mp-kpi-icon-tile" style={{ backgroundColor: kpi.bgColor }}>
                <Icon size={24} color={kpi.iconColor} />
              </div>
              <div className="mp-kpi-body">
                <span className="mp-kpi-label">{kpi.label}</span>
                <span className="mp-kpi-value">{kpi.value}</span>
                <div className="mp-kpi-trend">
                  <span className={kpi.isUp ? 'mp-trend-up' : 'mp-trend-down'}>
                    {kpi.isUp ? '↑' : '↓'} {kpi.trend}
                  </span>
                  <span className="mp-trend-subtext">vs. yesterday</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================================
          3. WORKSPACE: Multi-Column Layout (Main Left + Right 370px)
          ===================================================================== */}
      <div className="mp-workspace-grid">
        
        {/* ===================================================================
            MAIN COLUMN (LEFT)
            =================================================================== */}
        <div className="mp-main-column">
          
          {/* Row A: Patient Overview Line Chart + Department Donut Chart */}
          <div className="mp-row-charts">
            
            {/* CARD: Patient Overview */}
            <div className="mp-card">
              <div className="mp-card-header">
                <h2 className="mp-card-title">Patient Overview</h2>
                <select
                  className="mp-chart-filter-select"
                  value={chartRange}
                  onChange={(e) => setChartRange(e.target.value)}
                  aria-label="Filter patient overview range"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="14d">Last 14 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>

              {/* Chart Legend */}
              <div className="mp-chart-legend">
                <div className="mp-legend-dot-item">
                  <div className="mp-dot" style={{ backgroundColor: '#2563EB' }} />
                  <span>OPD</span>
                </div>
                <div className="mp-legend-dot-item">
                  <div className="mp-dot" style={{ backgroundColor: '#10B981' }} />
                  <span>IPD</span>
                </div>
                <div className="mp-legend-dot-item">
                  <div className="mp-dot" style={{ backgroundColor: '#EF4444' }} />
                  <span>Emergency</span>
                </div>
              </div>

              {/* SVG Line Chart */}
              <div style={{ position: 'relative', width: '100%', height: '190px' }}>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  {/* Horizontal Grid lines and Y-axis scale labels */}
                  {[200, 150, 100, 50, 0].map((val) => {
                    const y = mapY(val);
                    return (
                      <g key={val}>
                        <text
                          x={chartLeft - 10}
                          y={y + 4}
                          textAnchor="end"
                          fontSize="11"
                          fill="#94A3B8"
                          fontFamily="inherit"
                        >
                          {val}
                        </text>
                        <line
                          x1={chartLeft}
                          y1={y}
                          x2={chartRight}
                          y2={y}
                          stroke="#F1F5F9"
                          strokeWidth="1"
                        />
                      </g>
                    );
                  })}

                  {/* X-axis date labels */}
                  {chartDays.map((day, i) => {
                    const x = mapX(i);
                    return (
                      <text
                        key={day}
                        x={x}
                        y={chartBottom + 20}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#94A3B8"
                        fontFamily="inherit"
                      >
                        {day}
                      </text>
                    );
                  })}

                  {/* Smooth Spline Curves */}
                  {/* 1. OPD (Blue) */}
                  <path
                    d={opdPath}
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 2. IPD (Green) */}
                  <path
                    d={ipdPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 3. Emergency (Coral Red) */}
                  <path
                    d={emergencyPath}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Nodes */}
                  {chartDays.map((_, i) => {
                    const isHovered = hoveredPointIndex === i;
                    return (
                      <g
                        key={i}
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Hover vertical guide line */}
                        {isHovered && (
                          <line
                            x1={mapX(i)}
                            y1={chartTop}
                            x2={mapX(i)}
                            y2={chartBottom}
                            stroke="#CBD5E1"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                        )}
                        {/* Invisible hover hitbox */}
                        <rect
                          x={mapX(i) - 20}
                          y={chartTop}
                          width="40"
                          height={chartBottom - chartTop}
                          fill="transparent"
                        />
                        {/* OPD node */}
                        <circle
                          cx={opdPoints[i].x}
                          cy={opdPoints[i].y}
                          r={isHovered ? 5.5 : 3.5}
                          fill="#2563EB"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {/* IPD node */}
                        <circle
                          cx={ipdPoints[i].x}
                          cy={ipdPoints[i].y}
                          r={isHovered ? 5.5 : 3.5}
                          fill="#10B981"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        {/* Emergency node */}
                        <circle
                          cx={emergencyPoints[i].x}
                          cy={emergencyPoints[i].y}
                          r={isHovered ? 5.5 : 3.5}
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Interactive Tooltip */}
                {hoveredPointIndex !== null && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: `${(mapX(hoveredPointIndex) / chartWidth) * 100}%`,
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(15, 23, 42, 0.92)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{ fontWeight: '700', marginBottom: '2px', color: '#93C5FD' }}>
                      {chartDays[hoveredPointIndex]}
                    </div>
                    <div>OPD: <strong>{opdTrend[hoveredPointIndex]}</strong></div>
                    <div>IPD: <strong>{ipdTrend[hoveredPointIndex]}</strong></div>
                    <div>Emergency: <strong>{emergencyTrend[hoveredPointIndex]}</strong></div>
                  </div>
                )}
              </div>
            </div>

            {/* CARD: Department-wise Patients (Donut Chart) */}
            <div className="mp-card">
              <div className="mp-card-header">
                <h2 className="mp-card-title">Department-wise Patients</h2>
              </div>

              <div className="mp-donut-layout">
                {/* Donut Visual */}
                <div className="mp-donut-visual">
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <g transform="rotate(-90 70 70)">
                      {donutSegments.map((seg) => (
                        <circle
                          key={seg.name}
                          cx="70"
                          cy="70"
                          r={donutR}
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="20"
                          strokeDasharray={seg.strokeDasharray}
                          strokeDashoffset={seg.offset}
                          style={{ transition: 'stroke-width 0.2s ease' }}
                        />
                      ))}
                    </g>
                  </svg>
                  <div className="mp-donut-center-text">
                    <span className="mp-donut-center-val">{patientCount}</span>
                    <span className="mp-donut-center-lbl">Total Patients</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="mp-donut-legend-list">
                  {departments.map((dept) => (
                    <div key={dept.name} className="mp-donut-legend-row">
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <div className="mp-dot" style={{ backgroundColor: dept.color }} />
                        <span className="mp-donut-legend-name">{dept.name}</span>
                      </div>
                      <span className="mp-donut-legend-count">
                        {dept.count} <span style={{ color: '#94A3B8', fontWeight: '400' }}>({dept.pct}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Row B: 4 Quick Action Cards */}
          <div className="mp-quick-actions-grid">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.id}
                  className="mp-quick-action-card"
                  onClick={() => handleNav(action.route)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNav(action.route); }}
                  title={action.subtitle}
                >
                  <div className="mp-quick-action-icon" style={{ backgroundColor: action.bgColor }}>
                    <Icon size={18} color={action.iconColor} />
                  </div>
                  <div className="mp-quick-action-info">
                    <h3 className="mp-quick-action-title">{action.title}</h3>
                    <p className="mp-quick-action-sub">{action.subtitle}</p>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" style={{ flexShrink: 0 }} />
                </div>
              );
            })}
          </div>

          {/* Row C: Recent Patients Table + Bed Occupancy */}
          <div className="mp-row-bottom">
            
            {/* CARD: Recent Patients */}
            <div className="mp-card">
              <div className="mp-card-header">
                <h2 className="mp-card-title">Recent Patients</h2>
                <button
                  type="button"
                  className="mp-card-action"
                  onClick={() => handleNav('patients')}
                >
                  View All
                </button>
              </div>

              <div className="mp-table-wrapper">
                <table className="mp-table">
                  <thead>
                    <tr>
                      <th>UHID</th>
                      <th>Patient Name</th>
                      <th>Age / Gender</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'right' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPatients.map((pat) => (
                      <tr key={pat.uhid}>
                        <td className="mp-uhid">{pat.uhid}</td>
                        <td className="mp-patient-name">{pat.patientName}</td>
                        <td>{pat.ageGender}</td>
                        <td style={{ color: '#475569' }}>{pat.department}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`mp-badge ${pat.badgeClass}`}>
                            {pat.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD: Bed Occupancy */}
            <div className="mp-card">
              <div className="mp-card-header">
                <h2 className="mp-card-title">Bed Occupancy</h2>
                <button
                  type="button"
                  className="mp-card-action"
                  onClick={() => handleNav('ipd')}
                >
                  View All
                </button>
              </div>

              {/* Occupancy Top: Gauge + Totals */}
              <div className="mp-occupancy-top">
                <div className="mp-occupancy-gauge">
                  <svg width="92" height="92" viewBox="0 0 92 92">
                    {/* Background track */}
                    <circle
                      cx="46"
                      cy="46"
                      r={occRadius}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="8"
                    />
                    {/* Progress arc */}
                    <circle
                      cx="46"
                      cy="46"
                      r={occRadius}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="8"
                      strokeDasharray={occCirc}
                      strokeDashoffset={occDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 46 46)"
                    />
                  </svg>
                  <div className="mp-occupancy-center">
                    <span className="mp-occupancy-pct">{occupancyPct}%</span>
                    <span className="mp-occupancy-lbl">Occupied</span>
                  </div>
                </div>

                <div className="mp-occupancy-summary">
                  <div className="mp-occupancy-summary-row">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <div className="mp-dot" style={{ backgroundColor: '#2563EB' }} />
                      <span>Occupied Beds</span>
                    </div>
                    <strong>{occupiedBeds}</strong>
                  </div>

                  <div className="mp-occupancy-summary-row">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <div className="mp-dot" style={{ backgroundColor: '#10B981' }} />
                      <span>Available Beds</span>
                    </div>
                    <strong>{availableBeds}</strong>
                  </div>

                  <div className="mp-occupancy-summary-row" style={{ paddingTop: '4px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#0F172A', fontWeight: '600' }}>Total Beds</span>
                    <strong>{totalBeds}</strong>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mp-occupancy-divider" />

              {/* Ward Category Breakdown */}
              <div className="mp-ward-breakdown">
                {wardBreakdown.map((w) => (
                  <div key={w.name} className="mp-ward-row">
                    <div className="mp-ward-name-group">
                      <div className="mp-dot" style={{ backgroundColor: w.color }} />
                      <span>{w.name}</span>
                    </div>
                    <span className="mp-ward-stat">
                      {w.occupied} <span style={{ color: '#94A3B8', fontWeight: '400' }}>/ {w.total}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ===================================================================
            SIDE COLUMN (RIGHT 370px)
            =================================================================== */}
        <div className="mp-side-column">
          
          {/* CARD: Today's Appointments */}
          <div className="mp-card">
            <div className="mp-card-header">
              <h2 className="mp-card-title">Today's Appointments</h2>
              <button
                type="button"
                className="mp-card-action"
                onClick={() => handleNav('appointments')}
              >
                View All
              </button>
            </div>

            <div className="mp-appointments-list">
              {appointmentsList.map((apt) => (
                <div key={apt.id} className="mp-appointment-row">
                  <span className="mp-appointment-time">{apt.time}</span>
                  <div className="mp-appointment-info">
                    <span className="mp-appointment-patient">{apt.patientName}</span>
                    <span className="mp-appointment-doctor">{apt.doctorName}</span>
                    <span className="mp-appointment-dept">{apt.department}</span>
                  </div>
                  <span className={`mp-badge ${apt.badgeClass}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CARD: Activities */}
          <div className="mp-card">
            <div className="mp-card-header">
              <h2 className="mp-card-title">Activities</h2>
              <button
                type="button"
                className="mp-card-action"
                onClick={() => handleNav('appointments')}
              >
                View All
              </button>
            </div>

            <div className="mp-activities-list">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="mp-activity-item">
                    <div className="mp-activity-icon" style={{ backgroundColor: act.bgColor }}>
                      <Icon size={16} color={act.iconColor} />
                    </div>
                    <div className="mp-activity-content">
                      <h4 className="mp-activity-title">{act.title}</h4>
                      <p className="mp-activity-detail">{act.detail}</p>
                    </div>
                    <span className="mp-activity-time">{act.time}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
