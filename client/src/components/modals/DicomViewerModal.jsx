import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Sun, Contrast, RotateCw, RefreshCw, Ruler, Maximize2, Layers } from 'lucide-react';

export default function DicomViewerModal({ isOpen, onClose, study }) {
  if (!isOpen || !study) return null;

  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [sliceIndex, setSliceIndex] = useState(14);
  const [showMeasurements, setShowMeasurements] = useState(true);

  const resetFilters = () => {
    setZoom(1);
    setBrightness(100);
    setContrast(100);
    setInvert(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top PACS Bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
              DICOM 3.0 PACS VIEWER
            </span>
            <span className="font-semibold text-slate-200">{study.patient}</span>
            <span className="text-slate-400">({study.uhid})</span>
            <span className="text-slate-500">|</span>
            <span className="text-teal-400 font-medium">{study.modality}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-[11px]">Acc: {study.accession_no}</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            {/* Zoom */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
                className="p-1.5 hover:bg-slate-700 rounded text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Brightness / Window Center */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <input
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={e => setBrightness(Number(e.target.value))}
                className="w-16 accent-sky-500 h-1 bg-slate-700 rounded cursor-pointer"
                title="Window Level / Brightness"
              />
            </div>

            {/* Contrast / Window Width */}
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2.5 py-1 rounded-lg">
              <Contrast className="w-3.5 h-3.5 text-sky-400" />
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={e => setContrast(Number(e.target.value))}
                className="w-16 accent-sky-500 h-1 bg-slate-700 rounded cursor-pointer"
                title="Window Width / Contrast"
              />
            </div>

            {/* Invert */}
            <button
              onClick={() => setInvert(!invert)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${invert ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              Invert Gray
            </button>

            {/* Measurements */}
            <button
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg font-medium transition ${showMeasurements ? 'bg-teal-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>Caliper (mm)</span>
            </button>

            <button
              onClick={resetFilters}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title="Reset View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slices slider */}
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Slice {sliceIndex} / {study.images_count || 48}</span>
            <input
              type="range"
              min="1"
              max={study.images_count || 48}
              value={sliceIndex}
              onChange={e => setSliceIndex(Number(e.target.value))}
              className="w-24 accent-teal-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Diagnostic Canvas Area */}
        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
          {/* Diagnostic Metadata HUD Overlays */}
          <div className="absolute top-4 left-4 font-mono text-[11px] text-teal-400 space-y-0.5 pointer-events-none drop-shadow-md z-10">
            <div>PT: {study.patient.toUpperCase()}</div>
            <div>ID: {study.uhid}</div>
            <div>SERIES: 04 • CT THIN CORONAL</div>
            <div>KVp: 120 • mA: 350 • ST: 0.75mm</div>
          </div>

          <div className="absolute top-4 right-4 font-mono text-[11px] text-teal-400 text-right space-y-0.5 pointer-events-none drop-shadow-md z-10">
            <div>HOSP: AURA HEALTHCARE FLAGSHIP</div>
            <div>MOD: {study.modality}</div>
            <div>DATE: {study.study_date}</div>
            <div>WL: {brightness * 5} / WW: {contrast * 10}</div>
          </div>

          <div className="absolute bottom-4 left-4 font-mono text-[11px] text-amber-300/90 pointer-events-none drop-shadow-md z-10">
            <div>ZOOM: {Math.round(zoom * 100)}%</div>
            <div>FOV: 240 x 240 mm</div>
            <div>GRID: 512 x 512 MATRIX</div>
          </div>

          {/* Simulated High-Res Medical Imaging Render */}
          <div
            className="transition-transform duration-75 relative"
            style={{
              transform: `scale(${zoom})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(1)' : ''}`,
            }}
          >
            {/* High visual fidelity anatomical simulation */}
            <div className="w-96 h-96 sm:w-[440px] sm:h-[440px] bg-gradient-to-b from-slate-950 via-slate-900 to-black rounded-full border border-slate-800 flex items-center justify-center relative shadow-2xl">
              {/* Internal organ / bone radiographic pattern */}
              <div className="w-72 h-72 rounded-full border-4 border-slate-700/60 flex items-center justify-center relative">
                {/* Ribcage / Cardiac silhouette */}
                <div className="w-56 h-64 rounded-3xl border-2 border-slate-500/50 rotate-6 flex items-center justify-center relative">
                  <div className="w-36 h-44 bg-slate-700/30 rounded-2xl blur-xs" />
                  {/* Spine / Vertebra column */}
                  <div className="w-8 h-48 bg-slate-300/40 rounded-sm absolute flex flex-col justify-between py-2 items-center">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="w-6 h-2 bg-slate-100/70 rounded-xs" />
                    ))}
                  </div>

                  {/* Stenosis lesion indicator / crosshair */}
                  {showMeasurements && (
                    <div className="absolute top-14 left-8 text-rose-400 font-mono text-[10px] flex items-center space-x-1">
                      <div className="w-3 h-3 border border-rose-500 rounded-full animate-ping" />
                      <span className="bg-rose-950/80 px-1 border border-rose-800 text-rose-300">
                        LAD Stenosis ~65% (D: 2.4mm)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Caliper measurement line overlay */}
              {showMeasurements && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <line x1="160" y1="210" x2="280" y2="210" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="160" cy="210" r="3" fill="#10b981" />
                  <circle cx="280" cy="210" r="3" fill="#10b981" />
                  <text x="200" y="200" fill="#10b981" fontSize="11" fontFamily="monospace">
                    Dist: 34.8 mm
                  </text>
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Findings Panel */}
        <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center justify-between text-xs">
          <div className="flex-1 mr-4">
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">Radiologist Impressions:</span>
            <p className="text-slate-200 truncate">{study.findings}</p>
          </div>
          <div className="flex items-center space-x-3 text-right">
            <div>
              <p className="text-teal-400 font-semibold">{study.radiologist}</p>
              <p className="text-slate-500 text-[10px]">{study.status}</p>
            </div>
            <button
              onClick={() => alert(`Radiology Report for Accession ${study.accession_no} sent to EMR Timeline.`)}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg shadow"
            >
              Send To EMR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
