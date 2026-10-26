import React, { useState } from 'react';
import {
  CheckCircle2,
  Save,
  Lock
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../common/UIPrimitives';

export function UserProfilePreferencesDesk({ activeSubtab = '30.1', onNavigateSubmodule: _onNavigateSubmodule }) {
  const [notification, setNotification] = useState('');

  // Profile Form state (30.1)
  const [profile, setProfile] = useState({
    name: 'Dr. Arindam Mitra',
    email: 'arindam.mitra@medicsprime.com',
    phone: '+91 98301 88412',
    designation: 'Senior Consultant Physician',
    councilReg: 'WBMC-54210',
    specialty: 'Internal Medicine & Critical Care'
  });

  // Password state (30.2)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Active branch & role (30.3 & 30.4)
  const [activeBranch, setActiveBranch] = useState('Main Tertiary Hospital Campus (Salt Lake)');
  const [activeRole, setActiveRole] = useState('Consultant Physician');
  const [uiTheme, setUiTheme] = useState('Hospital Professional (Teal & Cyan)');
  const [tableDensity, setTableDensity] = useState('Compact Clinical');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('User profile details updated successfully.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert('Please fill current and new password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password changed successfully. Active token refreshed.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1.5px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#166534',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} color="#16A34A" />
          <span>{notification}</span>
        </div>
      )}

      {/* SUBMODULE 30.1: Manage Profile */}
      {activeSubtab === '30.1' && (
        <Card
          title="30.1 Manage Staff Professional Profile"
          subtitle="User biographical details, Medical Council registration numbers, clinical qualifications, and official email"
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
            <Input
              label="Full Name & Title"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Official Hospital Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
              <Input
                label="Registered Mobile Contact"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Hospital Designation"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
              />
              <Input
                label="State Medical Council Reg. #"
                value={profile.councilReg}
                onChange={(e) => setProfile({ ...profile, councilReg: e.target.value })}
              />
            </div>
            <Input
              label="Primary Specialty & Sub-specialty"
              value={profile.specialty}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <Button type="submit" variant="primary" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.2: Change Password & Security */}
      {activeSubtab === '30.2' && (
        <Card
          title="30.2 Change Password & Authentication Security"
          subtitle="Hospital portal credentials update, multi-factor authentication (MFA) tokens, and session security"
        >
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '440px' }}>
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
            <Input
              label="New Strong Password (Min 8 chars, 1 uppercase, 1 symbol)"
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••••••"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <Button type="submit" variant="primary" icon={Lock}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.3: Switch Active Hospital Branch */}
      {activeSubtab === '30.3' && (
        <Card
          title="30.3 Switch Active Hospital Branch Context"
          subtitle="Multi-hospital campus workstation environment switcher (routes patient queues, beds, and billing to active branch)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
            <Select
              label="Active Facility / Campus"
              value={activeBranch}
              onChange={(e) => {
                setActiveBranch(e.target.value);
                showToast(`Switched active hospital campus context to: ${e.target.value}`);
              }}
              options={[
                { value: 'Main Tertiary Hospital Campus (Salt Lake)', label: 'Main Tertiary Hospital Campus (Salt Lake)' },
                { value: 'North City Multispeciality Center (Rajarhat)', label: 'North City Multispeciality Center (Rajarhat)' },
                { value: 'South City Trauma & Dialysis Annex (Jadavpur)', label: 'South City Trauma & Dialysis Annex (Jadavpur)' }
              ]}
            />
            <div style={{ padding: '12px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
              Currently Active: <strong>{activeBranch}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.4: Switch Active Role */}
      {activeSubtab === '30.4' && (
        <Card
          title="30.4 Switch Active Clinical / Administrative Role"
          subtitle="Switch between assigned user privileges (e.g. Chief Consultant Physician vs Duty Emergency Lead)"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
            <Select
              label="Active User Operating Role"
              value={activeRole}
              onChange={(e) => {
                setActiveRole(e.target.value);
                showToast(`Active operational role switched to: ${e.target.value}`);
              }}
              options={[
                { value: 'Consultant Physician', label: 'Consultant Physician (OPD / IPD EMR Authoring)' },
                { value: 'Emergency Duty Lead', label: 'Emergency Duty Lead (Triage & MLC Authorization)' },
                { value: 'Clinical Audit Supervisor', label: 'Clinical Audit Supervisor (Read-only Quality Review)' }
              ]}
            />
            <div style={{ padding: '12px 14px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
              Currently Operating As: <strong>{activeRole}</strong>
            </div>
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.5: User UI Preferences & Theme */}
      {activeSubtab === '30.5' && (
        <Card
          title="30.5 User UI Preferences & Table Density"
          subtitle="Custom table row compacting, font size adjustments, and color theme preferences"
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', maxWidth: '640px' }}>
            <Select
              label="Color Theme"
              value={uiTheme}
              onChange={(e) => {
                setUiTheme(e.target.value);
                showToast(`Theme preference updated.`);
              }}
              options={[
                { value: 'Hospital Professional (Teal & Cyan)', label: 'Hospital Professional (Teal & Cyan)' },
                { value: 'Clinical Minimalist (Slate & Blue)', label: 'Clinical Minimalist (Slate & Blue)' },
                { value: 'High Contrast (Navy & Gold)', label: 'High Contrast (Navy & Gold)' }
              ]}
            />
            <Select
              label="Table Density"
              value={tableDensity}
              onChange={(e) => {
                setTableDensity(e.target.value);
                showToast(`Table density preference updated.`);
              }}
              options={[
                { value: 'Compact Clinical', label: 'Compact Clinical (Optimized for high-density desks)' },
                { value: 'Standard Spaced', label: 'Standard Spaced (Touch-friendly tablets)' }
              ]}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
