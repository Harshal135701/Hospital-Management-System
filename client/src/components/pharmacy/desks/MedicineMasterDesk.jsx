import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit,
  CheckCircle2,
  Check
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal } from '../../common/UIPrimitives';
import {
  DOSAGE_FORMS,
  ADMINISTRATION_ROUTES,
  DRUG_SCHEDULES,
  STORAGE_CONDITIONS
} from '../pharmacyConstants';


export function MedicineMasterDesk({
  medicines = [],
  onMedicineAdded,
  onMedicineUpdated
}) {

  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState('ALL');
  const [scheduleFilter, setScheduleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form State
  const initialForm = {
    code: '',
    brandName: '',
    genericName: '',
    saltComposition: '',
    dosageForm: 'Tablet',
    strength: '',
    route: 'Oral (PO)',
    manufacturer: '',
    packSize: '10 Tablets / Strip',
    schedule: 'SCHEDULE_H',
    storage: STORAGE_CONDITIONS[0],
    hsnCode: '300490',
    gstRate: 12,
    mrp: '',
    unitRate: '',
    reorderLevel: 100,
    minStock: 50,
    maxStock: 500
  };

  const [formData, setFormData] = useState(initialForm);

  // Filtered Catalog
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return medicines.filter(med => {
      const matchSearch =
        !q ||
        (med.brandName && med.brandName.toLowerCase().includes(q)) ||
        (med.genericName && med.genericName.toLowerCase().includes(q)) ||
        (med.saltComposition && med.saltComposition.toLowerCase().includes(q)) ||
        (med.code && med.code.toLowerCase().includes(q)) ||
        (med.manufacturer && med.manufacturer.toLowerCase().includes(q));

      const matchForm = formFilter === 'ALL' || med.dosageForm === formFilter;
      const matchSchedule = scheduleFilter === 'ALL' || med.schedule === scheduleFilter;
      const matchStatus = statusFilter === 'ALL' || med.status === statusFilter;

      return matchSearch && matchForm && matchSchedule && matchStatus;
    });
  }, [medicines, searchQuery, formFilter, scheduleFilter, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      ...initialForm,
      code: `DRUG-${Math.floor(100 + Math.random() * 900)}`
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setSelectedMedicine(med);
    setFormData({
      code: med.code || '',
      brandName: med.brandName || '',
      genericName: med.genericName || '',
      saltComposition: med.saltComposition || '',
      dosageForm: med.dosageForm || 'Tablet',
      strength: med.strength || '',
      route: med.route || 'Oral (PO)',
      manufacturer: med.manufacturer || '',
      packSize: med.packSize || '10 Tablets / Strip',
      schedule: med.schedule || 'SCHEDULE_H',
      storage: med.storage || STORAGE_CONDITIONS[0],
      hsnCode: med.hsnCode || '300490',
      gstRate: med.gstRate || 12,
      mrp: med.mrp || '',
      unitRate: med.unitRate || '',
      reorderLevel: med.reorderLevel || 100,
      minStock: med.minStock || 50,
      maxStock: med.maxStock || 500
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = () => {
    if (!formData.brandName.trim() || !formData.genericName.trim() || !formData.strength.trim()) {
      alert('Brand Name, Generic Salt, and Strength are mandatory.');
      return;
    }

    const newMed = {
      id: `MED-${Date.now()}`,
      ...formData,
      mrp: parseFloat(formData.mrp) || 50.00,
      unitRate: parseFloat(formData.unitRate) || 35.00,
      reorderLevel: parseInt(formData.reorderLevel, 10) || 100,
      minStock: parseInt(formData.minStock, 10) || 50,
      maxStock: parseInt(formData.maxStock, 10) || 500,
      status: 'Active'
    };

    if (onMedicineAdded) {
      onMedicineAdded(newMed);
    }

    setIsAddModalOpen(false);
    setNotification(`Medicine "${newMed.brandName}" added to hospital formulary.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveEdit = () => {
    if (!selectedMedicine) return;

    const updated = {
      ...selectedMedicine,
      ...formData,
      mrp: parseFloat(formData.mrp) || selectedMedicine.mrp,
      unitRate: parseFloat(formData.unitRate) || selectedMedicine.unitRate
    };

    if (onMedicineUpdated) {
      onMedicineUpdated(updated);
    }

    setIsEditModalOpen(false);
    setNotification(`Formulary parameters updated for "${updated.brandName}".`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleStatus = (med) => {
    const nextStatus = med.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...med, status: nextStatus };
    if (onMedicineUpdated) {
      onMedicineUpdated(updated);
    }
    setNotification(`Medicine "${med.brandName}" set to ${nextStatus}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: '#166534',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      <Card
        title="25.2 Hospital Medicine Master & Salt Information Catalog"
        subtitle="Manage the hospital drug formulary, generic salt molecules, therapeutic classifications, and scheduled drug policies"
      >
        {/* Search, Filters, and Add Button Bar */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            <Search size={15} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by Brand, Generic Salt, Code, Manufacturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px 7px 32px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <Select
            label=""
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
            options={[{ value: 'ALL', label: 'All Dosage Forms' }, ...DOSAGE_FORMS.map(f => ({ value: f, label: f }))]}
          />

          <Select
            label=""
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            options={[{ value: 'ALL', label: 'All Schedules' }, ...DRUG_SCHEDULES.map(s => ({ value: s.value, label: s.label }))]}
          />

          <Select
            label=""
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' }
            ]}
          />

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Medicine
          </Button>
        </div>

        {/* Medicines Catalog Table */}
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Drug Code</th>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Brand & Proprietary Name</th>
                <th style={{ padding: '8px 12px', fontWeight: '700' }}>Generic Active Salt Composition</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Form / Strength</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Manufacturer</th>
                <th style={{ padding: '8px 10px', fontWeight: '700' }}>Schedule</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'right' }}>MRP</th>
                <th style={{ padding: '8px 10px', fontWeight: '700', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '8px 12px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No medicines match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCatalog.map(med => {
                  const schedObj = DRUG_SCHEDULES.find(s => s.value === med.schedule);
                  const isInactive = med.status === 'Inactive';

                  return (
                    <tr key={med.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', opacity: isInactive ? 0.6 : 1 }}>
                      <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                        {med.code}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: '700' }}>
                        {med.brandName}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)', fontSize: '0.76rem' }}>
                        {med.saltComposition || med.genericName}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ fontWeight: '600' }}>{med.strength}</span> • {med.dosageForm}
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--color-text-secondary)', fontSize: '0.74rem' }}>
                        {med.manufacturer}
                      </td>
                      <td style={{ padding: '8px 10px' }}>
                        <Badge variant={schedObj?.color || 'neutral'}>
                          {schedObj?.value ? schedObj.value.replace('SCHEDULE_', 'Sched ') : 'OTC'}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>
                        ₹{parseFloat(med.mrp || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                        <Badge variant={isInactive ? 'neutral' : 'success'}>
                          {med.status}
                        </Badge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(med)}
                            title="Edit Medicine Formulary Parameters"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.72rem'
                            }}
                          >
                            <Edit size={12} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(med)}
                            title={isInactive ? 'Reactivate Medicine' : 'Deactivate Medicine'}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--color-border)',
                              backgroundColor: isInactive ? '#F0FDF4' : '#FEF2F2',
                              color: isInactive ? '#166534' : '#991B1B',
                              cursor: 'pointer',
                              fontSize: '0.72rem'
                            }}
                          >
                            {isInactive ? 'Activate' : 'Deactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Medicine Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
          title={isAddModalOpen ? 'Add New Medicine to Formulary' : `Edit Medicine — ${formData.brandName}`}
          subtitle="Define master pharmacology specifications, packaging, regulatory schedule, and pricing"
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <Input
                label="Brand / Proprietary Name *"
                placeholder="e.g. Augmentin 625 Duo"
                value={formData.brandName}
                onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                required
              />

              <Input
                label="Generic Active Salt Name *"
                placeholder="e.g. Amoxicillin + Clavulanic Acid"
                value={formData.genericName}
                onChange={(e) => setFormData(prev => ({ ...prev, genericName: e.target.value }))}
                required
              />
            </div>

            <Input
              label="Detailed Salt & Composition Specifications"
              placeholder="e.g. Amoxicillin Trihydrate 500mg + Potassium Clavulanate 125mg IP"
              value={formData.saltComposition}
              onChange={(e) => setFormData(prev => ({ ...prev, saltComposition: e.target.value }))}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Select
                label="Dosage Form *"
                value={formData.dosageForm}
                onChange={(e) => setFormData(prev => ({ ...prev, dosageForm: e.target.value }))}
                options={DOSAGE_FORMS.map(f => ({ value: f, label: f }))}
              />

              <Input
                label="Strength Specification *"
                placeholder="e.g. 625mg, 500mg, 1g, 40mg"
                value={formData.strength}
                onChange={(e) => setFormData(prev => ({ ...prev, strength: e.target.value }))}
                required
              />

              <Select
                label="Administration Route"
                value={formData.route}
                onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                options={ADMINISTRATION_ROUTES.map(r => ({ value: r, label: r }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <Input
                label="Manufacturer / Marketing Co."
                placeholder="e.g. GSK, Cipla, Sun Pharma"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              />

              <Select
                label="Regulatory Drug Schedule *"
                value={formData.schedule}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                options={DRUG_SCHEDULES.map(s => ({ value: s.value, label: s.label }))}
              />

              <Input
                label="Pack Size / Unit of Measure"
                placeholder="e.g. 10 Tablets / Strip"
                value={formData.packSize}
                onChange={(e) => setFormData(prev => ({ ...prev, packSize: e.target.value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
              <Input
                label="Max Retail Price (MRP ₹)"
                type="number"
                placeholder="e.g. 215.50"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
              />

              <Input
                label="Hospital Purchase Rate (₹)"
                type="number"
                placeholder="e.g. 172.40"
                value={formData.unitRate}
                onChange={(e) => setFormData(prev => ({ ...prev, unitRate: e.target.value }))}
              />

              <Input
                label="Reorder Level Threshold"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
              <Button variant="primary" icon={Check} onClick={isAddModalOpen ? handleSaveAdd : handleSaveEdit}>
                {isAddModalOpen ? 'Save to Master Catalog' : 'Update Formulary Specifications'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
