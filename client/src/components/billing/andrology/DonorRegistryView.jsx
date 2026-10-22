import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Filter,
  FileText,
  Calendar,
  Lock,
  Archive,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../../common/UIPrimitives';
import { INITIAL_DONOR_REGISTRY } from '../common/billingMockData';
import { formatDateIN } from '../../../utils/formatters';

export function DonorRegistryView() {
  const [donors, setDonors] = useState(INITIAL_DONOR_REGISTRY);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  // New Donor Registration Form State
  const [donorForm, setDonorForm] = useState({
    donorCode: `DONOR-SP-0${Math.floor(50 + Math.random() * 40)}`,
    category: 'Sperm Donor',
    regDate: new Date().toISOString().slice(0, 10),
    age: 27,
    bloodGroup: 'B+ (Positive)',
    education: 'Graduate / Professional',
    physicalTraits: 'Height: 176 cm, Eyes: Black, Skin: Fair',
    screeningStatus: 'Under 180-Day Quarantine',
    consentStatus: 'Signed ART Bank Agreement',
    inventoryVials: 6,
    storageLocation: 'Tank Beta / Canister 02',
    status: 'Quarantined (Retest Due in 6 Months)'
  });

  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      const q = searchFilter.toLowerCase();
      const matchSearch =
        d.donorCode.toLowerCase().includes(q) ||
        d.bloodGroup.toLowerCase().includes(q) ||
        d.education.toLowerCase().includes(q) ||
        d.storageLocation.toLowerCase().includes(q);

      const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [donors, searchFilter, categoryFilter]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newD = {
      ...donorForm,
      id: `dnr-${Date.now()}`,
      serology: {
        hiv: 'Non-Reactive (Initial Screen)',
        hbsag: 'Non-Reactive',
        hcv: 'Non-Reactive',
        vdrl: 'Non-Reactive',
        karyotype: '46,XY Normal Male Banding',
        thalassemia: 'Normal'
      },
      lastDonation: new Date().toISOString().slice(0, 10)
    };

    setDonors(prev => [newD, ...prev]);
    setIsRegisterModalOpen(false);
    setSuccessBanner(`Donor ${newD.donorCode} registered in registry with strict identity masking.`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleViewDossier = (donor) => {
    setSelectedDonor(donor);
    setIsDossierModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Module Overview Banner */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Badge variant="teal" size="sm">Submodule 1.4</Badge>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
              Assisted Reproductive Donor Registry
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Compliant ART Act donor profiles, infectious serology quarantine tracking, notarized consent audit, and cryo inventory balance.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Register New Donor
        </Button>
      </div>

      {/* Statutory Compliance Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.78rem',
          color: '#374151'
        }}
      >
        <Lock size={16} style={{ flexShrink: 0, color: 'var(--color-primary-teal)' }} />
        <span>
          <strong>ART Act Statutory Privacy Protection:</strong> Real donor demographic identities are strictly masked in clinical interfaces. Only permitted donor identifiers (e.g. DONOR-SP-042), phenotypic traits, and validated genetic/serology clearances are displayed.
        </span>
      </div>

      {successBanner && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-success)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'Sperm Donor', 'Oocyte Donor'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: categoryFilter === cat ? '1px solid var(--color-primary-teal)' : '1px solid var(--color-border)',
                backgroundColor: categoryFilter === cat ? 'var(--color-primary-teal)' : '#FFFFFF',
                color: categoryFilter === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {cat === 'all' ? 'All Donor Categories' : cat}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by code, blood group, traits..."
            icon={Search}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Donors Registry Table */}
      <Card title="Registered Donors Master Ledger">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--color-border)', backgroundColor: '#F9FAFB' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Donor Code</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Category & Traits</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Blood Group / Age</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Screening & Clearance</th>
                <th style={{ textAlign: 'center', padding: '10px' }}>Inventory in Tank</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Registration Date</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonors.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary-teal)' }}>{d.donorCode}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Status: {d.status}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{d.category}</div>
                    <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>{d.physicalTraits}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: '600' }}>{d.bloodGroup}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{d.age} Years • {d.education}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <Badge variant={d.screeningStatus.includes('Cleared') ? 'success' : 'warning'} size="sm">
                      {d.screeningStatus}
                    </Badge>
                    <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '3px' }}>{d.consentStatus}</div>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <Badge variant="teal" size="sm">
                      {d.inventoryVials} Vials
                    </Badge>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{d.storageLocation}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div>{formatDateIN(d.regDate)}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Last: {formatDateIN(d.lastDonation)}</div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '10px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDossier(d)}
                    >
                      Dossier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Registration Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Certified ART Donor (Confidential Protocol)"
        size="lg"
      >
        <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <Input
              label="Assigned Donor Identifier"
              value={donorForm.donorCode}
              onChange={(e) => setDonorForm({ ...donorForm, donorCode: e.target.value })}
              required
            />
            <div>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Donor Category
              </label>
              <select
                value={donorForm.category}
                onChange={(e) => setDonorForm({ ...donorForm, category: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
              >
                <option value="Sperm Donor">Sperm Donor</option>
                <option value="Oocyte Donor">Oocyte Donor</option>
                <option value="Embryo Donor">Embryo Donor</option>
              </select>
            </div>
            <Input
              label="Donor Age (18 - 35 yrs)"
              type="number"
              min="18"
              max="45"
              value={donorForm.age}
              onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
              required
            />
            <Input
              label="Blood Group & Rh Factor"
              value={donorForm.bloodGroup}
              onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
              required
            />
            <Input
              label="Education Qualification"
              value={donorForm.education}
              onChange={(e) => setDonorForm({ ...donorForm, education: e.target.value })}
              required
            />
            <Input
              label="Phenotypic / Physical Traits"
              value={donorForm.physicalTraits}
              onChange={(e) => setDonorForm({ ...donorForm, physicalTraits: e.target.value })}
              required
            />
            <Input
              label="Initial Cryo Straws / Vials"
              type="number"
              min="1"
              max="30"
              value={donorForm.inventoryVials}
              onChange={(e) => setDonorForm({ ...donorForm, inventoryVials: e.target.value })}
              required
            />
            <Input
              label="Storage Tank & Canister"
              value={donorForm.storageLocation}
              onChange={(e) => setDonorForm({ ...donorForm, storageLocation: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px' }}>
            <Button variant="outline" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save to Donor Registry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Donor Dossier Modal */}
      <Modal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        title="Confidential Donor Dossier & Screening Verification"
        size="md"
      >
        {selectedDonor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', backgroundColor: '#F0FDFA', borderRadius: '4px', border: '1px solid #CCFBF1' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                {selectedDonor.donorCode}
              </div>
              <div style={{ color: '#4B5563' }}>
                {selectedDonor.category} • {selectedDonor.bloodGroup} • Age: {selectedDonor.age}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div><strong>Education:</strong> {selectedDonor.education}</div>
              <div><strong>Traits:</strong> {selectedDonor.physicalTraits}</div>
              <div><strong>Registration Date:</strong> {formatDateIN(selectedDonor.regDate)}</div>
              <div><strong>Last Donation:</strong> {formatDateIN(selectedDonor.lastDonation)}</div>
              <div><strong>Storage Location:</strong> {selectedDonor.storageLocation}</div>
              <div><strong>Available Vials:</strong> {selectedDonor.inventoryVials} Straws</div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#111827' }}>Infectious Disease & Genetic Screening:</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '0.78rem' }}>
                <div>HIV 1 & 2: <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.hiv || 'Non-Reactive'}</span></div>
                <div>HBsAg (Hep B): <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.hbsag || 'Non-Reactive'}</span></div>
                <div>HCV (Hep C): <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.hcv || 'Non-Reactive'}</span></div>
                <div>VDRL (Syphilis): <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.vdrl || 'Non-Reactive'}</span></div>
                <div>Karyotype: <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.karyotype || '46,XY Normal'}</span></div>
                <div>Thalassemia HPLC: <span style={{ color: '#059669', fontWeight: '600' }}>{selectedDonor.serology?.thalassemia || 'Normal'}</span></div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '10px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>Consent & Legal Clearances:</div>
              <div style={{ padding: '8px', backgroundColor: '#F9FAFB', borderRadius: '4px', fontSize: '0.75rem', color: '#4B5563' }}>
                {selectedDonor.consentStatus}. Legal parental waiver and anonymity agreements executed under the Indian Assisted Reproductive Technology (Regulation) Act, 2021.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsDossierModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
