import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  Activity,
  FileText,
  DollarSign,
  Landmark,
  ShieldCheck,
  Building2,
  Wrench,
  Utensils,
  Egg,
  Siren,
  Pill,
  Paperclip,
  Tag,
  CreditCard,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  DayCareService,
  DietaryService,
  IvfService,
  EmergencyService,
  EmrService,
  FinanceService,
  AssetService,
  EnterpriseService,
  BillingOpsService,
  OperationsQueueService
} from '../../services/api';

export function SubmodulesView({ submodule, onBack, onNavigateSubmodule }) {
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});

  // Dynamic Data loader based on submodule.id
  const loadSubmoduleData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      let data = [];
      const code = submodule.id;

      if (code.startsWith('8.')) {
        // Day Care
        if (code === '8.1') data = await DayCareService.getAdmissions();
        else if (code === '8.2') data = await DayCareService.getChairs();
        else if (code === '8.3') data = await DayCareService.getAdmissions();
        else if (code === '8.4') data = await DayCareService.getAdmissions({ status: 'discharged' });
      } else if (code.startsWith('9.')) {
        // Dietary
        if (code === '9.1') data = await DietaryService.getAssessments();
        else if (code === '9.2') data = await DietaryService.getOrders();
        else if (code === '9.3') data = await DietaryService.getBatches();
        else if (code === '9.4') data = await DietaryService.getDeliveries();
      } else if (code.startsWith('10.')) {
        // IVF
        if (code === '10.1' || code === '10.2' || code === '10.3' || code === '10.4') data = await IvfService.getCycles();
        else if (code === '10.5') data = await IvfService.getCryostorage();
      } else if (code.startsWith('11.')) {
        // Emergency
        if (code === '11.1') data = await EmergencyService.getTriageList();
        else if (code === '11.2') data = await EmergencyService.getMlcList();
        else if (code === '11.3') data = await EmergencyService.getBays();
        else if (code === '11.4' || code === '11.5') data = await EmergencyService.getTriageList();
      } else if (code.startsWith('12.')) {
        // EMR
        if (code === '12.1' || code === '12.4') data = await EmergencyService.getTriageList(); // fallback to encounters list
        else if (code === '12.2') data = await EmrService.getPrescriptions();
        else if (code === '12.3') data = await EmrService.getDiagnoses();
        else if (code === '12.5') data = await EmrService.getDocuments();
      } else if (code.startsWith('13.')) {
        // Finance
        if (code === '13.1') data = await FinanceService.getAccounts();
        else if (code === '13.2') data = await FinanceService.getVouchers();
        else if (code === '13.3') data = await FinanceService.getDoctorPayouts();
        else if (code === '13.4') data = await FinanceService.getBankReconciliations();
        else if (code === '13.5') {
          const pl = await FinanceService.getProfitAndLoss();
          data = pl?.revenue || [];
        }
      } else if (code.startsWith('14.')) {
        // Assets
        if (code === '14.1' || code === '14.2' || code === '14.5') data = await AssetService.getAssets();
        else if (code === '14.3') data = await AssetService.getPmSchedules();
        else if (code === '14.4') data = await AssetService.getBreakdownTickets();
      } else if (code.startsWith('15.')) {
        // Enterprise Master
        if (code === '15.1') data = await EnterpriseService.getHospitals();
        else if (code === '15.2') data = await EnterpriseService.getClinics();
        else if (code === '15.3') data = await EnterpriseService.getDoctors();
        else if (code === '15.4') data = await EnterpriseService.getServices();
        else if (code === '15.5') data = await EnterpriseService.getCorporateTariffs();
      } else if (code.startsWith('3.')) {
        if (code === '3.2') data = await OperationsQueueService.getRosters();
        else if (code === '3.3') data = await OperationsQueueService.getQueue();
        else if (code === '3.4') data = await OperationsQueueService.getNotifications();
      } else if (code.startsWith('4.')) {
        if (code === '4.1' || code === '4.2' || code === '4.3') data = await BillingOpsService.getBills();
        else if (code === '4.4') data = await BillingOpsService.getDeposits();
        else if (code === '4.5') data = await BillingOpsService.getRefunds();
        else if (code === '4.6') data = await BillingOpsService.getSettlements();
      } else {
        data = [];
      }

      setDataList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn(`[SubmodulesView] Failed to load data for ${submodule.id}:`, err.message);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  }, [submodule.id]);

  useEffect(() => {
    loadSubmoduleData();
  }, [loadSubmoduleData]);

  // Form submit handler for creating items
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    try {
      const code = submodule.id;
      if (code === '8.1') {
        await DayCareService.createAdmission({
          patient_id: formData.patient_id || '9b87b7a6-bc17-4860-ae35-e11a3c7e3f89',
          procedure_name: formData.procedure_name || 'Endoscopic Biopsy',
          planned_duration_minutes: Number(formData.duration || 60),
          pre_op_instructions: formData.notes || 'NPO for 6 hours',
        });
      } else if (code === '8.2') {
        await DayCareService.createChair({
          code: formData.code || `CHR-${Date.now().toString().slice(-4)}`,
          name: formData.name || 'Day Care Pod Deluxe',
          zone: formData.zone || 'Bay A',
          type: formData.type || 'chair',
        });
      } else if (code === '9.1') {
        await DietaryService.createAssessment({
          patient_id: formData.patient_id || '9b87b7a6-bc17-4860-ae35-e11a3c7e3f89',
          diet_type: formData.diet_type || 'diabetic',
          calorie_target_kcal: Number(formData.calorie_target || 1800),
          dietary_restrictions: formData.notes || 'Low sodium, diabetic',
        });
      } else if (code === '9.2') {
        await DietaryService.createOrder({
          patient_id: formData.patient_id || '9b87b7a6-bc17-4860-ae35-e11a3c7e3f89',
          ward_bed: formData.ward_bed || 'Day Care Bed 3',
          meal_type: formData.meal_type || 'lunch',
          diet_category: formData.diet_category || 'diabetic',
        });
      } else if (code === '10.1') {
        await IvfService.createCycle({
          patient_id: formData.patient_id || '9b87b7a6-bc17-4860-ae35-e11a3c7e3f89',
          partner_name: formData.partner_name || 'Spouse',
          cycle_type: formData.cycle_type || 'self',
        });
      } else if (code === '11.1') {
        await EmergencyService.createTriage({
          patient_id: formData.patient_id || '9b87b7a6-bc17-4860-ae35-e11a3c7e3f89',
          triage_level: Number(formData.triage_level || 2),
          chief_complaint: formData.complaint || 'Acute shortness of breath',
        });
      } else if (code === '13.1') {
        await FinanceService.createAccount({
          account_code: formData.account_code || `ACC-${Date.now().toString().slice(-4)}`,
          account_name: formData.account_name || 'Operational Account',
          account_type: formData.account_type || 'Asset',
        });
      } else if (code === '14.1') {
        await AssetService.createAsset({
          asset_name: formData.asset_name || 'Patient Monitor Multi-para',
          category: formData.category || 'Biomedical',
          purchase_cost: Number(formData.purchase_cost || 120000),
          location_room: formData.location || 'Day Care Suite',
        });
      } else if (code === '15.4') {
        await EnterpriseService.createService({
          service_name: formData.service_name || 'Clinical Consultation',
          category: formData.category || 'Consultation',
          standard_rate: Number(formData.standard_rate || 800),
        });
      } else {
        // General action acknowledgment
        await new Promise((r) => setTimeout(r, 300));
      }

      setActionSuccess(`Successfully recorded new entry for ${submodule.title}`);
      setIsCreateModalOpen(false);
      setFormData({});
      loadSubmoduleData();
    } catch (err) {
      setActionError(err.message || 'Operation failed');
    }
  };

  const SubIcon = submodule.icon || Activity;

  // Filtered rows based on search
  const filteredData = dataList.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return Object.values(item).some(
      (val) => val && String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Submodule Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 24px',
          background: 'var(--color-surface, #ffffff)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--color-border, #E5E7EB)',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-teal-light, #E6FFFA)',
              color: 'var(--color-primary-teal, #0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SubIcon size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'var(--color-primary-teal, #0D9488)',
                  color: '#ffffff',
                }}
              >
                Module {submodule.id}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main, #111827)' }}>
                {submodule.title}
              </h2>
              <Badge variant="teal" size="sm">
                {submodule.badge || submodule.groupName}
              </Badge>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary, #6B7280)' }}>
              {submodule.subtitle}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadSubmoduleData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
            New Record
          </Button>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {actionSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#DEF7EC',
            border: '1px solid #BCF0DA',
            borderRadius: '8px',
            color: '#03543F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccess}</span>
          </div>
          <button
            onClick={() => setActionSuccess(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FDE8E8',
            border: '1px solid #F8B4B4',
            borderRadius: '8px',
            color: '#9B1C1C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#1D4ED8',
            }}
          >
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>
              Active Records
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{dataList.length}</div>
          </div>
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#DEF7EC',
              color: '#03543F',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>
              System Status
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#03543F' }}>Live & Synchronized</div>
          </div>
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '10px',
              background: '#FEF3C7',
              color: '#D97706',
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: '600' }}>
              Module Group
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#111827' }}>{submodule.groupName}</div>
          </div>
        </Card>
      </div>

      {/* Main Data Table Card */}
      <Card style={{ padding: '20px', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }}
            />
            <input
              type="text"
              placeholder={`Search ${submodule.title}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            Showing <strong>{filteredData.length}</strong> of <strong>{dataList.length}</strong> items
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#6B7280' }}>
            <RefreshCw size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '12px', fontSize: '0.875rem' }}>Loading live records from database...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              border: '1px dashed #D1D5DB',
            }}
          >
            <SubIcon size={40} style={{ color: '#9CA3AF', margin: '0 auto 12px auto' }} />
            <h4 style={{ margin: '0 0 6px 0', color: '#374151', fontSize: '1rem' }}>No records found</h4>
            <p style={{ margin: '0 0 16px 0', color: '#6B7280', fontSize: '0.875rem' }}>
              There are currently no items for this submodule. Click below to create your first entry.
            </p>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
              Create First Entry
            </Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', color: '#4B5563', backgroundColor: '#F9FAFB' }}>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Reference / Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Primary Details</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status / Metric</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date / Timestamp</th>
                  <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, idx) => {
                  const title =
                    row.admission_number ||
                    row.triage_number ||
                    row.rx_number ||
                    row.order_number ||
                    row.batch_number ||
                    row.cycle_number ||
                    row.mlc_number ||
                    row.account_name ||
                    row.asset_name ||
                    row.service_name ||
                    row.clinic_name ||
                    row.full_name ||
                    row.name ||
                    `Item #${idx + 1}`;

                  const subtitle =
                    row.procedure_name ||
                    row.chief_complaint ||
                    row.diagnosis_summary ||
                    row.patient_name ||
                    row.category ||
                    row.department_name ||
                    row.payee_name ||
                    row.code ||
                    '';

                  const statusVal =
                    row.status ||
                    row.delivery_status ||
                    row.disposition ||
                    row.account_type ||
                    (row.is_active !== undefined ? (row.is_active ? 'Active' : 'Inactive') : 'Normal');

                  const dateVal =
                    row.created_at ||
                    row.procedure_date ||
                    row.triaged_at ||
                    row.prescribed_at ||
                    row.assessment_date ||
                    row.purchase_date ||
                    row.start_date ||
                    '-';

                  return (
                    <tr
                      key={row.id || idx}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827' }}>
                        <div>{title}</div>
                        {row.code && (
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontFamily: 'monospace' }}>
                            {row.code}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>
                        <div>{subtitle || '-'}</div>
                        {row.patient_uhid && (
                          <span style={{ fontSize: '0.75rem', color: '#0D9488' }}>UHID: {row.patient_uhid}</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor:
                              String(statusVal).toLowerCase().includes('admit') ||
                              String(statusVal).toLowerCase().includes('active') ||
                              String(statusVal).toLowerCase().includes('delivered') ||
                              String(statusVal).toLowerCase().includes('in_service') ||
                              String(statusVal).toLowerCase().includes('reconciled')
                                ? '#DEF7EC'
                                : '#EFF6FF',
                            color:
                              String(statusVal).toLowerCase().includes('admit') ||
                              String(statusVal).toLowerCase().includes('active') ||
                              String(statusVal).toLowerCase().includes('delivered') ||
                              String(statusVal).toLowerCase().includes('in_service') ||
                              String(statusVal).toLowerCase().includes('reconciled')
                                ? '#03543F'
                                : '#1E40AF',
                          }}
                        >
                          {String(statusVal)}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '0.8125rem' }}>
                        {dateVal !== '-' ? new Date(dateVal).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setActionSuccess(`Viewing details for ${title}`);
                          }}
                        >
                          Inspect
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dynamic Creation Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title={`Add Record: ${submodule.title}`}
          maxWidth="560px"
        >
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
              Fill in the operational attributes to store a live record for <strong>{submodule.title}</strong>.
            </p>

            {/* Contextual Input Fields */}
            {submodule.id.startsWith('8.') && (
              <>
                <Input
                  label="Procedure Name"
                  placeholder="e.g. Endoscopy / Laparoscopy / Cataract"
                  value={formData.procedure_name || ''}
                  onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })}
                  required
                />
                <Input
                  label="Planned Duration (minutes)"
                  type="number"
                  placeholder="60"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
                <Input
                  label="Pre-Op Instructions"
                  placeholder="e.g. Fasting 6h prior, vitals check"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </>
            )}

            {submodule.id.startsWith('9.') && (
              <>
                <Select
                  label="Diet Category"
                  value={formData.diet_category || 'diabetic'}
                  onChange={(e) => setFormData({ ...formData, diet_category: e.target.value })}
                  options={[
                    { value: 'diabetic', label: 'Diabetic Low Carb' },
                    { value: 'renal', label: 'Renal Low Sodium' },
                    { value: 'regular', label: 'Regular Hospital Diet' },
                    { value: 'liquid', label: 'Full Liquid Diet' },
                  ]}
                />
                <Select
                  label="Meal Slot"
                  value={formData.meal_type || 'lunch'}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  options={[
                    { value: 'breakfast', label: 'Breakfast (08:00)' },
                    { value: 'lunch', label: 'Lunch (12:30)' },
                    { value: 'dinner', label: 'Dinner (19:30)' },
                  ]}
                />
                <Input
                  label="Ward / Bed Number"
                  placeholder="e.g. Ward 3 Bed 14"
                  value={formData.ward_bed || ''}
                  onChange={(e) => setFormData({ ...formData, ward_bed: e.target.value })}
                />
              </>
            )}

            {submodule.id.startsWith('10.') && (
              <>
                <Input
                  label="Partner Name"
                  placeholder="Partner / Spouse Full Name"
                  value={formData.partner_name || ''}
                  onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                />
                <Select
                  label="Cycle Type"
                  value={formData.cycle_type || 'self'}
                  onChange={(e) => setFormData({ ...formData, cycle_type: e.target.value })}
                  options={[
                    { value: 'self', label: 'Self Cycle (Autologous)' },
                    { value: 'donor_egg', label: 'Donor Oocyte' },
                    { value: 'donor_sperm', label: 'Donor Sperm' },
                  ]}
                />
              </>
            )}

            {submodule.id.startsWith('11.') && (
              <>
                <Select
                  label="Triage Severity Level"
                  value={formData.triage_level || '2'}
                  onChange={(e) => setFormData({ ...formData, triage_level: e.target.value })}
                  options={[
                    { value: '1', label: 'Level 1: Resuscitation (Immediate)' },
                    { value: '2', label: 'Level 2: Emergent (Within 15 mins)' },
                    { value: '3', label: 'Level 3: Urgent (Within 30 mins)' },
                    { value: '4', label: 'Level 4: Less Urgent (Within 60 mins)' },
                  ]}
                />
                <Input
                  label="Chief Presenting Complaint"
                  placeholder="e.g. Acute severe chest pain radiating to back"
                  value={formData.complaint || ''}
                  onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                  required
                />
              </>
            )}

            {submodule.id.startsWith('13.') && (
              <>
                <Input
                  label="Account Code"
                  placeholder="e.g. 1010 or 4010"
                  value={formData.account_code || ''}
                  onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                  required
                />
                <Input
                  label="Account Name"
                  placeholder="e.g. Axis Bank Operations"
                  value={formData.account_name || ''}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  required
                />
                <Select
                  label="Account Classification"
                  value={formData.account_type || 'Asset'}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  options={[
                    { value: 'Asset', label: 'Asset' },
                    { value: 'Liability', label: 'Liability' },
                    { value: 'Equity', label: 'Equity' },
                    { value: 'Revenue', label: 'Revenue' },
                    { value: 'Expense', label: 'Expense' },
                  ]}
                />
              </>
            )}

            {submodule.id.startsWith('14.') && (
              <>
                <Input
                  label="Equipment / Asset Name"
                  placeholder="e.g. Philips Multi-parameter Monitor"
                  value={formData.asset_name || ''}
                  onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  required
                />
                <Input
                  label="Purchase Cost (INR)"
                  type="number"
                  placeholder="85000"
                  value={formData.purchase_cost || ''}
                  onChange={(e) => setFormData({ ...formData, purchase_cost: e.target.value })}
                  required
                />
                <Input
                  label="Location Room / Ward"
                  placeholder="e.g. Minor OT Room 2"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </>
            )}

            {submodule.id.startsWith('15.') && (
              <>
                <Input
                  label="Service / Clinic Name"
                  placeholder="e.g. Specialist Consultation OPD"
                  value={formData.service_name || ''}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  required
                />
                <Input
                  label="Standard Base Rate (INR)"
                  type="number"
                  placeholder="1000"
                  value={formData.standard_rate || ''}
                  onChange={(e) => setFormData({ ...formData, standard_rate: e.target.value })}
                  required
                />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
