import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Clock,
  Printer,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Tag,
  ChefHat,
  Eye,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Card, Button, Badge, Modal } from '../common/UIPrimitives';
import { DIET_CATEGORIES } from './dietDemoData';

export function KitchenBatchProduction({
  batches,
  orders,
  onUpdateBatchStatus
}) {
  const [selectedShift, setSelectedShift] = useState('Lunch');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState(null);

  // Active batch based on selected meal shift
  const currentBatch = useMemo(() => {
    return batches.find(b => b.meal_shift.toLowerCase() === selectedShift.toLowerCase()) || batches[0];
  }, [batches, selectedShift]);

  // Aggregate meal counts dynamically from active orders
  const aggregatedCounts = useMemo(() => {
    const counts = {};
    DIET_CATEGORIES.forEach(c => { counts[c.id] = 0; });

    orders.forEach(ord => {
      if (ord.status === 'active') {
        const cat = ord.diet_category || 'REGULAR';
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    // Add baseline counts from currentBatch if orders list is small
    if (currentBatch?.diet_summary) {
      Object.entries(currentBatch.diet_summary).forEach(([k, v]) => {
        counts[k] = Math.max(counts[k] || 0, v);
      });
    }

    return counts;
  }, [orders, currentBatch]);

  const totalMealTrays = useMemo(() => {
    return Object.entries(aggregatedCounts).reduce((acc, [k, v]) => (k === 'NPO' ? acc : acc + v), 0);
  }, [aggregatedCounts]);

  const npoFastingCount = aggregatedCounts['NPO'] || 0;

  const handleOpenLabel = (order) => {
    setSelectedOrderForLabel(order);
    setIsLabelModalOpen(true);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Meal Shift Selector & Batch Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              color: 'var(--color-primary-teal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChefHat size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Hospital Kitchen Culinary Operations
            </div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
              Batch Production: {selectedShift} Service
            </div>
          </div>
        </div>

        {/* Shift Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map(shift => {
            const isSelected = selectedShift === shift;
            return (
              <button
                key={shift}
                type="button"
                onClick={() => setSelectedShift(shift)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  border: isSelected ? '1.5px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                  color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {shift}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            icon={Printer}
            onClick={handlePrintSheet}
          >
            Print Production Sheet
          </Button>
        </div>
      </div>

      {/* Aggregate Meal Count Matrix by Diet Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Total Active Trays */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid var(--color-primary-teal)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>TOTAL TRAYS FOR COOKING</div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--color-primary-teal)', marginTop: '4px' }}>
            {totalMealTrays}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Excludes {npoFastingCount} fasting (NPO) holds
          </div>
        </div>

        {/* NPO Fasting Hold */}
        <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-error)', fontWeight: '700' }}>CRITICAL NPO HOLDS</div>
          <div style={{ fontSize: '1.55rem', fontWeight: '800', color: 'var(--color-error)', marginTop: '4px' }}>
            {npoFastingCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#991B1B', marginTop: '2px' }}>
            Zero tray production. Strict fasting.
          </div>
        </div>

        {/* Breakdown of other therapeutic diets */}
        {DIET_CATEGORIES.filter(c => c.id !== 'NPO').map(cat => {
          const count = aggregatedCounts[cat.id] || 0;
          return (
            <div
              key={cat.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: '600', color: cat.color }}>
                  {cat.code}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                  {count}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: '500', color: 'var(--color-text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {cat.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Production Checklist & Kitchen Schedule Card */}
      <Card
        title={`Kitchen Service Schedule & Batch Preparation Check (${currentBatch?.batch_number || 'KB-TODAY'})`}
        subtitle="Batch cooking milestones, temperature log compliance, and tray plating verification."
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '14px', backgroundColor: 'var(--color-bg-pale-aqua)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(8, 127, 140, 0.2)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-primary-teal)', fontWeight: '600' }}>BATCH STATUS</div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-primary-teal)', marginTop: '2px' }}>
              {currentBatch?.status || 'Ready for Plating'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Lead Chef: {currentBatch?.chef_lead || 'Head Chef Sanjoy Roy'}
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>DIETITIAN SIGN-OFF</div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-success)', marginTop: '2px' }}>
              ✓ Inspected & Approved
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              All allergen-separated cooking surfaces sanitized.
            </div>
          </div>

          <div style={{ padding: '14px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>SERVING WINDOW</div>
            <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-text-primary)', marginTop: '2px' }}>
              {currentBatch?.shift_time || '12:30 PM'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Dispatch via thermal heated food transport trolleys.
            </div>
          </div>
        </div>

        {/* Tray Label Preview Queue */}
        <div>
          <div style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
            Active Tray Labels Ready for Assembly & Dispatch:
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '8px 10px', fontWeight: '600' }}>Patient & Bed</th>
                  <th style={{ padding: '8px 10px', fontWeight: '600' }}>Prescribed Diet</th>
                  <th style={{ padding: '8px 10px', fontWeight: '600' }}>Instructions</th>
                  <th style={{ padding: '8px 10px', fontWeight: '600' }}>Allergies</th>
                  <th style={{ padding: '8px 10px', fontWeight: '600', textAlign: 'right' }}>Label Preview</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(ord => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: '600', color: ord.is_npo ? 'var(--color-error)' : 'inherit' }}>
                        {ord.patient_name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                        {ord.ward_bed} • {ord.patient_uhid}
                      </div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {ord.is_npo ? (
                        <Badge variant="danger">⛔ NPO FASTING</Badge>
                      ) : (
                        <Badge variant="teal">{ord.diet_category_name}</Badge>
                      )}
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                      {ord.meal_instructions}
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.78rem', color: ord.restrictions ? 'var(--color-error)' : 'inherit' }}>
                      {ord.restrictions || 'None'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Tag}
                        onClick={() => handleOpenLabel(ord)}
                      >
                        Preview Label
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Tray Label Modal */}
      <Modal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        title="Thermal Bedside Tray Label Preview"
        subtitle="Standardized food safety and allergen identification label affixed to every meal dome."
        maxWidth="440px"
      >
        {selectedOrderForLabel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                border: '2px solid #000000',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FFFFFF',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #000000', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontWeight: '900', fontSize: '1rem', letterSpacing: '0.05em' }}>MEDICSPRIME HOSPITAL KITCHEN</div>
                <div style={{ fontSize: '0.72rem' }}>PATIENT MEAL SERVICE • {selectedShift.toUpperCase()}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>PATIENT:</span>
                <strong>{selectedOrderForLabel.patient_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>UHID:</span>
                <strong>{selectedOrderForLabel.patient_uhid}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>LOCATION:</span>
                <strong style={{ fontSize: '0.95rem' }}>{selectedOrderForLabel.ward_bed}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>DIET TYPE:</span>
                <strong style={{ color: selectedOrderForLabel.is_npo ? '#DC2626' : '#000000' }}>
                  {selectedOrderForLabel.diet_category_name}
                </strong>
              </div>

              {selectedOrderForLabel.restrictions && (
                <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #000000', color: '#DC2626', fontWeight: 'bold', fontSize: '0.75rem' }}>
                  ALLERGEN / RESTRICTION: {selectedOrderForLabel.restrictions.toUpperCase()}
                </div>
              )}

              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #000000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem' }}>PREPARED: {new Date().toLocaleTimeString()}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>BARCODE: ||| | | |||| | ||</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="ghost" onClick={() => setIsLabelModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print Thermal Label
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
