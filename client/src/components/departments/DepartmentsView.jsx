import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Edit3,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { DepartmentService, TokenManager } from '../../services/api';

const DEFAULT_DEPARTMENTS = [
  { id: 'dept-01', code: 'CRD', name: 'Cardiology & Cath Lab', description: 'Advanced cardiac care, interventional cardiology, and ICU telemetry', is_active: true },
  { id: 'dept-02', code: 'OBG', name: 'Reproductive Medicine & IVF', description: 'Assisted reproductive technologies, embryology, and fertility clinic', is_active: true },
  { id: 'dept-03', code: 'HEM', name: 'Haematology & Blood Transfusion', description: 'Blood component processing, immunohematology, and donor apheresis', is_active: true },
  { id: 'dept-04', code: 'ORT', name: 'Orthopaedics & Joint Care', description: 'Arthroplasty, trauma surgery, and sports medicine rehabilitation', is_active: true },
  { id: 'dept-05', code: 'GEN', name: 'General Internal Medicine', description: 'Adult primary care, diabetic management, and outpatient reviews', is_active: true },
  { id: 'dept-06', code: 'ICU', name: 'Critical Care & Resuscitation', description: 'Multidisciplinary intensive care unit and continuous life support', is_active: true },
];

export function DepartmentsView({ onBack, onNavigate: _onNavigate }) {
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [successBanner, setSuccessBanner] = useState(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ name: '', code: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '', is_active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  const loadDepartments = async () => {
    setIsLoading(true);
    try {
      const data = await DepartmentService.getDepartments();
      if (Array.isArray(data) && data.length > 0) {
        setDepartments(data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.code.trim()) {
      setModalError('Department name and unique code are required.');
      return;
    }
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: createForm.name.trim(),
        code: createForm.code.trim().toUpperCase(),
        description: createForm.description.trim() || null,
        is_active: true
      };

      if (TokenManager.getToken()) {
        const res = await DepartmentService.createDepartment(payload);
        const created = res?.data || res;
        setDepartments(prev => [created, ...prev]);
      } else {
        const newDept = {
          id: `dept-${Date.now()}`,
          ...payload
        };
        setDepartments(prev => [newDept, ...prev]);
      }

      setIsCreateModalOpen(false);
      setCreateForm({ name: '', code: '', description: '' });
      setSuccessBanner(`Department '${payload.name}' (${payload.code}) registered successfully.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to create department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingDept) return;
    setIsSubmitting(true);
    setModalError(null);

    try {
      const payload = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        is_active: Boolean(editForm.is_active)
      };

      if (TokenManager.getToken()) {
        await DepartmentService.updateDepartment(editingDept.id, payload);
      }

      setDepartments(prev =>
        prev.map(d => d.id === editingDept.id ? { ...d, ...payload } : d)
      );

      setIsEditModalOpen(false);
      setEditingDept(null);
      setSuccessBanner(`Department '${payload.name}' updated.`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setModalError(err.message || 'Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    const newStatus = !dept.is_active;
    try {
      if (TokenManager.getToken()) {
        await DepartmentService.toggleStatus(dept.id, newStatus);
      }
      setDepartments(prev =>
        prev.map(d => d.id === dept.id ? { ...d, is_active: newStatus } : d)
      );
      setSuccessBanner(`Department '${dept.name}' set to ${newStatus ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const filteredDepts = departments.filter(d => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      (d.description && d.description.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Clinical Departments & Wings
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Hospital clinical specialty departments, hierarchy, and operating status.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onBack && (
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setModalError(null);
              setIsCreateModalOpen(true);
            }}
          >
            + Add Department
          </Button>
        </div>
      </div>

      {successBanner && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ width: '300px' }}>
        <Input
          placeholder="Search departments by name or code..."
          icon={Search}
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
      </div>

      {/* Departments Table */}
      <Card title="Registered Hospital Departments">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600' }}>Code</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600' }}>Department Name</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '600' }}>Scope & Description</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepts.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary-teal)', fontFamily: 'monospace' }}>
                    {d.code}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    {d.name}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-text-secondary)', maxWidth: '340px' }}>
                    {d.description || 'Clinical department wing'}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <Badge variant={d.is_active ? 'success' : 'gray'} size="sm">
                      {d.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => {
                          setEditingDept(d);
                          setEditForm({ name: d.name, description: d.description || '', is_active: d.is_active });
                          setModalError(null);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={d.is_active ? ToggleRight : ToggleLeft}
                        onClick={() => handleToggleStatus(d)}
                        title={d.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {d.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Department Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Clinical Department"
          subtitle="Establish a new hospital discipline and clinic hierarchy"
          maxWidth="500px"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {modalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <Input
              label="Department Name"
              required
              placeholder="e.g. Neurology & Stroke Unit"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />

            <Input
              label="Department Code (2-5 letters)"
              required
              placeholder="e.g. NEU"
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
            />

            <Input
              label="Scope & Clinical Description"
              placeholder="Clinical coverage, clinics, specialized equipment"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} icon={CheckCircle2}>
                Create Department
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Department Modal */}
      {isEditModalOpen && editingDept && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Department Details"
          subtitle={`Editing ${editingDept.name} (${editingDept.code})`}
          maxWidth="500px"
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {modalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <Input
              label="Department Name"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />

            <Input
              label="Scope & Clinical Description"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmitting} icon={CheckCircle2}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
