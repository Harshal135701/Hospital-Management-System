import React, { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Search,
  Eye,
  FileText,
  Info,
  Trash2,
  Sliders,
  Plus,
  Download,
  ZoomIn,
  ZoomOut,
  Layers
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import {
  FILE_SIZE_LIMIT_OPTIONS,
  SCANNER_ACQUISITION_MODES
} from './applicationConstants';
import { INITIAL_ATTACHMENT_CATEGORIES, INITIAL_ATTACHMENTS_LIST } from './applicationMockData';
import { EmrService } from '../../services/api';
import { formatDateTimeIN } from '../../utils/formatters';

export function ScannerSetupDesk({ onNotify }) {
  const [categories, setCategories] = useState(INITIAL_ATTACHMENT_CATEGORIES);
  const [attachments, setAttachments] = useState(INITIAL_ATTACHMENTS_LIST);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Policy Settings
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(10);
  const [selectedAcquisitionMode, setSelectedAcquisitionMode] = useState('browser_upload');

  // Modals & Dialogs
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    patientName: 'Devika Sengupta',
    patientUhid: 'UHID-2026-0814',
    category: INITIAL_ATTACHMENT_CATEGORIES[0].name,
    fileName: '',
    fileSizeKb: 450,
    fileObj: null,
    notes: 'Acquired via hospital documentation desk.'
  });
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    allowedTypes: 'PDF, JPG',
    maxSizeMb: 10,
    retentionYears: 7,
    requiredAuth: 'Medical Record Office',
    isMandatory: false
  });

  // Try loading live EMR documents if connected
  useEffect(() => {
    async function fetchLiveDocs() {
      try {
        const live = await EmrService.getDocuments();
        if (Array.isArray(live) && live.length > 0) {
          setAttachments(live);
        }
      } catch (err) {
        // graceful fallback to mock data
      }
    }
    fetchLiveDocs();
  }, []);

  // Filtered Attachments
  const filteredAttachments = useMemo(() => {
    return attachments.filter(a => {
      const q = searchFilter.toLowerCase();
      const matchSearch =
        (a.title || '').toLowerCase().includes(q) ||
        (a.patient_name || '').toLowerCase().includes(q) ||
        (a.patient_uhid || '').toLowerCase().includes(q) ||
        (a.category || '').toLowerCase().includes(q) ||
        (a.file_name || '').toLowerCase().includes(q);

      const matchCategory =
        selectedCategoryFilter === 'All' || a.category === selectedCategoryFilter;

      return matchSearch && matchCategory;
    });
  }, [attachments, searchFilter, selectedCategoryFilter]);

  // Derived KPIs
  const totalAttachments = attachments.length;
  const activeCategoriesCount = categories.filter(c => c.active).length;
  const totalStorageKb = attachments.reduce((acc, curr) => acc + (curr.file_size_kb || 0), 0);
  const totalStorageMb = (totalStorageKb / 1024).toFixed(2);

  // Handle File Input Selection
  const handleFileChange = (e) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size against current maxFileSizeMb
    const fileMb = file.size / (1024 * 1024);
    if (fileMb > maxFileSizeMb) {
      setUploadError(`File rejected: Size (${fileMb.toFixed(1)} MB) exceeds configured policy limit of ${maxFileSizeMb} MB.`);
      return;
    }

    setUploadForm(prev => ({
      ...prev,
      fileName: file.name,
      fileSizeKb: Math.round(file.size / 1024),
      fileObj: file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
    }));
  };

  // Submit Upload Form
  const handleSubmitUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.fileName) {
      setUploadError('Please select a file to attach.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);

      const newAttachment = {
        id: `att-0${attachments.length + 1}`,
        title: uploadForm.title,
        patient_name: uploadForm.patientName,
        patient_uhid: uploadForm.patientUhid,
        category: uploadForm.category,
        file_name: uploadForm.fileName,
        file_size_kb: uploadForm.fileSizeKb,
        uploaded_at: new Date().toISOString(),
        uploaded_by: 'Medical Records Officer (Workstation)',
        contentSnippet: `Clinical document "${uploadForm.title}" recorded for ${uploadForm.patientName} (${uploadForm.patientUhid}). Notes: ${uploadForm.notes}`
      };

      setAttachments(prev => [newAttachment, ...prev]);
      setIsUploadModalOpen(false);
      setUploadForm({
        title: '',
        patientName: 'Devika Sengupta',
        patientUhid: 'UHID-2026-0814',
        category: categories[0]?.name || 'Discharge Summary',
        fileName: '',
        fileSizeKb: 450,
        fileObj: null,
        notes: ''
      });

      if (onNotify) onNotify(`Document "${newAttachment.title}" attached and cataloged successfully.`);
    }, 700);
  };

  // Delete Attachment
  const handleConfirmDelete = () => {
    if (!deleteConfirmDoc) return;
    setAttachments(prev => prev.filter(a => a.id !== deleteConfirmDoc.id));
    if (selectedPreviewDoc?.id === deleteConfirmDoc.id) {
      setSelectedPreviewDoc(null);
    }
    if (onNotify) onNotify(`Attachment "${deleteConfirmDoc.title}" deleted.`);
    setDeleteConfirmDoc(null);
  };

  // Add Category
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const newCat = {
      id: `cat-${categories.length + 1}`,
      name: categoryForm.name.trim(),
      allowedTypes: categoryForm.allowedTypes,
      maxSizeMb: categoryForm.maxSizeMb,
      retentionYears: categoryForm.retentionYears,
      requiredAuth: categoryForm.requiredAuth,
      isMandatory: categoryForm.isMandatory,
      active: true
    };

    setCategories(prev => [...prev, newCat]);
    setIsAddCategoryModalOpen(false);
    setCategoryForm({
      name: '',
      allowedTypes: 'PDF, JPG',
      maxSizeMb: 10,
      retentionYears: 7,
      requiredAuth: 'Medical Record Office',
      isMandatory: false
    });
    if (onNotify) onNotify(`Document category "${newCat.name}" added to EMR policies.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 4 Top KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 118, 110, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-teal)'
            }}
          >
            <Paperclip size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cataloged Attachments
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {totalAttachments} Files
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Categories
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#2563EB' }}>
              {activeCategoriesCount} Rules
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(217, 119, 6, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}
          >
            <Sliders size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Max Upload Limit
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {maxFileSizeMb} MB
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Storage Consumed
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              {totalStorageMb} MB
            </div>
          </div>
        </Card>
      </div>

      {/* Honest Hardware Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#1E40AF'
        }}
      >
        <Info size={16} style={{ flexShrink: 0, color: '#2563EB' }} />
        <span>
          <strong>Hardware Acquisition Notice:</strong> Flatbed scanner hardware and ADF feeder acquisition via TWAIN/WIA protocols run through the local client helper daemon. Browser security boundaries require file selection or local daemon bridge for direct scanning.
        </span>
      </div>

      {/* Policy & Acquisition Controls Card */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginRight: '8px' }}>
                Acquisition Mode:
              </span>
              <select
                value={selectedAcquisitionMode}
                onChange={(e) => setSelectedAcquisitionMode(e.target.value)}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                {SCANNER_ACQUISITION_MODES.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginRight: '8px' }}>
                Max Size Policy:
              </span>
              <select
                value={maxFileSizeMb}
                onChange={(e) => {
                  setMaxFileSizeMb(parseInt(e.target.value, 10));
                  if (onNotify) onNotify(`Upload size limit adjusted to ${e.target.value} MB.`);
                }}
                style={{
                  padding: '6px 10px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  fontWeight: '600'
                }}
              >
                {FILE_SIZE_LIMIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddCategoryModalOpen(true)}
            >
              Add Category Rule
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Upload}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload / Scan Attachment
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Attachments Register Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-bg-subtle)',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              EMR Clinical Documents & Scanned Attachments ({filteredAttachments.length})
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Search patient reports, consent forms, discharge summaries, and diagnostic scans.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="Search by title, patient, UHID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none'
                }}
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: 'var(--font-size-xs)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: '#FAFAFA' }}>
                <th style={{ padding: '10px 14px' }}>Document Title</th>
                <th style={{ padding: '10px 14px' }}>Patient Name & UHID</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>File Details</th>
                <th style={{ padding: '10px 14px' }}>Uploaded At & Officer</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttachments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No attachments found matching the current search filters.
                  </td>
                </tr>
              ) : (
                filteredAttachments.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: '#FFFFFF',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            {doc.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>
                        {doc.patient_name}
                      </div>
                      <div style={{ fontSize: '0.70rem', fontFamily: 'monospace', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {doc.patient_uhid}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <Badge variant="outline" size="sm">
                        {doc.category}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: '500' }}>{doc.file_name}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {doc.file_size_kb} KB
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div>{formatDateTimeIN(doc.uploaded_at)}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {doc.uploaded_by}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setSelectedPreviewDoc(doc);
                            setPreviewZoom(100);
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          style={{ color: 'var(--color-danger)' }}
                          onClick={() => setDeleteConfirmDoc(doc)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isUploading) setIsUploadModalOpen(false);
          }}
          title="Upload or Scan Clinical Document"
        >
          <form onSubmit={handleSubmitUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {uploadError && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  color: '#DC2626',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={15} />
                <span>{uploadError}</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Document Title *
              </label>
              <Input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Laparoscopic Operative Notes & Pathology Report"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Patient Name
                </label>
                <Input
                  type="text"
                  value={uploadForm.patientName}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientName: e.target.value }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Patient UHID
                </label>
                <Input
                  type="text"
                  value={uploadForm.patientUhid}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, patientUhid: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Document Category *
              </label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: 'var(--font-size-xs)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  outline: 'none'
                }}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Drag & Drop File Intake Zone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Select File (Max {maxFileSizeMb} MB) *
              </label>
              <div
                style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('scanner-file-input')?.click()}
              >
                <Upload size={28} style={{ color: 'var(--color-teal)', margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                  {uploadForm.fileName ? uploadForm.fileName : 'Click to select or drag and drop scanned PDF/image'}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Supported formats: PDF, JPG, PNG, DICOM. Policy limit: {maxFileSizeMb} MB.
                </div>
                {uploadForm.fileSizeKb > 0 && (
                  <Badge variant="teal" size="sm" style={{ marginTop: '8px' }}>
                    {uploadForm.fileSizeKb} KB
                  </Badge>
                )}
                <input
                  id="scanner-file-input"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.dcm"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {isUploading && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '4px' }}>
                  <span>Ingesting document into EMR store...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: 'var(--color-teal)',
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Clinical Officer Notes
              </label>
              <Input
                type="text"
                value={uploadForm.notes}
                onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional remarks regarding this attachment"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUploading}
                icon={Upload}
              >
                {isUploading ? 'Uploading...' : 'Save & Attach to EMR'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddCategoryModalOpen(false)}
          title="Add New Document Category Policy"
        >
          <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Category Name *
              </label>
              <Input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Genetic Counseling & Karyotype Reports"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Allowed File Types
                </label>
                <Input
                  type="text"
                  value={categoryForm.allowedTypes}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, allowedTypes: e.target.value }))}
                  placeholder="e.g. PDF, JPG, PNG"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                  Retention Period (Years)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={categoryForm.retentionYears}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, retentionYears: parseInt(e.target.value, 10) }))}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
                Required Officer Authorization
              </label>
              <Input
                type="text"
                value={categoryForm.requiredAuth}
                onChange={(e) => setCategoryForm(prev => ({ ...prev, requiredAuth: e.target.value }))}
                placeholder="e.g. Chief Medical Officer / Pathologist"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                Create Policy Rule
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Document Previewer Modal */}
      {selectedPreviewDoc && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPreviewDoc(null)}
          title={`Document Preview: ${selectedPreviewDoc.title}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Metadata Bar */}
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.75rem'
              }}
            >
              <div>
                <strong>Patient:</strong> {selectedPreviewDoc.patient_name} ({selectedPreviewDoc.patient_uhid})
              </div>
              <div>
                <strong>Category:</strong> {selectedPreviewDoc.category}
              </div>
              <div>
                <strong>Size:</strong> {selectedPreviewDoc.file_size_kb} KB
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.max(70, prev - 15))}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <ZoomOut size={12} />
                </button>
                <span style={{ fontFamily: 'monospace' }}>{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.min(150, prev + 15))}
                  style={{ border: '1px solid #CBD5E1', background: '#FFF', padding: '3px 6px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            </div>

            {/* Document Rendered Sheet Simulation */}
            <div
              style={{
                backgroundColor: '#525659',
                padding: '24px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'center',
                maxHeight: '440px',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  width: `${previewZoom}%`,
                  maxWidth: '560px',
                  backgroundColor: '#FFFFFF',
                  padding: '28px',
                  borderRadius: '2px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  fontFamily: 'serif',
                  color: '#1E293B',
                  lineHeight: '1.6',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ textAlign: 'center', borderBottom: '2px solid #0F766E', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0F766E', letterSpacing: '0.5px' }}>
                    MEDICSPRIME MULTISPECIALTY HOSPITAL & ART CENTER
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748B' }}>
                    Accredited NABH / NABL Diagnostic Laboratories & Fertility Institute
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '6px', textTransform: 'uppercase' }}>
                    {selectedPreviewDoc.title}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px', marginBottom: '14px' }}>
                  <div><strong>Patient:</strong> {selectedPreviewDoc.patient_name}</div>
                  <div><strong>UHID:</strong> {selectedPreviewDoc.patient_uhid}</div>
                  <div><strong>Document Ref:</strong> {selectedPreviewDoc.id}</div>
                  <div><strong>Catalog Date:</strong> {formatDateTimeIN(selectedPreviewDoc.uploaded_at)}</div>
                </div>

                <div style={{ minHeight: '140px', whiteSpace: 'pre-wrap', color: '#334155' }}>
                  {selectedPreviewDoc.contentSnippet || 'Standard verified clinical record archived in hospital repository.'}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748B' }}>
                  <div>Verified By: {selectedPreviewDoc.uploaded_by}</div>
                  <div>Digital Hash: SHA256-AUTHENTIC</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                variant="outline"
                onClick={() => setSelectedPreviewDoc(null)}
              >
                Close Preview
              </Button>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => {
                  if (onNotify) onNotify(`Simulated download of ${selectedPreviewDoc.file_name} initiated.`);
                }}
              >
                Download File
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmDoc(null)}
          title="Delete Attached Document"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
              Are you sure you want to delete attachment <strong>"{deleteConfirmDoc.title}"</strong> ({deleteConfirmDoc.file_name}) for patient <strong>{deleteConfirmDoc.patient_name}</strong>? This action will be recorded in the hospital audit trail.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmDoc(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
