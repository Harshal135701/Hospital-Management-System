import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Maximize2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Layers,
  Ruler,
  FlipHorizontal,
  Info,
  ShieldAlert,
  Move
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { DICOM_SLICES_DATABASE } from './radiologyMockData';

export function DicomViewerDesk({
  studies = [],
  selectedStudyId = null,
  onNavigateAuthoring
}) {
  // Active study state
  const [activeStudyId, setActiveStudyId] = useState(() => {
    if (selectedStudyId) return selectedStudyId;
    return studies[0]?.id || null;
  });

  const activeStudy = useMemo(() => {
    return studies.find(s => s.id === activeStudyId) || studies[0] || null;
  }, [studies, activeStudyId]);

  // Modality slices
  const modalityCode = activeStudy?.modality_id || 'XR';
  const slicesList = useMemo(() => {
    return DICOM_SLICES_DATABASE[modalityCode] || DICOM_SLICES_DATABASE['XR'];
  }, [modalityCode]);

  // Viewer controls state
  const [sliceIndex, setSliceIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [windowPreset, setWindowPreset] = useState('standard');
  const [isInverted, setIsInverted] = useState(false);
  const [activeTool, setActiveTool] = useState('window'); // 'window', 'zoom', 'pan', 'measure'
  const [measurement, setMeasurement] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // Sync sliceIndex when active study changes
  useEffect(() => {
    setSliceIndex(0);
    setMeasurement(null);
  }, [activeStudyId]);

  const currentSlice = slicesList[sliceIndex] || slicesList[0];

  // Window/Level preset calculations
  const windowValues = useMemo(() => {
    switch (windowPreset) {
      case 'bone':
        return { width: 1800, center: 400, label: 'Bone Window' };
      case 'lung':
        return { width: 1500, center: -600, label: 'Lung Window' };
      case 'brain':
        return { width: 80, center: 40, label: 'Brain Window' };
      case 'soft_tissue':
        return { width: 400, center: 40, label: 'Soft Tissue' };
      default:
        return { width: currentSlice.windowWidth, center: currentSlice.windowCenter, label: 'Standard Acquisition' };
    }
  }, [windowPreset, currentSlice]);

  const handlePrevSlice = () => {
    setSliceIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextSlice = () => {
    setSliceIndex(prev => Math.min(slicesList.length - 1, prev + 1));
  };

  const handleReset = () => {
    setZoomLevel(100);
    setWindowPreset('standard');
    setIsInverted(false);
    setMeasurement(null);
    setActiveTool('window');
  };

  // Measurement tool interaction on canvas area
  const handleCanvasMouseDown = (e) => {
    if (activeTool !== 'measure') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMeasurement({ startX: x, startY: y, endX: x, endY: y, distanceMm: 0 });
    setIsMeasuring(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isMeasuring || !measurement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - measurement.startX;
    const dy = y - measurement.startY;
    const pixels = Math.sqrt(dx * dx + dy * dy);
    // Estimated 0.35 mm per pixel calibration
    const mm = (pixels * 0.35).toFixed(1);
    setMeasurement(prev => ({ ...prev, endX: x, endY: y, distanceMm: mm }));
  };

  const handleCanvasMouseUp = () => {
    setIsMeasuring(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* Viewer Header & Study Selector Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#1e293b',
          borderRadius: 'var(--radius-md)',
          color: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Eye size={20} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              DICOM PACS Diagnostic Workstation
            </span>
          </div>

          {/* Study Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Active Study:</span>
            <select
              value={activeStudy?.id || ''}
              onChange={(e) => setActiveStudyId(e.target.value)}
              style={{
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 10px',
                fontSize: '0.78rem',
                fontWeight: '600'
              }}
            >
              {studies.map(s => (
                <option key={s.id} value={s.id}>
                  [{s.modality_id}] {s.accession_number} - {s.patient_name} ({s.study_description})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Report Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="teal" size="sm">
            {activeStudy?.modality_id || 'XR'} PACS Viewport
          </Badge>
          {onNavigateAuthoring && activeStudy && (
            <Button
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => onNavigateAuthoring(activeStudy)}
              style={{ color: '#38bdf8', borderColor: '#0284c7' }}
            >
              Author Findings Report
            </Button>
          )}
        </div>
      </div>

      {/* Honest PACS Notice Pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          color: '#92400e',
          padding: '6px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.74rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldAlert size={15} color="#d97706" />
          <span>
            <strong>Honest Service Telemetry:</strong> Live PACS streaming node (ORTHANC_PACS_SCP:104) is disconnected. Viewport is rendering diagnostic calibration preview slices.
          </span>
        </div>
        <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
          AE: HMS_RADIOLOGY_SCU (Port 11112)
        </span>
      </div>

      {/* Main Viewport Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          backgroundColor: '#090d16',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid #1e293b',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }}
      >
        {/* Top Interactive Tool Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            color: '#cbd5e1',
            fontSize: '0.75rem'
          }}
        >
          {/* Tool Modes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTool('window')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTool === 'window' ? '#334155' : 'transparent',
                color: activeTool === 'window' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Window / Level Adjustment Tool"
            >
              <Sun size={14} />
              <span>W/L</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('measure')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTool === 'measure' ? '#334155' : 'transparent',
                color: activeTool === 'measure' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Caliper Distance Measurement Tool"
            >
              <Ruler size={14} />
              <span>Caliper</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTool('pan')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: activeTool === 'pan' ? '#334155' : 'transparent',
                color: activeTool === 'pan' ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Pan / Move Viewport"
            >
              <Move size={14} />
              <span>Pan</span>
            </button>
          </div>

          {/* Window / Level Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Presets:</span>
            {['standard', 'bone', 'lung', 'brain', 'soft_tissue'].map(presetKey => (
              <button
                type="button"
                key={presetKey}
                onClick={() => setWindowPreset(presetKey)}
                style={{
                  padding: '3px 7px',
                  borderRadius: '3px',
                  border: '1px solid',
                  borderColor: windowPreset === presetKey ? '#38bdf8' : '#334155',
                  backgroundColor: windowPreset === presetKey ? '#1e293b' : 'transparent',
                  color: windowPreset === presetKey ? '#38bdf8' : '#94a3b8',
                  fontSize: '0.70rem',
                  cursor: 'pointer'
                }}
              >
                {presetKey.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {/* Zoom & Invert Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(250, prev + 20))}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '3px' }}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', minWidth: '38px', textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 20))}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '3px' }}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              onClick={() => setIsInverted(prev => !prev)}
              style={{
                background: 'none',
                border: '1px solid #334155',
                borderRadius: '3px',
                color: isInverted ? '#38bdf8' : '#cbd5e1',
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: '0.70rem'
              }}
              title="Invert Grayscale (Negative/Positive)"
            >
              Invert
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '3px' }}
              title="Reset View"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Viewport Canvas & HUD Display */}
        <div
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          style={{
            position: 'relative',
            height: '480px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: activeTool === 'measure' ? 'crosshair' : activeTool === 'pan' ? 'grab' : 'default',
            userSelect: 'none',
            overflow: 'hidden',
            backgroundColor: isInverted ? '#f1f5f9' : '#040711'
          }}
        >
          {/* DICOM HUD OVERLAY — 4 Corners according to DICOM Standard */}
          {/* Top-Left: Patient Info */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '14px',
              color: isInverted ? '#0f172a' : '#38bdf8',
              fontSize: '0.74rem',
              lineHeight: 1.35,
              textShadow: isInverted ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '0.80rem' }}>{activeStudy?.patient_name || 'ANONYMIZED'}</div>
            <div>UHID: {activeStudy?.patient_uhid || 'UHID-2026-0000'}</div>
            <div>DOB: {activeStudy?.patient_dob || '1984-06-15'} ({activeStudy?.patient_gender || 'F'})</div>
            <div>Ref: {activeStudy?.ordering_doctor_name || 'Dr. House'}</div>
          </div>

          {/* Top-Right: Study & Institution Info */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              color: isInverted ? '#0f172a' : '#cbd5e1',
              fontSize: '0.74rem',
              lineHeight: 1.35,
              textAlign: 'right',
              textShadow: isInverted ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              fontFamily: 'monospace'
            }}
          >
            <div style={{ fontWeight: '700' }}>Sarji Hospital Diagnostic Radiology</div>
            <div>Modality: {activeStudy?.modality_id} [{currentSlice.view}]</div>
            <div>Acc: {activeStudy?.accession_number}</div>
            <div>Date: {new Date(activeStudy?.scheduled_at || Date.now()).toLocaleDateString()}</div>
          </div>

          {/* Bottom-Left: Technical Slice & Windowing HUD */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '14px',
              color: isInverted ? '#0f172a' : '#94a3b8',
              fontSize: '0.72rem',
              lineHeight: 1.35,
              textShadow: isInverted ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              fontFamily: 'monospace'
            }}
          >
            <div>Zoom: {zoomLevel}%</div>
            <div>W: {windowValues.width} C: {windowValues.center} [{windowValues.label}]</div>
            <div>Slice: {sliceIndex + 1} / {slicesList.length}</div>
            <div>Thk: {currentSlice.thickness}</div>
          </div>

          {/* Bottom-Right: Equipment & Protocol */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '14px',
              color: isInverted ? '#0f172a' : '#94a3b8',
              fontSize: '0.72rem',
              lineHeight: 1.35,
              textAlign: 'right',
              textShadow: isInverted ? 'none' : '0 1px 2px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              fontFamily: 'monospace'
            }}
          >
            <div>AET: {activeStudy?.modality_id === 'CT' ? 'CT_SOMATOM_01' : activeStudy?.modality_id === 'MRI' ? 'MRI_MAGNETOM_01' : 'XR_RAD_01'}</div>
            <div>kVp: {currentSlice.kvp || 'N/A'} | mAs: {currentSlice.mas || 'N/A'}</div>
            <div>Lossless 16-bit Matrix</div>
          </div>

          {/* High-Resolution Anatomical Slice Simulation Canvas Artwork */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transition: 'transform 0.1s ease-out',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '360px',
              height: '360px',
              border: isInverted ? '2px solid #cbd5e1' : '1px dashed #334155',
              borderRadius: '6px',
              backgroundColor: isInverted ? '#e2e8f0' : '#0b1120',
              padding: '16px',
              position: 'relative'
            }}
          >
            {/* SVG Visual Representation of the Scan */}
            <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
              {/* Background Glow */}
              <defs>
                <radialGradient id="sliceGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={isInverted ? '#64748b' : '#334155'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={isInverted ? '#f1f5f9' : '#040711'} stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="300" height="300" fill="url(#sliceGlow)" />

              {/* Anatomical Contour based on Modality */}
              {modalityCode === 'XR' && (
                <g stroke={isInverted ? '#0f172a' : '#94a3b8'} strokeWidth="2" fill="none">
                  {/* Rib Cage */}
                  <ellipse cx="150" cy="150" rx="100" ry="120" strokeDasharray="6,4" opacity="0.6" />
                  {/* Clavicles */}
                  <path d="M 50 60 Q 150 90 250 60" strokeWidth="3" />
                  {/* Trachea */}
                  <line x1="150" y1="40" x2="150" y2="100" strokeWidth="4" />
                  {/* Bronchial Bifurcation */}
                  <path d="M 150 100 L 120 140 M 150 100 L 180 140" strokeWidth="2.5" />
                  {/* Lung Fields */}
                  <path d="M 80 80 Q 50 160 80 230 Q 130 240 140 180 Q 130 90 80 80" fill={isInverted ? '#cbd5e1' : '#1e293b'} opacity="0.4" />
                  <path d="M 220 80 Q 250 160 220 230 Q 170 240 160 180 Q 170 90 220 80" fill={isInverted ? '#cbd5e1' : '#1e293b'} opacity="0.4" />
                  {/* Cardiac Silhouette */}
                  <path d="M 140 150 Q 120 210 180 220 Q 200 180 160 140 Z" fill={isInverted ? '#475569' : '#475569'} opacity="0.5" />
                  {/* Diaphragm Cupolas */}
                  <path d="M 60 230 Q 110 210 150 240" strokeWidth="3" />
                  <path d="M 150 240 Q 190 215 240 235" strokeWidth="3" />
                </g>
              )}

              {modalityCode === 'CT' && (
                <g stroke={isInverted ? '#0f172a' : '#38bdf8'} strokeWidth="1.8" fill="none">
                  {/* Thorax Body Contour */}
                  <ellipse cx="150" cy="150" rx="120" ry="100" strokeWidth="3" opacity="0.8" />
                  {/* Spine Vertebra */}
                  <rect x="135" y="215" width="30" height="25" rx="4" fill={isInverted ? '#475569' : '#cbd5e1'} opacity="0.8" />
                  {/* Sternum Anterior */}
                  <rect x="140" y="55" width="20" height="8" rx="2" fill={isInverted ? '#475569' : '#cbd5e1'} opacity="0.8" />
                  {/* Right & Left Lungs Axial */}
                  <path d="M 70 90 Q 50 150 75 190 Q 130 190 120 120 Z" fill={isInverted ? '#94a3b8' : '#0f172a'} opacity="0.7" />
                  <path d="M 230 90 Q 250 150 225 190 Q 170 190 180 120 Z" fill={isInverted ? '#94a3b8' : '#0f172a'} opacity="0.7" />
                  {/* Mediastinal Great Vessels */}
                  <circle cx="150" cy="140" r="24" fill={isInverted ? '#64748b' : '#334155'} opacity="0.6" />
                  {/* Calibrated Slice Crosshairs */}
                  <line x1="150" y1="20" x2="150" y2="40" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="150" y1="260" x2="150" y2="280" strokeWidth="1" strokeDasharray="2,2" />
                </g>
              )}

              {modalityCode === 'MRI' && (
                <g stroke={isInverted ? '#0f172a' : '#c084fc'} strokeWidth="1.8" fill="none">
                  {/* Cranial Calvarium */}
                  <ellipse cx="150" cy="150" rx="100" ry="115" strokeWidth="3" opacity="0.9" />
                  {/* Interhemispheric Falx */}
                  <line x1="150" y1="40" x2="150" y2="260" strokeWidth="2" strokeDasharray="4,2" />
                  {/* Lateral Ventricles */}
                  <path d="M 142 110 Q 120 140 144 180 Q 148 140 142 110" fill={isInverted ? '#cbd5e1' : '#1e1b4b'} opacity="0.7" />
                  <path d="M 158 110 Q 180 140 156 180 Q 152 140 158 110" fill={isInverted ? '#cbd5e1' : '#1e1b4b'} opacity="0.7" />
                  {/* Sylvian Fissures */}
                  <path d="M 80 140 Q 120 155 140 150" />
                  <path d="M 220 140 Q 180 155 160 150" />
                </g>
              )}

              {(modalityCode === 'USG' || modalityCode === 'MAMMO') && (
                <g stroke={isInverted ? '#0f172a' : '#34d399'} strokeWidth="1.8" fill="none">
                  {/* Sector Transducer Arc */}
                  <path d="M 150 40 L 70 240 A 130 130 0 0 0 230 240 Z" fill={isInverted ? '#cbd5e1' : '#064e3b'} opacity="0.3" />
                  {/* Parenchymal Echogenic Texture */}
                  <circle cx="150" cy="160" r="35" strokeDasharray="4,4" />
                  <circle cx="160" cy="180" r="15" fill={isInverted ? '#475569' : '#022c22'} opacity="0.8" />
                </g>
              )}

              {/* Live Caliper Measurement Line Overlay */}
              {measurement && (
                <g>
                  <line
                    x1={measurement.startX}
                    y1={measurement.startY}
                    x2={measurement.endX}
                    y2={measurement.endY}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                  <circle cx={measurement.startX} cy={measurement.startY} r="3" fill="#f59e0b" />
                  <circle cx={measurement.endX} cy={measurement.endY} r="3" fill="#f59e0b" />
                  <text
                    x={(measurement.startX + measurement.endX) / 2 + 6}
                    y={(measurement.startY + measurement.endY) / 2 - 6}
                    fill="#fbbf24"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {measurement.distanceMm} mm
                  </text>
                </g>
              )}
            </svg>

            {/* In-Canvas Slice Caption */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                backgroundColor: 'rgba(0,0,0,0.65)',
                color: '#f8fafc',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                textAlign: 'center',
                maxWidth: '90%'
              }}
            >
              {currentSlice.description}
            </div>
          </div>
        </div>

        {/* Bottom Multi-Slice Scrubber Controller */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            backgroundColor: '#0f172a',
            borderTop: '1px solid #1e293b',
            color: '#cbd5e1',
            fontSize: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={sliceIndex === 0}
              onClick={handlePrevSlice}
              style={{
                background: 'none',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: sliceIndex === 0 ? '#475569' : '#f8fafc',
                cursor: sliceIndex === 0 ? 'not-allowed' : 'pointer',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>

            <span style={{ fontWeight: '600', color: '#38bdf8', minWidth: '70px', textAlign: 'center' }}>
              Slice {sliceIndex + 1} of {slicesList.length}
            </span>

            <button
              type="button"
              disabled={sliceIndex === slicesList.length - 1}
              onClick={handleNextSlice}
              style={{
                background: 'none',
                border: '1px solid #334155',
                borderRadius: '4px',
                color: sliceIndex === slicesList.length - 1 ? '#475569' : '#f8fafc',
                cursor: sliceIndex === slicesList.length - 1 ? 'not-allowed' : 'pointer',
                padding: '3px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Slider */}
          <div style={{ flex: 1, maxWidth: '400px', margin: '0 16px' }}>
            <input
              type="range"
              min="0"
              max={slicesList.length - 1}
              value={sliceIndex}
              onChange={(e) => setSliceIndex(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--color-primary-teal)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            {currentSlice.view}
          </div>
        </div>
      </div>
    </div>
  );
}
