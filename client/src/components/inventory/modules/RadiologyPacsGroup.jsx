import React, { useState } from 'react';
import {
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Check
} from 'lucide-react';
import { Card, Button, Badge } from '../../common/UIPrimitives';
import { INITIAL_RADIOLOGY_STUDIES } from '../inventoryMockData';

export function RadiologyPacsGroup({ activeSubtab = '27.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [studies, setStudies] = useState(INITIAL_RADIOLOGY_STUDIES);
  const [selectedStudy, setSelectedStudy] = useState(INITIAL_RADIOLOGY_STUDIES[0]);
  const [notification, setNotification] = useState('');

  // Viewer interactive tools state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isInverted, setIsInverted] = useState(false);
  const [windowPreset, setWindowPreset] = useState('Chest / Soft Tissue');
  const [reportText, setReportText] = useState('Lungs are clear with no focal consolidation or pleural effusion. Cardiothoracic ratio is normal. Skeletal structures unremarkable. Impression: Normal Chest Radiograph.');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAuthorizeReport = (studyId) => {
    setStudies(prev => prev.map(s => s.id === studyId ? { ...s, status: 'Reported & Verified' } : s));
    showToast(`Radiology report for ${studyId} electronically signed & distributed to EMR!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 27.1: Modality Scheduling & MWL */}
      {activeSubtab === '27.1' && (
        <Card
          title="Modality Scheduling & DICOM Modality Worklist (MWL)"
          subtitle="CT, MRI, X-Ray, and Ultrasound appointment slots with automatic DICOM MWL query feed"
        >
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <tr>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Accession No</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>UHID</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Patient Name</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Modality</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Anatomical Region</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Study Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((st) => (
                  <tr key={st.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: '700', color: 'var(--color-primary-teal)' }}>{st.accessionNumber}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{st.uhid}</td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{st.patientName}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="teal">{st.modality}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: '600' }}>{st.bodyPart}</td>
                    <td style={{ padding: '10px 14px' }}>{st.studyDate}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant={st.status.includes('Verified') ? 'success' : 'warning'}>
                        {st.status}
                      </Badge>
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
          title="DICOM Image Acquisition & PACS Tiered Storage"
          subtitle="Hospital PACS server cluster, online cache status, lossless JPEG-2000 compression, and DICOM series metadata"
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#166534' }}>PACS ONLINE ARCHIVE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#15803D', marginTop: '4px' }}>12.8 TB / 20 TB</div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>Tier 1 NVMe Flash Storage • 100% Up-time</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(100,216,208,0.3)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary-teal)' }}>MODALITY DICOM LINKS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '4px' }}>4 Scanners Synced</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>MRI 1.5T, CT 128 Slice, DR X-Ray, USG-1</div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.3: Browser-Based DICOM PACS Viewer */}
      {activeSubtab === '27.3' && (
        <Card
          title="Browser-Based DICOM PACS Web Viewer (Zero-Footprint)"
          subtitle="Interactive diagnostic image viewport, series thumbnails, windowing presets, and cine controls"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', minHeight: '520px' }}>
            {/* Left Study List */}
            <div style={{ borderRight: '1px solid var(--color-border-subtle)', paddingRight: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                Active Patient Studies
              </div>
              {studies.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStudy(st)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${selectedStudy.id === st.id ? 'var(--color-primary-teal)' : 'var(--color-border-subtle)'}`,
                    backgroundColor: selectedStudy.id === st.id ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.82rem' }}>{st.patientName}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>{st.modality} — {st.bodyPart}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>{st.accessionNumber} • {st.dicomImagesCount} Images</div>
                </div>
              ))}
            </div>

            {/* Right Interactive DICOM Viewport */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#0B0F19', borderRadius: 'var(--radius-md)', overflow: 'hidden', color: '#FFFFFF' }}>
              {/* Viewer Toolbar */}
              <div style={{ padding: '8px 14px', backgroundColor: '#111827', borderBottom: '1px solid #1F2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Button size="sm" variant="ghost" style={{ color: '#E5E7EB', borderColor: '#374151' }} onClick={() => setZoomLevel(prev => Math.min(250, prev + 20))}>
                    <ZoomIn size={14} /> Zoom +
                  </Button>
                  <Button size="sm" variant="ghost" style={{ color: '#E5E7EB', borderColor: '#374151' }} onClick={() => setZoomLevel(prev => Math.max(50, prev - 20))}>
                    <ZoomOut size={14} /> Zoom -
                  </Button>
                  <Button size="sm" variant="ghost" style={{ color: '#E5E7EB', borderColor: '#374151' }} onClick={() => setIsInverted(!isInverted)}>
                    <Sliders size={14} /> Invert
                  </Button>
                  <Button size="sm" variant="ghost" style={{ color: '#E5E7EB', borderColor: '#374151' }} onClick={() => {
                    setZoomLevel(100);
                    setIsInverted(false);
                    setBrightness(100);
                  }}>
                    <RotateCw size={14} /> Reset
                  </Button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span>Window:</span>
                  <select
                    style={{ backgroundColor: '#1F2937', color: '#FFFFFF', border: '1px solid #374151', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem' }}
                    value={windowPreset}
                    onChange={(e) => setWindowPreset(e.target.value)}
                  >
                    <option>Chest / Soft Tissue</option>
                    <option>Bone Window (W: 2000, L: 450)</option>
                    <option>Lung Window (W: 1500, L: -600)</option>
                    <option>Brain Window (W: 80, L: 40)</option>
                  </select>
                </div>
              </div>

              {/* Viewport Center Area */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative' }}>
                {/* Patient DICOM Header Overlay */}
                <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: 'monospace', fontSize: '0.72rem', color: '#60A5FA', lineHeight: 1.4 }}>
                  <div>PATIENT: {selectedStudy.patientName}</div>
                  <div>UHID: {selectedStudy.uhid}</div>
                  <div>MODALITY: {selectedStudy.modality} ({selectedStudy.bodyPart})</div>
                  <div>ACC: {selectedStudy.accessionNumber}</div>
                </div>

                <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'monospace', fontSize: '0.72rem', color: '#60A5FA', textAlign: 'right', lineHeight: 1.4 }}>
                  <div>MEDICSPRIME PACS</div>
                  <div>ZOOM: {zoomLevel}%</div>
                  <div>PRESET: {windowPreset}</div>
                  <div>SERIES: 1 / 1 (Mock DICOM Demo)</div>
                </div>

                {/* Simulated Medical Image Canvas (Stylized SVG / Placeholder with realistic contrast) */}
                <div
                  style={{
                    width: '320px',
                    height: '320px',
                    border: '1px solid #1F2937',
                    borderRadius: '8px',
                    backgroundColor: isInverted ? '#E5E7EB' : '#000000',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `scale(${zoomLevel / 100})`,
                    transition: 'transform 0.1s ease',
                    boxShadow: '0 0 30px rgba(0,0,0,0.8)',
                    position: 'relative'
                  }}
                >
                  <svg width="240" height="240" viewBox="0 0 100 100" style={{ filter: isInverted ? 'invert(1)' : 'none', opacity: 0.85 }}>
                    {/* Stylized Thoracic / Ribcage / Spinal silhouette */}
                    <ellipse cx="50" cy="50" rx="36" ry="42" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
                    <line x1="50" y1="15" x2="50" y2="85" stroke="#FFFFFF" strokeWidth="3" opacity="0.6" />
                    {/* Ribs */}
                    <path d="M 50 30 Q 30 35 25 45" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    <path d="M 50 30 Q 70 35 75 45" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    <path d="M 50 42 Q 25 48 20 60" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    <path d="M 50 42 Q 75 48 80 60" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    <path d="M 50 55 Q 28 62 26 72" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    <path d="M 50 55 Q 72 62 74 72" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.5" />
                    {/* Cardiac Silhouette */}
                    <ellipse cx="56" cy="55" rx="14" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.4" />
                  </svg>
                  <div style={{ position: 'absolute', bottom: 10, fontSize: '0.65rem', color: isInverted ? '#000000' : '#9CA3AF' }}>
                    Interactive DICOM Viewport (Demo Canvas)
                  </div>
                </div>

                <div style={{ position: 'absolute', bottom: 16, left: 16, fontFamily: 'monospace', fontSize: '0.7rem', color: '#9CA3AF' }}>
                  TE: 12ms • TR: 450ms • Slice Thk: 1.0mm
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.4: Radiology Report Authoring */}
      {activeSubtab === '27.4' && (
        <Card
          title="Radiology Report Authoring & Structured Dictation"
          subtitle="Standard RadLex reporting templates, voice dictation, impressions, and preliminary draft logs"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
              Study: <strong>{selectedStudy.modality} — {selectedStudy.bodyPart}</strong> for <strong>{selectedStudy.patientName} ({selectedStudy.uhid})</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Radiologist Diagnostic Impression & Findings</label>
              <textarea
                style={{
                  width: '100%',
                  minHeight: '110px',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'inherit',
                  fontSize: '0.82rem'
                }}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button size="sm" variant="outline" onClick={() => showToast('Preliminary report draft saved.')}>
                Save Draft
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleAuthorizeReport(selectedStudy.id)}>
                Sign-off & Verify Report
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 27.5: Report Verification & EMR Distribution */}
      {activeSubtab === '27.5' && (
        <Card
          title="Radiology Report Verification & Clinician EMR Distribution"
          subtitle="Final radiologist signature authorization, PDF generation, and automated sync to Inpatient/OPD records"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {studies.map((st) => (
              <div key={st.id} style={{ padding: '14px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{st.patientName} — {st.modality} ({st.bodyPart})</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Acc: {st.accessionNumber} • Radiologist: {st.radiologist}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {st.status !== 'Reported & Verified' ? (
                    <Button size="sm" variant="primary" icon={Check} onClick={() => handleAuthorizeReport(st.id)}>
                      Verify & Release
                    </Button>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-success)', fontWeight: '700' }}>
                      ✓ Released to EMR
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
