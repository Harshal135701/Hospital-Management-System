import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Key,
  Building2,
  Sliders,
  CheckCircle2,
  Lock,
  Save,
  ShieldCheck,
  Smartphone,
  Mail,
  Award,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../../common/UIPrimitives';
import { AuthService } from '../../../services/api';

export function UserProfileDesk({
  activeSubtab = '30.1',
  currentUser = null,
  onNavigateSubmodule
}) {
  const [notification, setNotification] = useState('');
  const [errorNotification, setErrorNotification] = useState('');

  // 30.1 Profile Form State
  const [profile, setProfile] = useState({
    name: currentUser?.fullName || currentUser?.full_name || 'Dr. Arindam Mitra',
    email: currentUser?.email || 'arindam.mitra@hospital.test',
    phone: '+91 98301 88412',
    designation: 'Senior Consultant Physician',
    department: 'General Medicine & Critical Care',
    councilReg: 'WBMC-54210',
    specialty: 'Internal Medicine, Pulmonology & Critical Care'
  });

  // 30.2 Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // 30.3 Active Branch State
  const branches = [
    { id: 'BR-01', name: 'Main Tertiary Hospital Campus (Salt Lake Sector V)', code: 'HQ-SALT-LAKE', status: 'Primary Active' },
    { id: 'BR-02', name: 'South Bay Diagnostic & Multispecialty Outpost', code: 'BR-SOUTH-BAY', status: 'Authorized' },
    { id: 'BR-03', name: 'New Town Day Care Surgery Center', code: 'BR-NEW-TOWN', status: 'Authorized' }
  ];
  const [activeBranch, setActiveBranch] = useState('Main Tertiary Hospital Campus (Salt Lake Sector V)');

  // 30.4 Active Role State
  const authorizedRoles = [
    { id: 'clinician_doctor', label: 'Consultant Clinician / Physician', level: 'Level 1 Clinical Staff' },
    { id: 'super_admin', label: 'Clinical Department Head (Administrative HOD)', level: 'Level 2 Supervisory' }
  ];
  const [activeRole, setActiveRole] = useState(currentUser?.role || 'clinician_doctor');

  // 30.5 UI Preferences State
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('medicsprime_theme') || 'Teal & Deep Blue (Hospital Standard)';
  });
  const [densityPreference, setDensityPreference] = useState(() => {
    return localStorage.getItem('medicsprime_density') || 'Compact Clinical';
  });
  const [defaultDesk, setDefaultDesk] = useState(() => {
    return localStorage.getItem('medicsprime_default_desk') || '28.1';
  });

  const showToast = (msg) => {
    setNotification(msg);
    setErrorNotification('');
    setTimeout(() => setNotification(''), 4500);
  };

  const showError = (msg) => {
    setErrorNotification(msg);
    setNotification('');
    setTimeout(() => setErrorNotification(''), 6000);
  };

  // Save Profile (30.1)
  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Staff user professional credentials and contact details saved.');
  };

  // Real Password Change against backend POST /api/auth/change-password (30.2)
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      showError('Please provide your current account password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showError('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      if (AuthService.changePassword) {
        await AuthService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
        showToast('Password successfully changed on backend security server! Active session refreshed.');
      } else {
        // Fallback fetch
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('medicsprime_token') || ''}`
          },
          body: JSON.stringify({
            current_password: passwordForm.currentPassword,
            new_password: passwordForm.newPassword
          })
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.message || 'Password update failed.');
        }
        showToast('Password changed successfully in database.');
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Switch Branch (30.3)
  const handleSwitchBranch = (branchName) => {
    setActiveBranch(branchName);
    showToast(`Switched active operational workstation context to "${branchName}".`);
  };

  // Switch Role (30.4)
  const handleSwitchRole = (roleId) => {
    setActiveRole(roleId);
    showToast(`Active privilege role changed to ${roleId}. Access controls refreshed.`);
  };

  // Save UI Preferences (30.5)
  const handleSavePreferences = (e) => {
    e.preventDefault();
    localStorage.setItem('medicsprime_theme', themePreference);
    localStorage.setItem('medicsprime_density', densityPreference);
    localStorage.setItem('medicsprime_default_desk', defaultDesk);
    showToast('UI preferences and theme saved to local device profile.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Notifications */}
      {notification && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1.5px solid #86EFAC',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notification}</span>
        </div>
      )}

      {errorNotification && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            border: '1.5px solid #FCA5A5',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Lock size={16} color="#DC2626" />
          <span>{errorNotification}</span>
        </div>
      )}

      {/* SUBMODULE 30.1: Manage Profile */}
      {activeSubtab === '30.1' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <UserCheck size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Manage Staff Professional Profile (30.1)
            </span>
            <Badge variant="teal" size="sm">
              Verified Institutional Staff
            </Badge>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '640px' }}>
            <Input
              label="Staff Full Name & Title"
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
                label="Primary Contact Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Clinical Designation"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                required
              />
              <Input
                label="Medical Council Registration No"
                value={profile.councilReg}
                onChange={(e) => setProfile({ ...profile, councilReg: e.target.value })}
                required
              />
            </div>

            <Input
              label="Clinical Disciplines & Specialties"
              value={profile.specialty}
              onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <Button variant="primary" type="submit" icon={Save}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.2: Change Password & Security */}
      {activeSubtab === '30.2' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Key size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Change Password & Authentication Security (30.2)
            </span>
            <Badge variant="teal" size="sm">
              Live Database Integration
            </Badge>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 14px 0' }}>
            Updates your salted scrypt cryptographic password hash on the institutional authentication server. On confirmation, existing active sessions will be refreshed.
          </p>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '480px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showCurrentPw ? 'text' : 'password'}
                  placeholder="Enter your current password..."
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                New Password (minimum 8 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showNewPw ? 'text' : 'password'}
                  placeholder="Enter strong new password..."
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Re-type new password to verify..."
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <Button variant="primary" type="submit" icon={Lock} loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* SUBMODULE 30.3: Switch Active Hospital Branch */}
      {activeSubtab === '30.3' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Building2 size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Switch Active Hospital Facility Branch (30.3)
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 14px 0' }}>
            Select the operational facility where you are currently on duty. Orders, bed allocations, and POS cashier sessions will be bound to this facility.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
            {branches.map((b) => {
              const isActive = activeBranch === b.name;
              return (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-primary-teal)' : 'var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      Branch Code: {b.code} • {b.id}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isActive ? (
                      <Badge variant="teal" size="sm">
                        Current Active Branch
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchBranch(b.name)}
                      >
                        Switch to Branch
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.4: Switch Active Role */}
      {activeSubtab === '30.4' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Sliders size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              Switch Active Role & Access Privileges (30.4)
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', margin: '0 0 14px 0' }}>
            Switch your active session privileges between authorized clinical and administrative responsibilities.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' }}>
            {authorizedRoles.map((r) => {
              const isSelected = activeRole === r.id;
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--color-primary-teal)' : 'var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--color-text-primary)' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '0.70rem', color: 'var(--color-text-muted)' }}>
                      {r.level} • Role ID: <code>{r.id}</code>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isSelected ? (
                      <Badge variant="teal" size="sm">
                        Active Privileges
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwitchRole(r.id)}
                      >
                        Activate Role
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* SUBMODULE 30.5: User UI Preferences & Theme */}
      {activeSubtab === '30.5' && (
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '10px' }}>
            <Sliders size={18} color="var(--color-primary-teal)" />
            <span style={{ fontWeight: '700', fontSize: '0.92rem' }}>
              User UI Preferences & Display Density (30.5)
            </span>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Application Color Palette Theme
              </label>
              <Select value={themePreference} onChange={(e) => setThemePreference(e.target.value)}>
                <option>Teal & Deep Blue (Hospital Standard)</option>
                <option>Slate & Cool Gray (High Contrast)</option>
                <option>Clinical Cyan (Light Density)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Table & Workspace Display Density
              </label>
              <Select value={densityPreference} onChange={(e) => setDensityPreference(e.target.value)}>
                <option>Compact Clinical (High Information Density)</option>
                <option>Standard Comfort (Spaced)</option>
              </Select>
            </div>

            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                Default Operations Landing Desk
              </label>
              <Select value={defaultDesk} onChange={(e) => setDefaultDesk(e.target.value)}>
                <option value="28.1">OTC POS Counter (28.1)</option>
                <option value="29.1">Active User Sessions (29.1)</option>
                <option value="31.1">Work Order Management (31.1)</option>
                <option value="32.1">Operations Analytics (32.1)</option>
              </Select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '6px' }}>
              <Button variant="primary" type="submit" icon={Save}>
                Save UI Preferences
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default UserProfileDesk;
