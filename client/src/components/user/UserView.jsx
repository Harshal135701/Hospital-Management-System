import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Building,
  Briefcase,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  Laptop,
  Check,
  Edit2,
  Save,
  RefreshCw,
  LogOut,
  MapPin,
  Building2,
  QrCode,
  Volume2,
  LayoutGrid,
  FileCheck,
  History,
  Info
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, Select } from '../common/UIPrimitives';
import {
  USER_SUBMODULES,
  INITIAL_USER_PROFILE,
  HOSPITAL_BRANCHES,
  ASSIGNED_ROLES,
  TRUSTED_DEVICES
} from './userConstants';

export function UserView({ initialSubtab = '30.1', initialSubsubtab = null, onNavigate }) {
  const [activeSubtab, setActiveSubtab] = useState(() => {
    if (initialSubtab && initialSubtab.startsWith('30.')) return initialSubtab;
    return '30.1';
  });

  const [activeSubsubtab, setActiveSubsubtab] = useState(() => {
    if (initialSubsubtab) return initialSubsubtab;
    const parent = USER_SUBMODULES.find(s => s.id === (initialSubtab || '30.1'));
    return parent?.subsubmodules[0]?.id || '30.1.1';
  });

  useEffect(() => {
    if (initialSubtab) {
      const cleanSub = initialSubtab.replace('user:', '');
      if (USER_SUBMODULES.some(s => s.id === cleanSub)) {
        setActiveSubtab(cleanSub);
      }
    }
    if (initialSubsubtab) {
      setActiveSubsubtab(initialSubsubtab);
    }
  }, [initialSubtab, initialSubsubtab]);

  const handleSelectSubtab = (subId, subsubId = null) => {
    setActiveSubtab(subId);
    const targetSubsub = subsubId || USER_SUBMODULES.find(s => s.id === subId)?.subsubmodules[0]?.id || `${subId}.1`;
    setActiveSubsubtab(targetSubsub);
    if (typeof onNavigate === 'function') {
      onNavigate(`user:${subId}:${targetSubsub}`);
    }
  };

  const handleSelectSubsubtab = (subsubId) => {
    setActiveSubsubtab(subsubId);
    if (typeof onNavigate === 'function') {
      onNavigate(`user:${activeSubtab}:${subsubId}`);
    }
  };

  // State: Profile Form
  const [profile, setProfile] = useState(INITIAL_USER_PROFILE);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(INITIAL_USER_PROFILE);

  // State: Password & 2FA
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [trustedDevices, setTrustedDevices] = useState(TRUSTED_DEVICES);

  // State: Branch Switching
  const [branches, setBranches] = useState(HOSPITAL_BRANCHES);
  const currentBranch = branches.find(b => b.isCurrent) || branches[0];

  // State: Roles
  const [roles, setRoles] = useState(ASSIGNED_ROLES);
  const currentRole = roles.find(r => r.isCurrent) || roles[0];

  // State: Preferences
  const [themeMode, setThemeMode] = useState('corporate-blue');
  const [uiDensity, setUiDensity] = useState('comfortable');
  const [defaultWorkspace, setDefaultWorkspace] = useState('opd');
  const [soundAlerts, setSoundAlerts] = useState({
    panicValues: true,
    codeBlue: true,
    medicationAlerts: true,
    chatPings: false
  });

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Branch Switch Handler
  const handleSwitchBranch = (branchId) => {
    setBranches(prev => prev.map(b => ({
      ...b,
      isCurrent: b.id === branchId
    })));
    const target = branches.find(b => b.id === branchId);
    triggerToast(`Active Hospital Campus successfully switched to "${target?.name}". EMR & Inventory synced.`);
  };

  // Role Switch Handler
  const handleSwitchRole = (roleId) => {
    setRoles(prev => prev.map(r => ({
      ...r,
      isCurrent: r.id === roleId
    })));
    const target = roles.find(r => r.id === roleId);
    triggerToast(`Active Persona switched to "${target?.name}". Workstation scope re-authenticated.`);
  };

  // Device Revoke Handler
  const handleRevokeDevice = (deviceId) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    triggerToast(`Device session ${deviceId} revoked immediately.`);
  };

  // Save Profile Handler
  const handleSaveProfile = () => {
    setProfile(profileDraft);
    setIsEditingProfile(false);
    triggerToast('User Profile & Clinical Credentials updated successfully.');
  };

  const activeSubmoduleObj = USER_SUBMODULES.find(s => s.id === activeSubtab) || USER_SUBMODULES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            backgroundColor: '#0A4174',
            color: '#FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(10, 65, 116, 0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
            fontWeight: '600',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Module Header Card */}
      <Card
        style={{
          padding: '20px 24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(10, 65, 116, 0.15)',
                flexShrink: 0
              }}
            >
              <User size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0A4174', margin: 0, letterSpacing: '-0.02em' }}>
                  User Management & Personal Security
                </h1>
                <Badge variant="teal">Module 30</Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
                Personal credentials, digital prescription signature, 2FA authorization, multi-branch campus switcher, and custom UI preferences.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                border: '1px solid rgba(73, 118, 159, 0.35)',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#0A4174'
              }}
            >
              <Building2 size={14} color="#0A4174" />
              <span>Campus: <strong>{currentBranch.code}</strong></span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #10B981',
                fontSize: '0.78rem',
                fontWeight: '600',
                color: '#065F46'
              }}
            >
              <Shield size={14} color="#10B981" />
              <span>Role: <strong>{currentRole.name}</strong></span>
            </div>
          </div>
        </div>

        {/* Clean, Non-Cluttered Dropdown Selectors */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-border)'
          }}
        >
          {/* Submodule Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Submodule:
            </span>
            <select
              value={activeSubtab}
              onChange={(e) => handleSelectSubtab(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                color: '#0A4174',
                fontWeight: '700',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {USER_SUBMODULES.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.id} {sub.label}
                </option>
              ))}
            </select>
          </div>

          {/* Workflow / Subsubmodule Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Workflow:
            </span>
            <select
              value={activeSubsubtab}
              onChange={(e) => handleSelectSubsubtab(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1.5px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                fontWeight: '600',
                fontSize: '0.84rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {activeSubmoduleObj.subsubmodules.map(ss => (
                <option key={ss.id} value={ss.id}>
                  {ss.id} {ss.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean Horizontal Submodule Navigation Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {USER_SUBMODULES.map(sub => {
            const isActive = activeSubtab === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleSelectSubtab(sub.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isActive ? '1.5px solid #0A4174' : '1px solid var(--color-border)',
                  backgroundColor: isActive ? '#0A4174' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{sub.id}</span>
                <span>{sub.label}</span>
                {sub.badge && (
                  <span
                    style={{
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.22)' : 'var(--color-bg-pale-aqua)',
                      color: isActive ? '#FFFFFF' : '#0A4174',
                      fontWeight: '600'
                    }}
                  >
                    {sub.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subsubmodule action badges / pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '4px' }}>
          {activeSubmoduleObj.subsubmodules.map(ss => {
            const isSsActive = activeSubsubtab === ss.id;
            return (
              <button
                key={ss.id}
                type="button"
                onClick={() => handleSelectSubsubtab(ss.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: isSsActive ? '1px solid #49769F' : '1px solid #E2E8F0',
                  backgroundColor: isSsActive ? 'var(--color-bg-pale-aqua)' : '#F8FAFC',
                  color: isSsActive ? '#0A4174' : '#64748B',
                  fontSize: '0.76rem',
                  fontWeight: isSsActive ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isSsActive ? '#0A4174' : '#CBD5E1'
                  }}
                />
                <span>{ss.id} {ss.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* SUBMODULE 30.1: MANAGE PROFILE */}
      {activeSubtab === '30.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 30.1.1: Personal & Professional Profile */}
          {(activeSubsubtab === '30.1.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: 0 }}>
                    30.1.1 Personal & Professional Clinical Profile
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                    NABH practitioner verified credentials and medical council registration data.
                  </p>
                </div>
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setProfileDraft(profile);
                      setIsEditingProfile(true);
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#49769F', color: '#0A4174' }}
                  >
                    <Edit2 size={15} />
                    <span>Edit Profile Details</span>
                  </Button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                    <Button
                      variant="teal"
                      onClick={handleSaveProfile}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0A4174' }}
                    >
                      <Save size={15} />
                      <span>Save Changes</span>
                    </Button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={isEditingProfile ? profileDraft.fullName : profile.fullName}
                    onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isEditingProfile ? '#FFFFFF' : '#F8FAFC',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Kannada Practitioner Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={isEditingProfile ? profileDraft.kannadaName : profile.kannadaName}
                    onChange={(e) => setProfileDraft({ ...profileDraft, kannadaName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isEditingProfile ? '#FFFFFF' : '#F8FAFC',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Medical Council Reg No (KMC / MCI)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.councilRegNo}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F1F5F9',
                      fontWeight: '600',
                      color: '#475569'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Clinical Designation
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={isEditingProfile ? profileDraft.designation : profile.designation}
                    onChange={(e) => setProfileDraft({ ...profileDraft, designation: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isEditingProfile ? '#FFFFFF' : '#F8FAFC',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Department & Facility
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.department}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F1F5F9',
                      fontWeight: '600',
                      color: '#475569'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Official Email ID
                  </label>
                  <input
                    type="email"
                    disabled={!isEditingProfile}
                    value={isEditingProfile ? profileDraft.email : profile.email}
                    onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isEditingProfile ? '#FFFFFF' : '#F8FAFC',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Mobile Number (SMS Alerts)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={isEditingProfile ? profileDraft.mobile : profile.mobile}
                    onChange={(e) => setProfileDraft({ ...profileDraft, mobile: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: isEditingProfile ? '#FFFFFF' : '#F8FAFC',
                      fontWeight: '600',
                      color: '#0F172A'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.bloodGroup}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#F1F5F9',
                      fontWeight: '600',
                      color: '#475569'
                    }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* 30.1.2: Digital Signature & Seal */}
          {activeSubsubtab === '30.1.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.1.2 Digital Prescription Signature & Clinical Seal
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Authenticated cryptographic signature stamped onto e-prescriptions, lab verifications, and discharge summaries.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Preview Box */}
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1.5px dashed #49769F',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '240px',
                      height: '80px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'cursive',
                      fontSize: '1.4rem',
                      color: '#0A4174',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)'
                    }}
                  >
                    Dr. R. N. Rao
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#475569' }}>
                    <strong>{profile.fullName}</strong><br />
                    <span>{profile.designation}</span><br />
                    <span style={{ color: '#0A4174', fontWeight: '600' }}>{profile.councilRegNo}</span>
                  </div>
                  <Badge variant="teal">Digitally Verified Seal</Badge>
                </div>

                {/* Signature Security PIN & Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Lock size={16} color="#0A4174" />
                      <strong style={{ fontSize: '0.85rem', color: '#0A4174' }}>4-Digit Signature PIN Protection</strong>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 10px' }}>
                      Required prior to dispatching high-risk opioid prescriptions and OT discharge summaries.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="password"
                        placeholder="••••"
                        maxLength={4}
                        defaultValue="9841"
                        style={{
                          width: '90px',
                          padding: '6px 12px',
                          textAlign: 'center',
                          letterSpacing: '4px',
                          borderRadius: '6px',
                          border: '1px solid var(--color-border)',
                          fontWeight: '700'
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => triggerToast('Signature PIN updated successfully.')}
                        style={{ fontSize: '0.78rem' }}
                      >
                        Update PIN
                      </Button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="outline"
                      onClick={() => triggerToast('Drawing canvas ready. Draw your electronic signature.')}
                      style={{ flex: 1, borderColor: '#49769F', color: '#0A4174', fontSize: '0.82rem' }}
                    >
                      Redraw Signature
                    </Button>
                    <Button
                      variant="teal"
                      onClick={() => triggerToast('Sample e-Prescription seal test generated.')}
                      style={{ flex: 1, backgroundColor: '#0A4174', fontSize: '0.82rem' }}
                    >
                      Test Stamp Print
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 30.1.3: Emergency Contact & Next of Kin */}
          {activeSubsubtab === '30.1.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.1.3 Emergency Contact & Next of Kin Registry
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Mandatory hospital HR record for urgent medical communications, night duty emergencies, and trauma notifications.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.emergencyContact.name}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Relationship
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.emergencyContact.relation}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Primary Emergency Mobile
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.emergencyContact.mobile}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Alternate Mobile / Landline
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.emergencyContact.alternateMobile}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Residential Address (Shivamogga Local)
                  </label>
                  <input
                    type="text"
                    defaultValue={profile.emergencyContact.residentialAddress}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', fontWeight: '600' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="teal"
                  onClick={() => triggerToast('Emergency Contact records updated in Hospital HR master.')}
                  style={{ backgroundColor: '#0A4174' }}
                >
                  Save Emergency Contacts
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 30.2: CHANGE PASSWORD & SECURITY */}
      {activeSubtab === '30.2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 30.2.1: Password Reset */}
          {(activeSubsubtab === '30.2.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.2.1 Password Reset & 90-Day Rotation Policy
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Complying with NABH Digital Health Guidelines: Passwords expire every 90 days and require min 10 characters with mixed cases and symbols.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '800px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Current Master Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 10 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              {/* Password strength indicator */}
              <div style={{ marginTop: '14px', maxWidth: '400px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginBottom: '4px' }}>
                  <span>Password Complexity:</span>
                  <span style={{ color: newPassword.length >= 10 ? '#10B981' : '#F59E0B' }}>
                    {newPassword.length >= 10 ? 'Strong (NABH Compliant)' : 'Needs 10+ Characters'}
                  </span>
                </div>
                <div style={{ height: '6px', width: '100%', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: newPassword.length >= 10 ? '100%' : newPassword.length > 5 ? '60%' : '20%',
                      backgroundColor: newPassword.length >= 10 ? '#10B981' : '#F59E0B',
                      transition: 'width 0.2s ease'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="teal"
                  onClick={() => {
                    if (!newPassword || newPassword !== confirmPassword) {
                      triggerToast('Error: Passwords do not match or field is blank.');
                      return;
                    }
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    triggerToast('Password rotated successfully. All active sessions re-authenticated.');
                  }}
                  style={{ backgroundColor: '#0A4174' }}
                >
                  Update & Rotate Password
                </Button>
              </div>
            </Card>
          )}

          {/* 30.2.2: Two-Factor Authentication */}
          {activeSubsubtab === '30.2.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: 0 }}>
                    30.2.2 Two-Factor Authentication (2FA / TOTP)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
                    Time-based One-Time Password via Google Authenticator, Microsoft Authenticator, or SMS OTP.
                  </p>
                </div>
                <Badge variant={twoFactorEnabled ? 'teal' : 'warning'}>
                  {twoFactorEnabled ? '2FA ACTIVE & ENFORCED' : '2FA DISABLED'}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-pale-aqua)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <QrCode size={22} color="#0A4174" />
                    <strong style={{ fontSize: '0.9rem', color: '#0A4174' }}>Authenticator App (TOTP)</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    Scan the hospital QR code on your mobile authenticator to generate 6-digit rolling clinical codes.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerToast('TOTP QR code display refreshed.')}
                    style={{ borderColor: '#49769F', color: '#0A4174', marginTop: '6px' }}
                  >
                    View QR Pairing Code
                  </Button>
                </div>

                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Smartphone size={22} color="#0A4174" />
                    <strong style={{ fontSize: '0.9rem', color: '#0A4174' }}>SMS Backup Delivery</strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    Emergency fall-back code dispatched to <strong>{profile.mobile}</strong> if authenticator app is unavailable.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerToast('Test SMS OTP sent to registered doctor mobile.')}
                    style={{ color: '#0A4174', marginTop: '6px' }}
                  >
                    Send Test SMS OTP
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* 30.2.3: Active Trusted Devices */}
          {activeSubsubtab === '30.2.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.2.3 Registered Trusted Workstations & Clinical Tablets
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Hardware fingerprints authorized to access Sarji EMR and LIS workstations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trustedDevices.map((device) => (
                  <div
                    key={device.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: device.isCurrentSession ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: device.isCurrentSession ? '#0A4174' : '#E2E8F0',
                          color: device.isCurrentSession ? '#FFFFFF' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {device.deviceType.includes('Mobile') || device.deviceType.includes('Tablet') ? (
                          <Smartphone size={20} />
                        ) : (
                          <Laptop size={20} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>{device.name}</strong>
                          {device.isCurrentSession && <Badge variant="teal">Current Workstation</Badge>}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                          <span>{device.location}</span> • <span>IP: {device.ipAddress}</span> • <span>{device.browser}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748B' }}>{device.lastActive}</span>
                      {!device.isCurrentSession && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRevokeDevice(device.id)}
                          style={{ fontSize: '0.76rem' }}
                        >
                          Revoke Device
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 30.3: SWITCH ACTIVE HOSPITAL BRANCH */}
      {activeSubtab === '30.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 30.3.1: Active Campus Selection */}
          {(activeSubsubtab === '30.3.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.3.1 Sarji Group Hospital Network — Active Campus Selection
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Switching active branch dynamically re-routes your active ward rosters, local pharmacy stores, and bed matrices.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {branches.map((branch) => {
                  const isActive = branch.isCurrent;
                  return (
                    <div
                      key={branch.id}
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        border: isActive ? '2px solid #0A4174' : '1px solid var(--color-border)',
                        backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                        boxShadow: isActive ? '0 4px 14px rgba(10, 65, 116, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#0A4174', backgroundColor: 'rgba(73, 118, 159, 0.18)', padding: '2px 8px', borderRadius: '4px' }}>
                            {branch.code}
                          </span>
                          {isActive ? (
                            <Badge variant="teal">ACTIVE CAMPUS</Badge>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{branch.city}</span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>
                          {branch.name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#0A4174', fontWeight: '600', marginBottom: '6px' }}>
                          {branch.kannadaName}
                        </div>
                        <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '0 0 10px', lineHeight: 1.4 }}>
                          {branch.address}
                        </p>

                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: '#334155', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
                          <span><strong>{branch.totalBeds}</strong> Total Beds</span>
                          <span>•</span>
                          <span><strong>{branch.activeIcuBeds}</strong> ICU Beds</span>
                          <span>•</span>
                          <span><strong>{branch.doctorsOnDuty}</strong> Doctors On Duty</span>
                        </div>
                      </div>

                      <div>
                        {isActive ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#0A4174' }}>
                            <CheckCircle2 size={16} color="#10B981" />
                            <span>Currently Connected</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchBranch(branch.id)}
                            style={{ width: '100%', borderColor: '#49769F', color: '#0A4174', fontWeight: '700' }}
                          >
                            Switch to this Campus
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 30.3.2: Department & Ward Accessibility */}
          {activeSubsubtab === '30.3.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.3.2 Department & Ward Accessibility Matrix — {currentBranch.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Physical wards, operation theatres, and diagnostic suites unlocked for your clinician ID at this campus.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {[
                  { name: 'Cardiology Cath Lab #1 & #2', status: 'Full Access', type: 'Procedure Suite' },
                  { name: 'Cardiac ICU (CICU) - Wing C', status: 'Full Access', type: 'Critical Care' },
                  { name: 'General Cardiac OPD - Cabin 12', status: 'Assigned Desk', type: 'Outpatient' },
                  { name: 'Cardio-Thoracic OT #4', status: 'Surgical Access', type: 'Operation Theatre' },
                  { name: 'Central Pharmacy - Store #1', status: 'Indent Requisition Only', type: 'Supply Chain' },
                  { name: 'Automated LIS Laboratory Desk', status: 'Order & Sign-off Only', type: 'Diagnostics' }
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0A4174', marginBottom: '2px' }}>{item.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748B' }}>
                      <span>{item.type}</span>
                      <span style={{ color: '#10B981', fontWeight: '600' }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 30.3.3: Branch Switch Audit Log */}
          {activeSubsubtab === '30.3.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.3.3 Campus Transition & Session Transfer Audit Trail
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Immutable log of doctor branch context switches for medical-legal jurisdiction compliance.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-pale-aqua)', borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', color: '#0A4174' }}>Timestamp</th>
                      <th style={{ padding: '10px 14px', color: '#0A4174' }}>Source Campus</th>
                      <th style={{ padding: '10px 14px', color: '#0A4174' }}>Target Campus</th>
                      <th style={{ padding: '10px 14px', color: '#0A4174' }}>Auth Token</th>
                      <th style={{ padding: '10px 14px', color: '#0A4174' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: '2026-10-27 08:30:14', from: 'Sarji City Clinic (SCDC)', to: 'Sarji Super Speciality (SSSH)', token: 'JWT-8841-A', status: 'Successful Transfer' },
                      { time: '2026-10-26 14:12:00', from: 'Sarji Multi-Speciality (SMSA)', to: 'Sarji Super Speciality (SSSH)', token: 'JWT-7912-B', status: 'Successful Transfer' },
                      { time: '2026-10-25 09:00:22', from: 'Sarji Super Speciality (SSSH)', to: 'Sarji Mother & Child (SMCH)', token: 'JWT-6521-C', status: 'Successful Transfer' }
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 14px', color: '#334155' }}>{row.time}</td>
                        <td style={{ padding: '10px 14px', color: '#64748B' }}>{row.from}</td>
                        <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0A4174' }}>{row.to}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#475569' }}>{row.token}</td>
                        <td style={{ padding: '10px 14px' }}>
                          <Badge variant="teal">{row.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 30.4: SWITCH ACTIVE ROLE */}
      {activeSubtab === '30.4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 30.4.1: Multi-Role Persona Switcher */}
          {(activeSubsubtab === '30.4.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.4.1 Assigned Persona Roles & Privilege Switcher
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Seamlessly toggle between Senior Consultant clinician duties, Head of Department approvals, and Acute Trauma overrides.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {roles.map((role) => {
                  const isCurrent = role.isCurrent;
                  return (
                    <div
                      key={role.id}
                      style={{
                        padding: '18px',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #0A4174' : '1px solid var(--color-border)',
                        backgroundColor: isCurrent ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <Badge variant={isCurrent ? 'teal' : 'neutral'}>{role.securityLevel}</Badge>
                          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Valid: {role.validUntil}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>
                          {role.name}
                        </h4>
                        <div style={{ fontSize: '0.78rem', color: '#0A4174', fontWeight: '600', marginBottom: '8px' }}>
                          {role.department}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, margin: 0 }}>
                          {role.scope}
                        </p>
                      </div>

                      <div>
                        {isCurrent ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '700', color: '#0A4174' }}>
                            <CheckCircle2 size={16} color="#10B981" />
                            <span>Currently Assumed Persona</span>
                          </div>
                        ) : (
                          <Button
                            variant="teal"
                            size="sm"
                            onClick={() => handleSwitchRole(role.id)}
                            style={{ width: '100%', backgroundColor: '#0A4174' }}
                          >
                            Assume this Role
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 30.4.2: Temporary Delegated Authority */}
          {activeSubsubtab === '30.4.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.4.2 Temporary Delegated Authority (Acting Charge Handover)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Delegate clinical sign-off, ward rounds authorization, or department indents to a peer doctor during annual leave or conference travel.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '800px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Delegate Authority To (Clinician)
                  </label>
                  <select style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
                    <option>Dr. Shruthi Hegde (Consultant Cardiologist - Reg: KMC-88123)</option>
                    <option>Dr. Vinay Kumar (Associate Consultant - Reg: KMC-99412)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Delegation Effective From
                  </label>
                  <input type="date" defaultValue="2026-10-28" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Delegation Effective Until
                  </label>
                  <input type="date" defaultValue="2026-11-04" style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Clinical Handover Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific instructions regarding unstable CICU inpatients and pending lab cultures..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Button
                  variant="teal"
                  onClick={() => triggerToast('Delegated Authority signed and dispatched to Medical Superintendent.')}
                  style={{ backgroundColor: '#0A4174' }}
                >
                  Confirm & Sign Delegation Handover
                </Button>
              </div>
            </Card>
          )}

          {/* 30.4.3: Role Privilege Matrix Inspector */}
          {activeSubsubtab === '30.4.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.4.3 Active Persona Privilege Matrix Inspector
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 16px' }}>
                Current operative authorization for: <strong>{currentRole.name}</strong> ({currentRole.department}).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {[
                  'CPOE Digital Medicine Prescription',
                  'Cath Lab Cardiac Stent Order Approval',
                  'IPD Final Clinical Discharge Authorization',
                  'Panic Value Critical Lab Acknowledgment',
                  'Emergency STEMI STAT Blood Bank Release',
                  'Peer Review & Morbidity Audit Signing'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', backgroundColor: 'var(--color-bg-pale-aqua)', border: '1px solid rgba(73, 118, 159, 0.25)' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#0A4174' }}>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* SUBMODULE 30.5: USER UI PREFERENCES & THEME */}
      {activeSubtab === '30.5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 30.5.1: Visual Theme & Display Density */}
          {(activeSubsubtab === '30.5.1' || !activeSubsubtab) && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.5.1 Visual Theme Palette & Display Density
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Tailor the workstation color scheme and data density for high-throughput OPD cabins or dark OT suites.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Theme Option 1 */}
                <div
                  onClick={() => {
                    setThemeMode('corporate-blue');
                    triggerToast('Theme set to: Sarji Corporate Navy (#0A4174 & Light Blue).');
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: themeMode === 'corporate-blue' ? '2px solid #0A4174' : '1px solid var(--color-border)',
                    backgroundColor: themeMode === 'corporate-blue' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#0A4174' }} />
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#49769F' }} />
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#EBF3FA', border: '1px solid #CBD5E1' }} />
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#0A4174' }}>Sarji Corporate Navy (Default)</strong>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '4px 0 0' }}>Clean hospital blue palette with high readability.</p>
                </div>

                {/* Theme Option 2 */}
                <div
                  onClick={() => {
                    setThemeMode('high-contrast');
                    triggerToast('Theme set to: Clinical High-Contrast.');
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: themeMode === 'high-contrast' ? '2px solid #0A4174' : '1px solid var(--color-border)',
                    backgroundColor: themeMode === 'high-contrast' ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#0F172A' }} />
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#0284C7' }} />
                    <span style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: '#F8FAFC', border: '1px solid #CBD5E1' }} />
                  </div>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Clinical High-Contrast</strong>
                  <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '4px 0 0' }}>Maximized text edges for diagnostic reading.</p>
                </div>

                {/* Density Option */}
                <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#F8FAFC' }}>
                  <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                    Table & Form Density
                  </strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant={uiDensity === 'compact' ? 'teal' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setUiDensity('compact');
                        triggerToast('Display density switched to Compact.');
                      }}
                      style={{ fontSize: '0.76rem', backgroundColor: uiDensity === 'compact' ? '#0A4174' : undefined }}
                    >
                      Compact
                    </Button>
                    <Button
                      variant={uiDensity === 'comfortable' ? 'teal' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setUiDensity('comfortable');
                        triggerToast('Display density switched to Comfortable.');
                      }}
                      style={{ fontSize: '0.76rem', backgroundColor: uiDensity === 'comfortable' ? '#0A4174' : undefined }}
                    >
                      Comfortable
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 30.5.2: Startup Workspace */}
          {activeSubsubtab === '30.5.2' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.5.2 Default Startup Module & Clinical Workspace
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Choose which hospital station opens immediately upon biometric or password workstation login.
              </p>

              <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={defaultWorkspace}
                  onChange={(e) => {
                    setDefaultWorkspace(e.target.value);
                    triggerToast(`Default startup station saved as: ${e.target.value.toUpperCase()}.`);
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg-pale-aqua)',
                    color: '#0A4174',
                    fontWeight: '700',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="opd">Module 22 — OPD Consultation Desk</option>
                  <option value="nursing">Module 21 — Inpatient Ward Nursing Workstation</option>
                  <option value="ot">Module 23 — Operation Theatre & PACU</option>
                  <option value="laboratory">Module 19 — LIS Diagnostic Analyzer Desk</option>
                  <option value="pharmacy">Module 25 — Hospital Pharmacy Dispensation</option>
                  <option value="billing">Module 4 — Hospital Billing POS & Cashier</option>
                  <option value="dashboard">Executive Command Center Dashboard</option>
                </select>

                <Button
                  variant="teal"
                  onClick={() => triggerToast(`Startup module preferences synced to cloud.`)}
                  style={{ backgroundColor: '#0A4174' }}
                >
                  Save Startup Preference
                </Button>
              </div>
            </Card>
          )}

          {/* 30.5.3: Notification Audio */}
          {activeSubsubtab === '30.5.3' && (
            <Card style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0A4174', margin: '0 0 8px' }}>
                30.5.3 Auditory Chimes & Clinical Alarm Audio
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 20px' }}>
                Configure sound frequency and speaker output for life-critical alerts vs standard notifications.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
                {[
                  { key: 'panicValues', title: 'Critical Panic Value Alert Chime', desc: 'Loud double-tone buzzer when lab result exceeds panic thresholds (e.g. Potassium > 6.0).' },
                  { key: 'codeBlue', title: 'Emergency STEMI & Code Blue Sirens', desc: 'Hospital-wide critical broadcast sound override for cardiac arrests.' },
                  { key: 'medicationAlerts', title: 'Inpatient MAR Due Chime', desc: 'Gentle notification when scheduled IV doses are due in assigned ward.' },
                  { key: 'chatPings', title: 'Inter-Department Chat Pings', desc: 'Audible chirp on internal consultant messaging.' }
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: soundAlerts[item.key] ? 'var(--color-bg-pale-aqua)' : '#FFFFFF'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0A4174' }}>{item.title}</strong>
                      <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0' }}>{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundAlerts[item.key]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSoundAlerts(prev => ({ ...prev, [item.key]: checked }));
                        triggerToast(`${item.title} ${checked ? 'enabled' : 'muted'}.`);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0A4174' }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
