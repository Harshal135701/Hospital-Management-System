import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  AlertTriangle,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  Search,
  Filter,
  Flame,
  AlertCircle
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../common/UIPrimitives';
import { DIET_CATEGORIES } from './dietDemoData';
import { formatDateTimeIN } from '../../utils/formatters';

export function DietOrdering({
  orders,
  patients,
  doctors,
  onCreateOrder,
  onUpdateOrderStatus
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [wardBed, setWardBed] = useState('Ward A - Bed 12');
  const [dietCategory, setDietCategory] = useState(DIET_CATEGORIES[0].id);
  const [mealInstructions, setMealInstructions] = useState('');
  const [restrictions, setRestrictions] = useState('');
  const [isNpo, setIsNpo] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 10);
    const q = patientSearch.toLowerCase();
    return patients.filter(p =>
      (p.full_name || p.name || '').toLowerCase().includes(q) ||
      (p.uhid || '').toLowerCase().includes(q)
    );
  }, [patients, patientSearch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (ord.patient_name || '').toLowerCase().includes(q) ||
        (ord.patient_uhid || '').toLowerCase().includes(q) ||
        (ord.ward_bed || '').toLowerCase().includes(q) ||
        (ord.meal_instructions || '').toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || ord.diet_category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [orders, searchTerm, categoryFilter]);

  const handleOpenOrderModal = () => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
    if (doctors.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId(doctors[0].id);
    }
    setIsOrderModalOpen(true);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setDietCategory(catId);
    if (catId === 'NPO') {
      setIsNpo(true);
      setMealInstructions('STRICT NIL PER OS (NPO). NO FOOD, WATER, OR LIQUIDS.');
    } else {
      setIsNpo(false);
      const catObj = DIET_CATEGORIES.find(c => c.id === catId);
      if (catObj && !mealInstructions) {
        setMealInstructions(catObj.description);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const patientObj = patients.find(p => String(p.id) === String(selectedPatientId)) || {
      id: selectedPatientId,
      full_name: 'Patient ' + selectedPatientId,
      uhid: 'UHID-2026-0811'
    };
    const doctorObj = doctors.find(d => String(d.id) === String(selectedDoctorId)) || {
      id: selectedDoctorId,
      full_name: 'Attending Clinician'
    };
    const catObj = DIET_CATEGORIES.find(c => c.id === dietCategory) || DIET_CATEGORIES[0];

    const newOrder = {
      id: `ord-${Date.now()}`,
      patient_id: patientObj.id,
      patient_name: patientObj.full_name || patientObj.name,
      patient_uhid: patientObj.uhid,
      ward_bed: wardBed,
      diet_category: catObj.id,
      diet_category_name: catObj.name,
      meal_instructions: mealInstructions || catObj.description,
      restrictions: restrictions || 'Standard hospital guidelines',
      is_npo: isNpo,
      effective_start: new Date().toISOString(),
      ordered_by: doctorObj.full_name || doctorObj.name,
      status: 'active'
    };

    onCreateOrder(newOrder);
    setIsOrderModalOpen(false);
    setMealInstructions('');
    setRestrictions('');
  };

  const npoOrdersCount = useMemo(() => {
    return orders.filter(o => o.is_npo && o.status === 'active').length;
  }, [orders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* NPO Alert Banner if active NPO orders exist */}
      {npoOrdersCount > 0 && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid var(--color-error)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--color-error)' }}>
                CRITICAL NPO SAFETY ALERT: {npoOrdersCount} Active Fasting Patient(s)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#991B1B', marginTop: '2px' }}>
                Strict Nil Per Os active. Food and water trays must be withheld by kitchen staff and ward nurses.
              </div>
            </div>
          </div>
          <Badge variant="danger">{npoOrdersCount} NPO Active</Badge>
        </div>
      )}

      {/* Filter and Action Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by patient name, UHID, ward/bed or instruction..."
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
            <option value="all">All Diet Categories</option>
            {DIET_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenOrderModal}
        >
          Prescribe Patient Diet
        </Button>
      </div>

      {/* Active Diet Orders Table */}
      <Card
        title={`Active Patient Diet Prescriptions (${filteredOrders.length})`}
        subtitle="Physician and dietitian clinical diet orders communicated directly to the hospital kitchen."
      >
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--color-text-muted)' }}>
            <Utensils size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>No diet orders found matching filters.</div>
            <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Click "Prescribe Patient Diet" to enter an inpatient meal plan.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Patient & Location</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Prescribed Diet Category</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Clinical Meal Instructions</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Restrictions / Allergy Flags</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Ordering Clinician</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(ord => (
                  <tr
                    key={ord.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      backgroundColor: ord.is_npo ? '#FFF5F5' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', color: ord.is_npo ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
                        {ord.patient_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {ord.patient_uhid} • <strong>{ord.ward_bed}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {ord.is_npo ? (
                        <Badge variant="danger">⛔ NPO (Fasting)</Badge>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--color-bg-pale-aqua)',
                            color: 'var(--color-primary-teal)',
                            fontWeight: '600',
                            fontSize: '0.78rem'
                          }}
                        >
                          {ord.diet_category_name}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px', maxWidth: '280px' }}>
                      <div style={{ fontSize: '0.8rem', color: ord.is_npo ? 'var(--color-error)' : 'var(--color-text-primary)', fontWeight: ord.is_npo ? '600' : 'normal', lineHeight: 1.35 }}>
                        {ord.meal_instructions}
                      </div>
                    </td>
                    <td style={{ padding: '12px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                        {ord.restrictions}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                        {ord.ordered_by}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        {formatDateTimeIN(ord.effective_start)}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={ord.status === 'active' ? 'success' : 'gray'}>
                        {ord.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {ord.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUpdateOrderStatus(ord.id, 'discontinued')}
                        >
                          Discontinue
                        </Button>
                      ) : (
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() => onUpdateOrderStatus(ord.id, 'active')}
                        >
                          Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Prescribe Diet Modal */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        title="Prescribe Patient Inpatient Diet"
        subtitle="Issue nutritional instructions and therapeutic dietary restrictions."
        maxWidth="620px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient Quick Selector */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Select Inpatient *
            </label>
            <input
              type="text"
              placeholder="Search patient..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', marginBottom: '6px', fontSize: '0.84rem' }}
            />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <option value="">-- Choose Patient --</option>
              {filteredPatients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name || p.name} ({p.uhid})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Ward / Bed Number *
              </label>
              <input
                type="text"
                value={wardBed}
                onChange={(e) => setWardBed(e.target.value)}
                required
                placeholder="e.g. ICU-02 or Ward A, Bed 04"
                style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
                Diet Category *
              </label>
              <select
                value={dietCategory}
                onChange={handleCategoryChange}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
              >
                {DIET_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* NPO Checkbox Callout */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: isNpo ? '#FEF2F2' : '#F8FAFC',
              border: `1.5px solid ${isNpo ? 'var(--color-error)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <input
              type="checkbox"
              id="npoCheckbox"
              checked={isNpo}
              onChange={(e) => {
                setIsNpo(e.target.checked);
                if (e.target.checked) {
                  setDietCategory('NPO');
                  setMealInstructions('STRICT NIL PER OS (NPO). NO FOOD, WATER, OR LIQUIDS.');
                }
              }}
              style={{ width: '18px', height: '18px' }}
            />
            <label htmlFor="npoCheckbox" style={{ fontSize: '0.84rem', fontWeight: '600', color: isNpo ? 'var(--color-error)' : 'var(--color-text-primary)', cursor: 'pointer' }}>
              Enforce Strict Nil Per Os (NPO) Fasting Protocol
            </label>
          </div>

          {/* Meal Instructions */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Meal Instructions & Texture Modifications
            </label>
            <textarea
              rows="2"
              value={mealInstructions}
              onChange={(e) => setMealInstructions(e.target.value)}
              placeholder="e.g. Diabetic low-salt, warm water only, pureed texture..."
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Allergy Restrictions & Dietary Exclusions
            </label>
            <input
              type="text"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
              placeholder="e.g. Strictly no dairy, no shellfish, low potassium leached vegetables"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px', display: 'block' }}>
              Ordering Clinician / Dietitian *
            </label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', backgroundColor: '#FFFFFF', fontSize: '0.85rem' }}
            >
              <option value="">-- Choose Clinician --</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.full_name || d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
            <Button variant="ghost" onClick={() => setIsOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" icon={CheckCircle2}>
              Save Diet Prescription
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
