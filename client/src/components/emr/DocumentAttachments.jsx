import React, { useState, useMemo } from 'react';
import {
  Paperclip,
  Upload,
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  FileCheck,
  Download
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { formatDateTimeIN } from '../../utils/formatters';

const DOCUMENT_CATEGORIES = [
  'Discharge Summary',
  'Laboratory Report',
  'Radiology / Scan',
  'External Referral Letter',
  'Insurance / TPA Policy Document',
  'Operative Surgical Note',
  'Consent Form'
];

export function DocumentAttachments({
  selectedPatient,
  documents,
  onSaveDocument
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);

  // Upload Form State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [docNotes, setDocNotes] = useState('');

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        (doc.title || '').toLowerCase().includes(q) ||
        (doc.file_name || '').toLowerCase().includes(q) ||
        (doc.notes || '').toLowerCase().includes(q);

      const matchCat = categoryFilter === 'all' || doc.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [documents, searchTerm, categoryFilter]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
      if (!docTitle) {
        setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!docTitle || !selectedPatient) return;

    const newDoc = {
      id: `doc-${Date.now()}`,
      patient_id: selectedPatient.id,
      patient_name: selectedPatient.full_name || selectedPatient.name,
      patient_uhid: selectedPatient.uhid,
      title: docTitle,
      category: docCategory,
      file_name: selectedFileName || 'clinical_record.pdf',
      file_size_kb: Math.floor(250 + Math.random() * 2000),
      uploaded_at: new Date().toISOString(),
      uploaded_by: 'Current Staff User',
      notes: docNotes
    };

    onSaveDocument(newDoc);
    setIsUploadModalOpen(false);
    setDocTitle('');
    setSelectedFileName('');
    setDocNotes('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Storage Security Warning Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#FFFBEB',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#92400E'
        }}
      >
        <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
        <div>
          <strong>Document Storage Security Notice:</strong> Attached documents are staged in client-side metadata for workflow demonstration. Actual encrypted binary file storage (AWS S3 / Azure Blob / MinIO) and cryptographic hashing integration are pending backend connection.
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search attached documents by title, file name, category or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--color-border)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Document Categories</option>
            {DOCUMENT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          icon={Upload}
          onClick={() => setIsUploadModalOpen(true)}
        >
          Attach Clinical Document
        </Button>
      </div>

      {/* Documents Registry Card */}
      <Card
        title={`Patient Attached Clinical Documents (${filteredDocuments.length})`}
        subtitle="Electronic medical attachments, radiology scan reports, external referral records, and signed forms."
      >
        {filteredDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Paperclip size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No document attachments found.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "Attach Clinical Document" to upload reports or external medical records.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Document Title</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>File Details</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Uploaded By & Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Clinical Notes</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} style={{ color: 'var(--color-primary-teal)', flexShrink: 0 }} />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant="teal">{doc.category}</Badge>
                    </td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                      <div>{doc.file_name}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                        {(doc.file_size_kb / 1024).toFixed(2)} MB
                      </div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.78rem' }}>
                      <div style={{ color: 'var(--color-text-primary)' }}>{doc.uploaded_by}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                        {formatDateTimeIN(doc.uploaded_at)}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '240px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {doc.notes || 'No remarks recorded.'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedDocPreview(doc)}
                      >
                        Preview
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Attach Clinical Document to EMR Record"
        subtitle="Upload external medical records, imaging reports, and diagnostic certificates."
        maxWidth="540px"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--color-primary-teal)', fontWeight: '500' }}>
            Attaching to: <strong>{selectedPatient?.full_name}</strong> ({selectedPatient?.uhid})
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Select File (PDF, DICOM, JPEG, PNG) *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.82rem' }}
            />
            {selectedFileName && (
              <div style={{ fontSize: '0.74rem', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
                Selected: {selectedFileName}
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Document Title *
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
              placeholder="e.g. Brain MRI T1/T2 Axial Scan Report"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Clinical Document Category *
            </label>
            <select
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              {DOCUMENT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Clinical Notes / Findings Summary
            </label>
            <textarea
              rows="2"
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="Key diagnostic impressions, referral hospital name..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.84rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Attachment Metadata
            </Button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={Boolean(selectedDocPreview)}
        onClose={() => setSelectedDocPreview(null)}
        title={selectedDocPreview?.title || 'Document Preview'}
        subtitle={`${selectedDocPreview?.category} • ${selectedDocPreview?.file_name}`}
        maxWidth="600px"
      >
        {selectedDocPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                backgroundColor: '#F8FAFC',
                textAlign: 'center'
              }}
            >
              <FileCheck size={48} style={{ color: 'var(--color-primary-teal)', margin: '0 auto 12px' }} />
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                {selectedDocPreview.file_name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Uploaded: {formatDateTimeIN(selectedDocPreview.uploaded_at)} by {selectedDocPreview.uploaded_by}
              </div>
              <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-subtle)', textAlign: 'left', fontSize: '0.82rem' }}>
                <strong>Remarks:</strong> {selectedDocPreview.notes || 'No remarks recorded.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setSelectedDocPreview(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => alert(`Simulated secure download of ${selectedDocPreview.file_name}`)}
              >
                Download Document
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
