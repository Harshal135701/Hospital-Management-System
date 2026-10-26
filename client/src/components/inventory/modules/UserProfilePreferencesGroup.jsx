import React, { useState } from 'react';
import {
  CheckCircle2,
  Save
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../common/UIPrimitives';

export function UserProfilePreferencesGroup({ activeSubtab = '30.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [notification, setNotification] = useState('');

  // Profile Form state
  const [profile, setProfile] = useState({
    name: 'Dr. Arindam Mitra',
    email: 'arindam.mitra@medicsprime.com',
    phone: '+91 98301 88412',
    designation: 'Senior Consultant Physician',
    councilReg: 'WBMC-54210',
    specialty: 'Internal Medicine & Critical Care'
  });

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Active branch & role
  const [activeBranch, setActiveBranch] = useState('Main Tertiary Hospital Campus (Salt Lake)');
  const [activeRole, setActiveRole] = useState('Consultant Physician');
  const [uiTheme, setUiTheme] = useState('Hospital Professional (Teal & Cyan)');
  const [tableDensity, setTableDensity] = useState('Compact Clinical');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('User profile updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match or are empty.');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password changed successfully with 2FA re-verification.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div style={{
          backgroundColor: 'var(--color-primary-teal)',
          color: '#FFFFFF',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {notification}
        </div>
      )}

      {/* SUBMODULE 30.1: Manage Profile */}
      {activeSubtab === '30.1' && (
        <Card
          title="Staff User Profile & Medical Council Credentials"
          subtitle="Manage personal demographics, medical registration, and clinical specialty designation"
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '600px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Designation"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Official Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Contact Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Medical Council Registration No."
                value={profile.councilReg}
                onChange={(e) => setProfile({ ...profile, councilReg: e.target.value })}
              />
              <Input
                label="Specialty Discipline"
                value={profile.specialty}
                onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
              <Button variant="primary" icon={Save} type="submit">
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.2: Change Password & Security */}
      {activeSubtab === '30.2' && (
        <Card
          title="Change Password & Two-Factor Authentication (2FA)"
          subtitle="Manage secure credentials, FIDO2 hardware keys, and authentication logs"
        >
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '450px' }}>
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
              <Button variant="primary" type="submit">
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.3: Switch Active Hospital Branch */}
      {activeSubtab === '30.3' && (
        <Card
          title="Switch Active Hospital Branch Location"
          subtitle="Toggle operational workstation context across hospital branches and satellite centers"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
            <Select
              label="Active Operating Branch"
              value={activeBranch}
              onChange={(e) => {
                setActiveBranch(e.target.value);
                showToast(`Workstation context switched to ${e.target.value}!`);
              }}
              options={[
                'Main Tertiary Hospital Campus (Salt Lake)',
                'South City Multi-specialty Annex',
                'MedicsPrime Comprehensive Cancer Centre',
                'Park Street IVF & Fertility Satellite Centre'
              ]}
            />
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.4: Switch Active Role */}
      {activeSubtab === '30.4' && (
        <Card
          title="Switch Active Role & Clinical Privileges"
          subtitle="Switch between assigned clinical privileges (e.g. Attending Consultant vs Medical Superintendent)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '500px' }}>
            <Select
              label="Active User System Role"
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value);
                showToast(`Active privilege switched to ${e.target.value}!`);
              }}
              options={[
                'Consultant Physician',
                'Emergency On-Call Duty Officer',
                'Medical Superintendent (Administrative Reviewer)',
                'Clinical Audit Committee Member'
              ]}
            />
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.5: User UI Preferences & Theme */}
      {activeSubtab === '30.5' && (
        <Card
          title="User Interface Density & Clinical Display Theme"
          subtitle="Personalize table row heights, theme color accents, and auto-logout timers"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px' }}>
            <Select
              label="Color Theme"
              value={uiTheme}
              onChange={(e) => {
                setUiTheme(e.target.value);
                showToast(`Applied ${e.target.value}`);
              }}
              options={[
                'Hospital Professional (Teal & Cyan)',
                'High Contrast Clinical',
                'Soft Slate Blue'
              ]}
            />
            <Select
              label="Table Display Density"
              value={tableDensity}
              onChange={(e) => {
                setTableDensity(e.target.value);
                showToast(`Table density set to ${e.target.value}`);
              }}
              options={['Compact Clinical (High Density)', 'Standard Balanced', 'Comfortable Touch View']}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
