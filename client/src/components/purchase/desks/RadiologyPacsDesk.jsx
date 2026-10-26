import React, { useState } from 'react';
import {
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Check,
  Eye
} from 'lucide-react';
import { Card, Button, Badge } from '../../common/UIPrimitives';
import { INITIAL_RADIOLOGY_STUDIES } from '../../inventory/inventoryMockData';

export function RadiologyPacsDesk({ activeSubtab = '27.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [studies, setStudies] = useState(INITIAL_RADIOLOGY_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState(INITIAL_RADIOLOGY_STUDIES[0]);
  const [notification, setNotification] = useState('');

  // Viewer interactive tools state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [windowPreset, setWindowPreset] = useState('Chest / Soft Tissue');
  const [reportText, setReportText] = useState(
    'Lungs are clear with no focal consolidation, pneumothorax, or pleural effusion. Cardiothoracic ratio is normal. Mediastinal contours are unremarkable. Visualized osseous structures demonstrate no acute fracture.\n\nIMPRESSION:\nNormal Chest Radiograph. No active cardiopulmonary pathology.'
  );

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleAuthorizeReport = (studyId) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { ...s, status: 'Reported & Verified' } : s));
    showToast(`Radiology report for ${studyId} electronically signed & distributed to EMR!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#166534',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBMODULE 27.1: Modality Scheduling & MWL */}
      {activeSubtab === '27.1' && (
        <Card
          title="Modality Scheduling & DICOM MWL"
          subtitle="Modality Worklist (MWL) integration, RIS scheduling, patient arrival check-in, and examination queue"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.80rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Scheduled Modality Queue:</span>
              <Badge variant="teal">{studies.length} Studies Scheduled</Badge>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
              PACS Node: <strong>AE_TITLE: SARJI_PACS_01</strong> (Port 104)
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Accession #</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Patient Details</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Modality</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Study Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Referring Doctor</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Series / Images</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.id}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ fontWeight: '700' }}>{s.patientName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>UHID: {s.uhid}</div>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={s.modality === 'MRI' ? 'purple' : s.modality === 'CT' ? 'teal' : 'gray'}>
                        {s.modality}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{s.studyDesc}</td>
                    <td style={{ padding: '8px 10px' }}>{s.referringDr}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{s.seriesCount} / {s.instanceCount}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={s.status.includes('Verified') ? 'success' : s.status.includes('Acquired') ? 'teal' : 'warning'}>
                        {s.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Button
                        size="xs"
                        variant="outline"
                        icon={Eye}
                        onClick={() => {
                          setSelectedStudy(s);
                          showToast(`Opened study ${s.id} in PACS Viewer.`);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.2: DICOM Image Acquisition & PACS Storage */}
      {activeSubtab === '27.2' && (
        <Card
          title="DICOM PACS Archive Storage Tiering"
          subtitle="Storage nodes, DICOM instance indexation, hot storage, near-line archive, and retention policies"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>PRIMARY ONLINE SSD STORAGE (HOT TIER)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: 'var(--color-primary-teal)' }}>1.84 TB / 4.0 TB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>High-speed NVMe for studies &lt; 90 days (100% active)</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>NEAR-LINE NAS PACS ARCHIVE (WARM TIER)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: '#166534' }}>14.2 TB / 32.0 TB</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>RAID-6 storage array for studies 91–730 days</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>COLD COMPLIANCE CLOUD BACKUP</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px', color: '#7C3AED' }}>98.6 TB Archived</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Immutable AES-256 cloud repository (7-year statutory retention)</div>
            </div>
          </div>

          <div style={{ padding: '12px 16px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-md)', fontSize: '0.78rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>PACS Storage Gateway Node (AE: SARJI_PACS) is online. All DICOM SOP Classes verified (CT, MR, CR, DX, US).</span>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.3: Browser-based DICOM PACS Viewer */}
      {activeSubtab === '27.3' && (
        <Card
          title="Browser-Based DICOM PACS Clinical Diagnostic Viewer"
          subtitle="Zero-footprint medical imaging viewer with windowing (WW/WL), zoom, invert, pan, and cross-sectional presets"
        >
          {/* Active study details bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)', fontSize: '0.86rem' }}>{selectedStudy.id}</span> •
              <span style={{ fontWeight: '700', marginLeft: '6px' }}>{selectedStudy.patientName}</span> ({selectedStudy.uhid})
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              {selectedStudy.modality} • {selectedStudy.studyDesc} • Instances: {selectedStudy.instanceCount}
            </div>
          </div>

          {/* Interactive Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#1E293B', borderRadius: 'var(--radius-md) var(--radius-md) 0 0', color: '#FFFFFF', flexWrap: 'wrap' }}>
            <Button size="xs" variant="ghost" icon={ZoomIn} onClick={() => setZoomLevel(prev => Math.min(prev + 20, 260))} style={{ color: '#F1F5F9' }}>
              Zoom In ({zoomLevel}%)
            </Button>
            <Button size="xs" variant="ghost" icon={ZoomOut} onClick={() => setZoomLevel(prev => Math.max(prev - 20, 60))} style={{ color: '#F1F5F9' }}>
              Zoom Out
            </Button>
            <Button size="xs" variant="ghost" icon={RotateCw} onClick={() => { setBrightness(100); setContrast(100); setZoomLevel(100); setIsInverted(false); }} style={{ color: '#F1F5F9' }}>
              Reset View
            </Button>
            <Button size="xs" variant="ghost" icon={Sliders} onClick={() => setIsInverted(!isInverted)} style={{ color: isInverted ? '#38BDF8' : '#F1F5F9' }}>
              {isInverted ? 'LUT: Inverted' : 'LUT: Standard'}
            </Button>

            <div style={{ height: '18px', width: '1px', backgroundColor: '#475569', margin: '0 4px' }} />

            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Window Preset:</span>
            {['Chest / Soft Tissue', 'Bone / Skeletal', 'Lung High Contrast', 'Brain Subdural'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setWindowPreset(preset)}
                style={{
                  background: windowPreset === preset ? '#0284C7' : '#334155',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '3px 8px',
                  fontSize: '0.70rem',
                  cursor: 'pointer'
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Canvas Viewing Area */}
          <div
            style={{
              backgroundColor: '#0F172A',
              height: '380px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0 0 var(--radius-md) var(--radius-md)'
            }}
          >
            {/* Medical Image Simulation */}
            <div
              style={{
                width: '320px',
                height: '320px',
                borderRadius: '8px',
                backgroundColor: isInverted ? '#E2E8F0' : '#1E293B',
                border: '2px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${zoomLevel / 100})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) ${isInverted ? 'invert(1)' : 'none'}`,
                transition: 'transform 0.15s ease, filter 0.15s ease'
              }}
            >
              <div style={{ color: '#64748B', fontSize: '0.80rem', fontWeight: '700' }}>
                DICOM SOP: {selectedStudy.modality}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.72rem', marginTop: '4px' }}>
                {selectedStudy.studyDesc}
              </div>
              <div style={{ marginTop: '16px', width: '140px', height: '140px', border: '1.5px dashed #475569', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#38BDF8', fontSize: '0.72rem' }}>Anatomical Slice #{Math.floor(selectedStudy.instanceCount / 2)}</span>
              </div>
            </div>

            {/* Viewport HUD Overlays */}
            <div style={{ position: 'absolute', top: '12px', left: '16px', color: '#38BDF8', fontSize: '0.72rem', fontFamily: 'monospace' }}>
              <div>{selectedStudy.patientName}</div>
              <div>UHID: {selectedStudy.uhid}</div>
              <div>STUDY: {selectedStudy.id}</div>
            </div>

            <div style={{ position: 'absolute', top: '12px', right: '16px', color: '#94A3B8', fontSize: '0.72rem', fontFamily: 'monospace', textAlign: 'right' }}>
              <div>PRESET: {windowPreset}</div>
              <div>WW: 400 WL: 40</div>
              <div>ZOOM: {zoomLevel}%</div>
            </div>

            <div style={{ position: 'absolute', bottom: '12px', left: '16px', color: '#64748B', fontSize: '0.70rem', fontFamily: 'monospace' }}>
              SARJI MEDICAL IMAGING PACS V3 • LOSSLESS DICOM DECOMPRESSION
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.4: Radiology Report Authoring */}
      {activeSubtab === '27.4' && (
        <Card
          title="Radiology Report Authoring & Structured Reporting"
          subtitle="Radiologist diagnostic reporting workspace, voice dictation templates, findings, and formal impressions"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontWeight: '800', color: 'var(--color-primary-teal)' }}>{selectedStudy.id}</span>: {selectedStudy.patientName} ({selectedStudy.modality} - {selectedStudy.studyDesc})
              </div>
              <Badge variant="teal">Reporting in Progress</Badge>
            </div>

            <div>
              <label style={{ fontSize: '0.80rem', fontWeight: '700', marginBottom: '6px', display: 'block' }}>
                Radiological Findings & Impression:
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                rows={9}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.84rem',
                  fontFamily: 'monospace',
                  lineHeight: '1.5',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={() => showToast('Report draft saved locally.')}>
                Save Draft
              </Button>
              <Button variant="primary" icon={Check} onClick={() => handleAuthorizeReport(selectedStudy.id)}>
                Sign & Finalize Report
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.5: Report Verification & EMR Distribution */}
      {activeSubtab === '27.5' && (
        <Card
          title="Radiology Report Verification & EMR Distribution"
          subtitle="Electronic signature verification, HL7/FHIR diagnostic report sync to clinician EMR, and patient portal release"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1.5px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Study Accession</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Patient</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Modality & Exam</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700' }}>Reporting Radiologist</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>HL7 EMR Sync</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{s.id}</td>
                    <td style={{ padding: '8px 10px', fontWeight: '600' }}>{s.patientName}</td>
                    <td style={{ padding: '8px 10px' }}>{s.modality} - {s.studyDesc}</td>
                    <td style={{ padding: '8px 10px' }}>Dr. K. S. Mukherjee, MD (Radiodiagnosis)</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: '700' }}>✓ HL7 ORU-R01 Synced</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <Badge variant={s.status.includes('Verified') ? 'success' : 'teal'}>
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
