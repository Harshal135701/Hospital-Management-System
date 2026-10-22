import React, { useState } from 'react';
import {
  Activity,
  Egg,
  Dna,
  Microscope,
  Syringe,
  Snowflake,
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Eye,
  UserCheck
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../common/UIPrimitives';

export function EmbryologyOverview({
  cycles = [],
  opus = [],
  fertilizations = [],
  embryos = [],
  transfers = [],
  cryoStraws = [],
  onNavigateSubmodule
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('cycles'); // 'cycles', 'transfers', 'embryos', 'cryo'

  // Metric Calculations
  const inProgressCycles = cycles.filter((c) => c.status === 'in_progress').length;
  const culturingEmbryos = embryos.filter((e) => e.status === 'viable').length;
  const scheduledTransfers = transfers.filter((t) => t.status === 'planned').length;
  const storedStraws = cryoStraws.filter((c) => c.disposition === 'stored').length;

  const totalOocytesRetrieved = opus.reduce((acc, curr) => acc + Number(curr.oocytes_retrieved || 0), 0);
  const totalMiiOocytes = opus.reduce((acc, curr) => acc + Number(curr.mii_count || 0), 0);
  const overallMaturityRate = totalOocytesRetrieved > 0 ? Math.round((totalMiiOocytes / totalOocytesRetrieved) * 100) : 0;

  const totalInseminated = fertilizations.reduce((acc, curr) => acc + Number(curr.oocytes_inseminated || 0), 0);
  const total2Pn = fertilizations.reduce((acc, curr) => acc + Number(curr.normal_2pn_count || 0), 0);
  const overallFertRate = totalInseminated > 0 ? Math.round((total2Pn / totalInseminated) * 100) : 0;

  // Filtered lists
  const filteredCycles = cycles.filter(
    (c) =>
      c.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patient_uhid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransfers = transfers.filter(
    (t) =>
      t.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cycle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.embryo_codes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmbryos = embryos.filter(
    (e) =>
      e.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.embryo_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.gardner_grade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStraws = cryoStraws.filter(
    (s) =>
      s.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.straw_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tank_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 5 Core Laboratory KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {/* KPI 1: Active Cycles */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Active ART Cycles
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{inProgressCycles}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>/ {cycles.length} total</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Ongoing clinical cycles</span>
        </div>

        {/* KPI 2: Oocyte Maturity */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Oocytes Retrieved
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Egg size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{totalOocytesRetrieved}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: '600' }}>{overallMaturityRate}% MII</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>{totalMiiOocytes} metaphase-II mature</span>
        </div>

        {/* KPI 3: Fertilization 2PN */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Fertilization (2PN)
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Dna size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{overallFertRate}%</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>({total2Pn}/{totalInseminated})</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Normal 2PN cleavages</span>
        </div>

        {/* KPI 4: Culturing Embryos */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              In-Culture Embryos
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Microscope size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{culturingEmbryos}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Viable</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Benchtop incubators active</span>
        </div>

        {/* KPI 5: Stored Cryo-Straws */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            boxShadow: 'var(--shadow-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Cryo Repository
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Snowflake size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>{storedStraws}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Straws</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>Vitrified in LN2 (-196°C)</span>
        </div>
      </div>

      {/* Clinical ART Cycle Workflow Pipeline */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>
              Clinical ART Laboratory Pipeline
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              Sequential laboratory phases from follicular aspiration to embryo disposition
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>
            WHO 6th Ed. & Gardner Blastocyst Standards
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          {/* Phase 1 */}
          <div
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.1')}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-bg-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Egg size={13} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>10.1 OPU Recording</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {opus.length} retrieval dishes logged. Follicular aspiration & gamete maturity breakdown.
            </p>
          </div>

          {/* Phase 2 */}
          <div
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.2')}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-bg-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Dna size={13} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>10.2 Fertilization</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {fertilizations.length} inseminations recorded. 16-18h pronuclear (2PN) verification.
            </p>
          </div>

          {/* Phase 3 */}
          <div
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.3')}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-bg-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Microscope size={13} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>10.3 Embryo Grading</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {embryos.length} embryos in culture. Cleavage symmetry & Gardner criteria.
            </p>
          </div>

          {/* Phase 4 */}
          <div
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.4')}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-bg-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Syringe size={13} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>10.4 Transfer (ET)</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {transfers.length} ET protocols. Ultrasound guidance & luteal support regimens.
            </p>
          </div>

          {/* Phase 5 */}
          <div
            onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.5')}
            style={{
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              backgroundColor: 'var(--color-bg-main)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-bg-pale-aqua)', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Snowflake size={13} />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>10.5 Cryostorage</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: 0 }}>
              {cryoStraws.length} vitrified straws. Tank matrix & 5-year consent tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Operational Registry Tables Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-subtle)',
          overflow: 'hidden'
        }}
      >
        {/* Table Tab Selector and Search Bar */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: '#FAFCFC'
          }}
        >
          {/* Sub-Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('cycles')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'cycles' ? '600' : '500',
                backgroundColor: activeTab === 'cycles' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'cycles' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                border: activeTab === 'cycles' ? '1px solid var(--color-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Active IVF Cycles ({cycles.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('transfers')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'transfers' ? '600' : '500',
                backgroundColor: activeTab === 'transfers' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'transfers' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                border: activeTab === 'transfers' ? '1px solid var(--color-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Scheduled Transfers ({transfers.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('embryos')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'embryos' ? '600' : '500',
                backgroundColor: activeTab === 'embryos' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'embryos' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                border: activeTab === 'embryos' ? '1px solid var(--color-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Embryos in Culture ({embryos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cryo')}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: activeTab === 'cryo' ? '600' : '500',
                backgroundColor: activeTab === 'cryo' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'cryo' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                border: activeTab === 'cryo' ? '1px solid var(--color-border)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Cryo Repository ({cryoStraws.length})
            </button>
          </div>

          {/* Table Search */}
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Filter current view..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tab 1: Cycles Table */}
        {activeTab === 'cycles' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 16px', fontWeight: '600' }}>Cycle ID & Type</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & UHID</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Protocol</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Start Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Attending Clinician</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCycles.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No IVF treatment cycles match the search query.
                    </td>
                  </tr>
                ) : (
                  filteredCycles.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color 0.1s' }}>
                      <td style={{ padding: '10px 16px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        <div>{c.cycle_number}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{c.cycle_type}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{c.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{c.patient_uhid}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {c.protocol || 'Antagonist Protocol'}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {c.start_date}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {c.clinician_name || 'Dr. Priya Nair'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '600',
                            backgroundColor: c.status === 'in_progress' ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                            color: c.status === 'in_progress' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                          }}
                        >
                          {c.status === 'in_progress' ? 'In Progress' : 'Completed'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.1')}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <Eye size={13} style={{ marginRight: '4px' }} />
                          View OPU
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Transfers Table */}
        {activeTab === 'transfers' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 16px', fontWeight: '600' }}>Patient & UHID</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Transfer Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Type</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Embryos</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Catheter</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Endometrium</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No embryo transfer protocols recorded.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        <div>{t.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{t.patient_uhid}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {new Date(t.transfer_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', color: t.transfer_type === 'fresh' ? 'var(--color-primary-teal)' : '#4388C7' }}>
                          {t.transfer_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {t.embryos_transferred_count} ({t.embryo_codes})
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {t.catheter_type}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {t.endometrium_thickness_mm} mm
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '600',
                            backgroundColor: t.status === 'completed' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                            color: t.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.4')}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <Eye size={13} style={{ marginRight: '4px' }} />
                          Desk
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Embryos Table */}
        {activeTab === 'embryos' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 16px', fontWeight: '600' }}>Embryo Code</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & Cycle</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Day Number</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Gardner Grade</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmbryos.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No embryos found.
                    </td>
                  </tr>
                ) : (
                  filteredEmbryos.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                        {e.embryo_code}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{e.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{e.cycle_number}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        Day {e.day_number}
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {e.gardner_grade || 'Grade 1'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '600',
                            backgroundColor: e.status === 'viable' ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                            color: e.status === 'viable' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                          }}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.3')}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <Eye size={13} style={{ marginRight: '4px' }} />
                          Grading
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Cryo Straws Table */}
        {activeTab === 'cryo' && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FCFC', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>
                  <th style={{ padding: '10px 16px', fontWeight: '600' }}>Straw #</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Patient & UHID</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Embryo Code</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>LN2 Tank & Canister</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Freeze Date</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Disposition</th>
                  <th style={{ padding: '10px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStraws.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No cryostorage records found.
                    </td>
                  </tr>
                ) : (
                  filteredStraws.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                        {s.straw_number}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{s.patient_name}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{s.patient_uhid}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {s.embryo_code}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>
                        {s.tank_id} &bull; {s.canister_id} &bull; {s.goblet_color}
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {s.freeze_date}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: '600',
                            backgroundColor: s.disposition === 'stored' ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                            color: s.disposition === 'stored' ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                          }}
                        >
                          {s.disposition}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigateSubmodule && onNavigateSubmodule('10.5')}
                          style={{ fontSize: '0.76rem', padding: '3px 8px' }}
                        >
                          <Eye size={13} style={{ marginRight: '4px' }} />
                          Cryo-Bank
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
