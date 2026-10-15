import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertOctagon,
  UserCheck,
  Activity,
  X
} from 'lucide-react';
import { Modal, Button, Input, Badge } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

const PRESET_PERSONAS = [
  {
    role: 'blood_bank_officer',
    title: 'Blood Bank Officer',
    email: 'bbo@hospital.test',
    password: 'BBO#Secure2026!',
    badge: 'Dual-Gate Authority'
  },
  {
    role: 'lab_technician',
    title: 'Lab Technician',
    email: 'tech@hospital.test',
    password: 'Tech#Pass2026!',
    badge: 'Serology & Processing'
  },
  {
    role: 'phlebotomist',
    title: 'Phlebotomist',
    email: 'phleb@hospital.test',
    password: 'Phleb#Pass2026!',
    badge: 'Donor & Collection'
  },
  {
    role: 'clinician_doctor',
    title: 'Clinician / Doctor',
    email: 'doctor@hospital.test',
    password: 'Doc#Pass2026!',
    badge: 'Requisitions & PIN Release'
  },
  {
    role: 'receptionist',
    title: 'Receptionist',
    email: 'reception@hospital.test',
    password: 'Recept#Pass2026!',
    badge: 'Patient Registry'
  },
  {
    role: 'super_admin',
    title: 'Super Admin',
    email: 'admin@hospital.test',
    password: 'Admin#Pass2026!',
    badge: 'System Admin'
  }
];

export function LoginModal() {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  // Default to Blood Bank Officer preset when opening modal if empty
  useEffect(() => {
    if (isLoginModalOpen && !email) {
      const defaultPersona = PRESET_PERSONAS[0];
      setEmail(defaultPersona.email);
      setPassword(defaultPersona.password);
      setSelectedPersona(defaultPersona.role);
      setErrorMessage(null);
    }
  }, [isLoginModalOpen]);

  const handleSelectPersona = (p) => {
    setSelectedPersona(p.role);
    setEmail(p.email);
    setPassword(p.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err.status === 401) {
        setErrorMessage('Invalid institutional credentials. Please verify your email and password.');
      } else if (err.status === 403) {
        setErrorMessage(err.message || 'Account access is restricted or temporarily locked.');
      } else if (err.status === 429) {
        setErrorMessage('Too many login attempts. Please wait 60 seconds before trying again.');
      } else {
        setErrorMessage(err.message || 'Failed to authenticate with backend server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={closeLoginModal}
      maxWidth="580px"
      title="Institutional Staff Authentication"
      subtitle="Sign in with your verified hospital staff credentials to access protected clinical workspaces."
    >
      <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Prompt / Notification Banner */}
        {loginModalMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239, 131, 84, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 131, 84, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: 'var(--font-size-xs)',
              color: '#C05621'
            }}
          >
            <Lock size={16} style={{ flexShrink: 0 }} />
            <span>{loginModalMessage}</span>
          </div>
        )}

        {/* Quick Institutional Role Preset Switcher */}
        <div>
          <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
            Quick Select Institutional Persona:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {PRESET_PERSONAS.map((p) => {
              const isSelected = selectedPersona === p.role || email === p.email;
              return (
                <button
                  type="button"
                  key={p.role}
                  onClick={() => handleSelectPersona(p)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${isSelected ? 'var(--color-primary-teal)' : 'var(--color-border)'}`,
                    backgroundColor: isSelected ? 'var(--color-bg-pale-aqua)' : '#FFFFFF',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: isSelected ? 'var(--color-primary-teal)' : 'var(--color-text-primary)' }}>
                      {p.title}
                    </span>
                    <Badge variant={isSelected ? 'success' : 'neutral'} size="sm">
                      {p.role.split('_')[0]}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {p.email}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Institutional Staff Email <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSelectedPersona(null);
                }}
                placeholder="staff@hospital.test"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Account Password <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '9px 40px 9px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-error-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-error)'
            }}
          >
            <AlertOctagon size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="ghost" onClick={closeLoginModal}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            icon={ShieldCheck}
          >
            Sign In to Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}
