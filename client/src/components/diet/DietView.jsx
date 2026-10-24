import React, { useState, useEffect, useCallback } from 'react';
import {
  Utensils,
  Scale,
  ChefHat,
  Truck,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Card, Button, Badge } from '../common/UIPrimitives';
import { NutritionalAssessment } from './NutritionalAssessment';
import { DietOrdering } from './DietOrdering';
import { KitchenBatchProduction } from './KitchenBatchProduction';
import { WardDeliveryTracking } from './WardDeliveryTracking';
import {
  INITIAL_ASSESSMENTS,
  INITIAL_DIET_ORDERS,
  INITIAL_KITCHEN_BATCHES,
  INITIAL_WARD_DELIVERIES
} from './dietDemoData';
import { DietaryService, PatientService, ClinicalStaffService } from '../../services/api';

export function DietView({ initialSubtab = '9.1', onNavigate: _onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && ['9.1', '9.2', '9.3', '9.4'].includes(initialSubtab)) {
      return initialSubtab;
    }
    return '9.1';
  });

  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS);
  const [orders, setOrders] = useState(INITIAL_DIET_ORDERS);
  const [batches, setBatches] = useState(INITIAL_KITCHEN_BATCHES);
  const [deliveries, setDeliveries] = useState(INITIAL_WARD_DELIVERIES);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assRes, ordRes, batRes, delRes, patRes, staffRes] = await Promise.allSettled([
        DietaryService.getAssessments(),
        DietaryService.getOrders(),
        DietaryService.getBatches(),
        DietaryService.getDeliveries(),
        PatientService.getPatients(),
        ClinicalStaffService.getStaff()
      ]);

      if (assRes.status === 'fulfilled' && Array.isArray(assRes.value) && assRes.value.length > 0) {
        setAssessments(assRes.value);
      }
      if (ordRes.status === 'fulfilled' && Array.isArray(ordRes.value) && ordRes.value.length > 0) {
        setOrders(ordRes.value);
      }
      if (batRes.status === 'fulfilled' && Array.isArray(batRes.value) && batRes.value.length > 0) {
        setBatches(batRes.value);
      }
      if (delRes.status === 'fulfilled' && Array.isArray(delRes.value) && delRes.value.length > 0) {
        setDeliveries(delRes.value);
      }
      if (patRes.status === 'fulfilled' && patRes.value?.data) {
        setPatients(patRes.value.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.data) {
        setDoctors(staffRes.value.data);
      }
    } catch (err) {
      console.warn('[DietView] Live API fallback:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveAssessment = async (newAssessment) => {
    setAssessments(prev => [newAssessment, ...prev]);
    showToast(`Nutritional assessment saved for ${newAssessment.patient_name}.`);

    try {
      await DietaryService.createAssessment(newAssessment);
    } catch (e) {
      console.info('[DietView] Live API fallback:', e.message);
    }
  };

  const handleCreateOrder = async (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Diet order (${newOrder.diet_category_name}) prescribed for ${newOrder.patient_name}.`);

    try {
      await DietaryService.createOrder(newOrder);
    } catch (e) {
      console.info('[DietView] Live API fallback:', e.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Diet order marked as ${newStatus}.`);

    try {
      await DietaryService.updateOrderStatus(orderId, newStatus);
    } catch (e) {
      console.info('[DietView] Live API fallback:', e.message);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId, newStatus, notes) => {
    setDeliveries(prev =>
      prev.map(d =>
        d.id === deliveryId
          ? {
              ...d,
              status: newStatus,
              delivered_at: newStatus === 'delivered' ? new Date().toISOString() : d.delivered_at,
              notes: notes || d.notes
            }
          : d
      )
    );
    showToast(`Meal tray status updated to ${newStatus}.`);
  };

  const subtabs = [
    { id: '9.1', label: '9.1 Nutritional Assessment', icon: Scale, badge: assessments.length },
    { id: '9.2', label: '9.2 Diet Ordering', icon: Utensils, badge: orders.filter(o => o.status === 'active').length },
    { id: '9.3', label: '9.3 Kitchen Production', icon: ChefHat },
    { id: '9.4', label: '9.4 Ward Delivery Tracking', icon: Truck, badge: deliveries.filter(d => d.status === 'in_transit').length || null }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Workspace Banner */}
      <div
        style={{
          borderRadius: 'var(--radius-xl)',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
        className="diet-banner"
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary-teal)' }}>
                Submodules 9.1 – 9.4
              </span>
              <Badge variant="teal" size="sm">Therapeutic Clinical Nutrition</Badge>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              Diet & Inpatient Nutrition Workspace
            </h1>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '780px', lineHeight: 1.5, margin: 0 }}>
              Clinical dietitian nutritional assessments, therapeutic meal ordering, kitchen batch production, and bedside tray delivery tracking.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              border: '1px solid rgba(8, 127, 140, 0.25)',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={16} color="var(--color-success)" />
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
              HACCP Food Safety Enforced
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <Button
            variant={activeSubtab === '9.2' ? 'primary' : 'outline'}
            size="sm"
            icon={Plus}
            onClick={() => setActiveSubtab('9.2')}
          >
            New Diet Order
          </Button>
          <Button
            variant={activeSubtab === '9.1' ? 'primary' : 'outline'}
            size="sm"
            icon={Scale}
            onClick={() => setActiveSubtab('9.1')}
          >
            Nutritional Assessment
          </Button>
          <Button
            variant={activeSubtab === '9.3' ? 'primary' : 'outline'}
            size="sm"
            icon={ChefHat}
            onClick={() => setActiveSubtab('9.3')}
          >
            Kitchen Batches
          </Button>
          <Button
            variant={activeSubtab === '9.4' ? 'primary' : 'soft'}
            size="sm"
            icon={Truck}
            onClick={() => setActiveSubtab('9.4')}
          >
            Ward Delivery
          </Button>
        </div>
      </div>

      {/* Global Toast */}
      {toastMessage && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-bg-pale-aqua)',
            border: '1px solid rgba(8, 127, 140, 0.3)',
            color: 'var(--color-primary-teal)',
            fontSize: '0.84rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-in'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Submodule Navigation Tabs (Blood Bank style) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1.5px solid var(--color-border)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {subtabs.map(tab => {
          const isActive = activeSubtab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubtab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '600' : '500',
                fontSize: 'var(--font-size-sm)',
                borderTop: isActive ? '2px solid var(--color-primary-teal)' : '2px solid transparent',
                borderLeft: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderRight: isActive ? '1px solid var(--color-border)' : '1px solid transparent',
                borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
                cursor: 'pointer',
                marginBottom: '-1.5px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
              {tab.badge != null && (
                <span
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#EEF2F2',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)'
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Screen Render */}
      <div>
        {activeSubtab === '9.1' && (
          <NutritionalAssessment
            assessments={assessments}
            patients={patients}
            onSaveAssessment={handleSaveAssessment}
          />
        )}

        {activeSubtab === '9.2' && (
          <DietOrdering
            orders={orders}
            patients={patients}
            doctors={doctors}
            onCreateOrder={handleCreateOrder}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {activeSubtab === '9.3' && (
          <KitchenBatchProduction
            batches={batches}
            orders={orders}
          />
        )}

        {activeSubtab === '9.4' && (
          <WardDeliveryTracking
            deliveries={deliveries}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
          />
        )}
      </div>
    </div>
  );
}
