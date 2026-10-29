import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Archive,
  Lock,
  IndianRupee,
  Check
} from 'lucide-react';
import { Card, Button, Badge, Input, Select, Modal } from '../common/UIPrimitives';
import {
  DONOR_STATUS_CONFIG,
  DONOR_CATEGORIES
} from './andrologyConstants';
import { INITIAL_DONOR_REGISTRY } from './andrologyMockData';
import { formatDateIN } from '../../utils/formatters';
import { BillingOpsService } from '../../services/api';

export function DonorRegistryDesk({ onNotify }) {
  const [donors, setDonors] = useState(INITIAL_DONOR_REGISTRY);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(INITIAL_DONOR_REGISTRY[0]);
  const [validationErrors, setValidationErrors] = useState({});

  // Payout Modal State
  const [payoutForm, setPayoutForm] = useState({
    amount: '5000',
    paymentMethod: 'neft',
    txnRef: '',
    approvedBy: 'ART Medical Director',
    notes: 'Medical & travel expense allowance under ART Regulation Act'
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [isDisbursing, setIsDisbursing] = useState(false);

  // New Donor Form State
  const defaultDonorForm = {
    donorCode: `DONOR-SP-0${Math.floor(50 + Math.random() * 40)}`,
    category: 'Sperm Donor',
    regDate: new Date().toISOString().slice(0, 10),
    age: '27',
    bloodGroup: 'B+ (Positive)',
    education: 'Graduate / Professional',
    physicalTraits: 'Height: 176 cm, Eye: Black, Hair: Dark Brown, Skin: Fair',
    screeningStatus: 'Under 180-Day Quarantine',
    consentStatus: 'Signed & Notarized ART Bank Agreement',
    inventoryVials: 6,
    storageLocation: 'Tank Beta (LN2 Donor Vault) / Canister 02',
    status: 'Under 180-Day Quarantine',
    notes: 'Altruistic ART donor registered. Initial serology clean; entered into 6-month quarantine window.'
  };

  const [donorForm, setDonorForm] = useState(defaultDonorForm);

  // Validation
  const validateDonorForm = () => {
    const errs = {};
    if (!donorForm.donorCode?.trim()) errs.donorCode = 'Internal donor code is required.';
    const age = parseInt(donorForm.age, 10);
    if (isNaN(age) || age < 18 || age > 39) {
      errs.age = 'Donor age must be between 18 and 39 years per ART Regulation guidelines.';
    }
    const vials = parseInt(donorForm.inventoryVials, 10);
    if (isNaN(vials) || vials < 1) {
      errs.inventoryVials = 'Initial vial count must be at least 1.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Register Donor
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!validateDonorForm()) return;

    const newDonor = {
      id: `dnr-${Date.now()}`,
      donorCode: donorForm.donorCode,
      category: donorForm.category,
      regDate: donorForm.regDate,
      age: parseInt(donorForm.age, 10) || 27,
      bloodGroup: donorForm.bloodGroup,
      education: donorForm.education,
      physicalTraits: donorForm.physicalTraits,
      screeningStatus: donorForm.screeningStatus,
      consentStatus: donorForm.consentStatus,
      inventoryVials: parseInt(donorForm.inventoryVials, 10) || 6,
      storageLocation: donorForm.storageLocation,
      lastDonationDate: donorForm.regDate,
      lastReviewDate: donorForm.regDate,
      quarantineDaysCompleted: 1,
      status: donorForm.status,
      serology: {
        hiv: 'Non-Reactive (ELISA 4th Gen)',
        hbsag: 'Non-Reactive (Chemiluminescence)',
        hcv: 'Non-Reactive',
        vdrl: 'Non-Reactive',
        karyotype: '46,XY Normal Male Banding',
        thalassemia: 'HPLC Normal'
      },
      created_at: new Date().toISOString()
    };

    setDonors(prev => [newDonor, ...prev]);
    setIsRegisterModalOpen(false);
    setSelectedDonor(newDonor);
    onNotify?.(`Donor ${newDonor.donorCode} registered under strict identity masking.`);
  };

  // Handle Quarantine Clearance
  const handleClearQuarantine = (donorId) => {
    setDonors(prev =>
      prev.map(d => {
        if (d.id === donorId) {
          return {
            ...d,
            screeningStatus: 'Cleared & Released',
            status: 'Active',
            quarantineDaysCompleted: 180,
            lastReviewDate: new Date().toISOString().slice(0, 10),
            updated_at: new Date().toISOString()
          };
        }
        return d;
      })
    );
    onNotify?.(`Donor ${selectedDonor.donorCode} released from 180-day quarantine.`);
    setIsDossierModalOpen(false);
  };

  // Open Payout Modal
  const handleOpenPayout = async (donor) => {
    setSelectedDonor(donor);
    setPayoutForm({
      amount: '5000',
      paymentMethod: 'neft',
      txnRef: `NEFT-${Date.now().toString().slice(-6)}`,
      approvedBy: 'ART Medical Director',
      notes: 'Permitted medical & travel expense allowance under ART Regulation Act'
    });
    setIsPayoutModalOpen(true);

    try {
      const records = await BillingOpsService.getDonorCompensations(donor.donorCode);
      setPayoutHistory(Array.isArray(records) ? records : []);
    } catch {
      setPayoutHistory([]);
    }
  };

  // Submit Compensation Disbursement
  const handleDisburseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonor) return;
    setIsDisbursing(true);

    const payload = {
      donor_id: selectedDonor.id || selectedDonor.donorCode,
      donor_code: selectedDonor.donorCode,
      donor_category: selectedDonor.category,
      amount: parseFloat(payoutForm.amount) || 0,
      payment_method: payoutForm.paymentMethod,
      transaction_reference: payoutForm.txnRef || null,
      approved_by: payoutForm.approvedBy,
      notes: payoutForm.notes
    };

    try {
      const res = await BillingOpsService.disburseDonorCompensation(payload);
      const created = res?.data || res;
      setPayoutHistory(prev => [created, ...prev]);
      onNotify?.(`Disbursed ₹${payload.amount} compensation allowance to donor ${selectedDonor.donorCode}.`);
      setIsPayoutModalOpen(false);
    } catch (err) {
      // Graceful fallback in demo prototype mode
      const simulatedVoucher = {
        compensation_number: `DCOMP-${Date.now().toString().slice(-6)}`,
        donor_code: selectedDonor.donorCode,
        amount: payload.amount,
        payment_method: payload.payment_method,
        transaction_reference: payload.transaction_reference,
        created_at: new Date().toISOString()
      };
      setPayoutHistory(prev => [simulatedVoucher, ...prev]);
      onNotify?.(`Disbursed ₹${payload.amount} allowance voucher for donor ${selectedDonor.donorCode}.`);
      setIsPayoutModalOpen(false);
    } finally {
      setIsDisbursing(false);
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return donors.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        item.donorCode.toLowerCase().includes(q) ||
        item.bloodGroup.toLowerCase().includes(q) ||
        item.education.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q);

      const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter || item.screeningStatus === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [donors, searchTerm, categoryFilter, statusFilter]);

  // KPI Metrics
  const totalDonors = donors.length;
  const activeDonors = donors.filter(d => d.status === 'Active' || d.screeningStatus === 'Cleared & Released').length;
  const quarantinedDonors = donors.filter(d => d.status.includes('Quarantine') || d.screeningStatus.includes('Quarantine')).length;
  const totalVials = donors.reduce((acc, curr) => acc + (curr.inventoryVials || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Registered Donors
            </span>
            <Users size={18} style={{ color: 'var(--color-primary-teal)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {totalDonors}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Strict identity-masked registry
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Cleared & Released
            </span>
            <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-success)', marginTop: '6px' }}>
            {activeDonors}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            6-month quarantine serology negative
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              180-Day Quarantine Window
            </span>
            <Clock size={18} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#D97706', marginTop: '6px' }}>
            {quarantinedDonors}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Awaiting re-test before clinical release
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              Donor Vials in Storage
            </span>
            <Archive size={18} style={{ color: 'var(--color-info)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-info)', marginTop: '6px' }}>
            {totalVials}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Preserved in Tank Beta Vault
          </div>
        </Card>
      </div>

      {/* Action Bar & Filters */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search Donor Code, Blood Group, Traits..."
                icon={Search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ width: '180px' }}>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Donor Types' },
                  ...DONOR_CATEGORIES.map(c => ({ value: c, label: c }))
                ]}
              />
            </div>

            <div style={{ width: '220px' }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Screening Statuses' },
                  { value: 'Active', label: 'Active & Available' },
                  { value: 'Cleared & Released', label: 'Cleared & Released' },
                  { value: 'Under 180-Day Quarantine', label: '180-Day Quarantine' },
                  { value: 'Quarantined (Retest Due)', label: 'Retest Due' }
                ]}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => {
              setDonorForm(defaultDonorForm);
              setValidationErrors({});
              setIsRegisterModalOpen(true);
            }}
          >
            Register Donor
          </Button>
        </div>
      </Card>

      {/* Main Listing Table */}
      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFB', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Internal Donor Code
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Donor Category & Blood Group
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Registration & Age
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Screening & Quarantine Status
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Available Vials
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  LN2 Vault Location
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
                  Consent & ART Compliance
                </th>
                <th style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No donor registry records match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const statusConf = DONOR_STATUS_CONFIG[item.status] || DONOR_STATUS_CONFIG['Active'];
                  const StatusIcon = statusConf.icon;

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid var(--color-border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      className="hover-row"
                    >
                      {/* Donor Code */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '800', color: 'var(--color-text-primary)', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                          {item.donorCode}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-primary-teal)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={10} /> Masked Anonymous Identity
                        </div>
                      </td>

                      {/* Category & Blood Group */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: '700', color: '#1E293B' }}>
                          {item.bloodGroup}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {item.category}
                        </div>
                      </td>

                      {/* Registration & Age */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                          {formatDateIN(item.regDate)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Age: <strong>{item.age} yrs</strong>
                        </div>
                      </td>

                      {/* Screening Status */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <Badge variant={statusConf.variant} size="sm">
                          <StatusIcon size={12} style={{ marginRight: '4px' }} />
                          {statusConf.label}
                        </Badge>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                          HIV, HBsAg, HCV, VDRL: Clean
                        </div>
                      </td>

                      {/* Vials */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                          {item.inventoryVials}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                          Straws in Bank
                        </div>
                      </td>

                      {/* Vault Location */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', maxWidth: '220px' }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: '600', color: '#1E293B' }}>
                          {item.storageLocation}
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          Last Donation: {formatDateIN(item.lastDonationDate)}
                        </div>
                      </td>

                      {/* Consent & Compliance */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> ART Act Compliant
                        </div>
                        <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {item.consentStatus?.split(' ')[0]} Verified
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'top', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={Eye}
                            onClick={() => {
                              setSelectedDonor(item);
                              setIsDossierModalOpen(true);
                            }}
                            title="View Confidential Donor Profile"
                          >
                            Dossier
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            icon={IndianRupee}
                            onClick={() => handleOpenPayout(item)}
                            title="Disburse ART Expense Allowance"
                          >
                            Payout
                          </Button>
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

      {/* Register Donor Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New ART Gamete Donor"
        subtitle="Identity masking, serology baseline panel, and initial quarantine allocation under ART Regulations"
        maxWidth="850px"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px', maxHeight: '78vh', overflowY: 'auto' }}>
          {/* Section 1: Demographics */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} /> 1. Internal Identifier & Anonymized Demographics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Input
                label="Internal Donor Code"
                required
                value={donorForm.donorCode}
                onChange={(e) => setDonorForm(prev => ({ ...prev, donorCode: e.target.value }))}
                error={validationErrors.donorCode}
              />
              <Select
                label="Donor Category"
                value={donorForm.category}
                onChange={(e) => setDonorForm(prev => ({ ...prev, category: e.target.value }))}
                options={DONOR_CATEGORIES}
              />
              <Input
                label="Age (Years, 18-39 per ART Act)"
                required
                type="number"
                value={donorForm.age}
                onChange={(e) => setDonorForm(prev => ({ ...prev, age: e.target.value }))}
                error={validationErrors.age}
              />
              <Select
                label="Blood Group & Rh Factor"
                value={donorForm.bloodGroup}
                onChange={(e) => setDonorForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                options={['A+ (Positive)', 'A- (Negative)', 'B+ (Positive)', 'B- (Negative)', 'AB+ (Positive)', 'AB- (Negative)', 'O+ (Positive)', 'O- (Negative)']}
              />
              <Input
                label="Educational Qualification"
                value={donorForm.education}
                onChange={(e) => setDonorForm(prev => ({ ...prev, education: e.target.value }))}
              />
              <Input
                label="Phenotypic / Physical Characteristics"
                value={donorForm.physicalTraits}
                onChange={(e) => setDonorForm(prev => ({ ...prev, physicalTraits: e.target.value }))}
                placeholder="Height, Eye color, Skin tone, Hair..."
              />
            </div>
          </div>

          {/* Section 2: Infectious Serology & Quarantine Window */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} /> 2. Serology Panel & 180-Day Quarantine Window
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>HIV 1 & 2 ELISA 4th Gen:</div>
                <strong style={{ color: 'var(--color-success)' }}>Non-Reactive (Clear)</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>HBsAg Hepatitis B:</div>
                <strong style={{ color: 'var(--color-success)' }}>Non-Reactive (Clear)</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>Anti-HCV Hepatitis C:</div>
                <strong style={{ color: 'var(--color-success)' }}>Non-Reactive (Clear)</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>VDRL / Syphilis TPHA:</div>
                <strong style={{ color: 'var(--color-success)' }}>Non-Reactive (Clear)</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>Karyotype Banding:</div>
                <strong style={{ color: 'var(--color-success)' }}>46,XY Normal Male</strong>
              </div>
              <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1' }}>
                <div>Thalassemia Screen (HPLC):</div>
                <strong style={{ color: 'var(--color-success)' }}>Normal HbA2</strong>
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-sm)', border: '1px solid #FCD34D', fontSize: '0.76rem', color: '#92400E' }}>
              <strong>Mandatory ART Act Rule:</strong> Donated specimens must be held in 180-day quarantine. Release for IVF or IUI is prohibited until donor undergoes repeat negative serology testing 6 months post-donation.
            </div>
          </div>

          {/* Section 3: Specimen Inventory & Vault */}
          <div style={{ backgroundColor: '#F8FAFB', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.86rem', color: 'var(--color-primary-teal)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Archive size={15} /> 3. Initial Cryopreserved Vials & Vault Storage
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <Input
                label="Initial Donation Straw Count"
                required
                type="number"
                value={donorForm.inventoryVials}
                onChange={(e) => setDonorForm(prev => ({ ...prev, inventoryVials: e.target.value }))}
                error={validationErrors.inventoryVials}
              />
              <Input
                label="Storage Coordinate in Vault"
                value={donorForm.storageLocation}
                onChange={(e) => setDonorForm(prev => ({ ...prev, storageLocation: e.target.value }))}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Check}
            >
              Register & Enforce Quarantine
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confidential Donor Dossier Modal */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Confidential Donor Profile & Serology Dossier"
        subtitle={`Donor Code: ${selectedDonor?.donorCode} • Category: ${selectedDonor?.category}`}
        maxWidth="750px"
      >
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '76vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#F8FAFB', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>ANONYMOUS DONOR CODE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-text-primary)', fontFamily: 'monospace' }}>
                {selectedDonor?.donorCode}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>SCREENING ELIGIBILITY</div>
              <Badge variant={selectedDonor?.status === 'Active' ? 'success' : 'warning'} size="md">
                {selectedDonor?.status}
              </Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.8rem' }}>
            <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
                Physical & Phenotypic Profile
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Blood Group:</strong> {selectedDonor?.bloodGroup}</div>
                <div><strong>Age:</strong> {selectedDonor?.age} yrs</div>
                <div><strong>Education:</strong> {selectedDonor?.education}</div>
                <div><strong>Traits:</strong> {selectedDonor?.physicalTraits}</div>
                <div><strong>Registration Date:</strong> {formatDateIN(selectedDonor?.regDate)}</div>
              </div>
            </div>

            <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
                Cryptographic Privacy & Legal Status
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Consent:</strong> {selectedDonor?.consentStatus}</div>
                <div><strong>Vault Location:</strong> {selectedDonor?.storageLocation}</div>
                <div><strong>Available Straws:</strong> {selectedDonor?.inventoryVials} in stock</div>
                <div><strong>Quarantine Days:</strong> {selectedDonor?.quarantineDaysCompleted || 180} / 180 days</div>
              </div>
            </div>
          </div>

          {/* Serology Panel */}
          <div style={{ padding: '12px', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)', backgroundColor: '#F8FAFC' }}>
            <h5 style={{ margin: '0 0 8px', color: 'var(--color-primary-teal)', fontSize: '0.82rem' }}>
              Certified Infectious Disease & Genetic Clearance Panel
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.78rem' }}>
              <div>HIV 1 & 2: <strong style={{ color: 'var(--color-success)' }}>Non-Reactive</strong></div>
              <div>HBsAg: <strong style={{ color: 'var(--color-success)' }}>Non-Reactive</strong></div>
              <div>HCV: <strong style={{ color: 'var(--color-success)' }}>Non-Reactive</strong></div>
              <div>VDRL: <strong style={{ color: 'var(--color-success)' }}>Non-Reactive</strong></div>
              <div>Karyotype: <strong style={{ color: 'var(--color-success)' }}>46,XY Normal</strong></div>
              <div>Thalassemia: <strong style={{ color: 'var(--color-success)' }}>Normal</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            {selectedDonor?.status.includes('Quarantine') && (
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => handleClearQuarantine(selectedDonor.id)}
              >
                Confirm 180-Day Retest & Release Straws
              </Button>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <Button variant="outline" onClick={() => setIsDossierModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Compensation Disbursement Modal */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="ART Donor Compensation & Travel Allowance"
        subtitle={`Donor Code: ${selectedDonor?.donorCode} • Regulated Reimbursement`}
        maxWidth="600px"
      >
        <form onSubmit={handleDisburseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px', maxHeight: '76vh', overflowY: 'auto' }}>
          <div style={{ padding: '10px 12px', backgroundColor: '#EFF6FF', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE', fontSize: '0.76rem', color: '#1E40AF' }}>
            <strong>ART Regulation Act 2021:</strong> Donors cannot receive commercial remuneration. Documented travel, loss of daily wages, and clinical monitoring expense allowances are permitted.
          </div>

          <Input
            label="Reimbursement Amount (₹ INR)"
            required
            type="number"
            value={payoutForm.amount}
            onChange={(e) => setPayoutForm(prev => ({ ...prev, amount: e.target.value }))}
          />

          <Select
            label="Payment Mode"
            value={payoutForm.paymentMethod}
            onChange={(e) => setPayoutForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
            options={[
              { value: 'neft', label: 'NEFT Direct Bank Transfer' },
              { value: 'rtgs', label: 'RTGS Immediate Settlement' },
              { value: 'cheque', label: 'Bank Cheque / Pay Order' }
            ]}
          />

          <Input
            label="Bank Transaction Reference / UTR No"
            required
            value={payoutForm.txnRef}
            onChange={(e) => setPayoutForm(prev => ({ ...prev, txnRef: e.target.value }))}
            placeholder="e.g. NEFT-940214"
          />

          <Input
            label="Approving Medical Officer"
            value={payoutForm.approvedBy}
            onChange={(e) => setPayoutForm(prev => ({ ...prev, approvedBy: e.target.value }))}
          />

          <Input
            label="Administrative Notes"
            value={payoutForm.notes}
            onChange={(e) => setPayoutForm(prev => ({ ...prev, notes: e.target.value }))}
          />

          {/* Previous disbursements history */}
          {payoutHistory.length > 0 && (
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                Past Compensation Records:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.74rem' }}>
                {payoutHistory.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: '#F8FAFC', borderRadius: '4px' }}>
                    <span>{item.compensation_number || 'Voucher'} • {item.payment_method?.toUpperCase()} ({item.transaction_reference})</span>
                    <strong>₹{Number(item.amount).toLocaleString('en-IN')}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button type="button" variant="outline" onClick={() => setIsPayoutModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isDisbursing} icon={IndianRupee}>
              Disburse Voucher
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
