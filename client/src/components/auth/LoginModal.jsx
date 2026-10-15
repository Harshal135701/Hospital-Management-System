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
import { PRESET_PERSONAS, IS_DEV_MODE } from '../../constants/personas';
export { PRESET_PERSONAS, IS_DEV_MODE };

export function LoginModal() {
  const { isLoginModalOpen, loginModalMessage, closeLoginModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const formRef = React.useRef(null);

  // Synchronize modal state when opened, and reset cleanly on close
  useEffect(() => {
    if (isLoginModalOpen) {
      if (IS_DEV_MODE) {
        const defaultPersona = PRESET_PERSONAS[0];
        setSelectedPersona(defaultPersona.role);
        setEmail(defaultPersona.email);
        setPassword(defaultPersona.password);

        if (formRef.current) {
          if (formRef.current.elements?.email) {
            formRef.current.elements.email.value = defaultPersona.email;
          }
          if (formRef.current.elements?.password) {
            formRef.current.elements.password.value = defaultPersona.password;
          }
        }
      } else {
        setSelectedPersona(null);
        setEmail('');
        setPassword('');
      }

      setErrorMessage(null);
      setShowPassword(false);
      setIsSubmitting(false);
    } else {
      setSelectedPersona(null);
      setEmail('');
      setPassword('');
      setErrorMessage(null);
      setShowPassword(false);
      setIsSubmitting(false);

      if (formRef.current) {
        if (formRef.current.elements?.email) {
          formRef.current.elements.email.value = '';
        }
        if (formRef.current.elements?.password) {
          formRef.current.elements.password.value = '';
        }
      }
    }
  }, [isLoginModalOpen]);

  const handleSelectPersona = (p) => {
    setSelectedPersona(p.role);
    setEmail(p.email);
    setPassword(p.password);
    setErrorMessage(null);

    if (formRef.current) {
      if (formRef.current.elements?.email) {
        formRef.current.elements.email.value = p.email;
      }
      if (formRef.current.elements?.password) {
        formRef.current.elements.password.value = p.password;
      }
    }
  };

  const handleClose = () => {
    setSelectedPersona(null);
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setShowPassword(false);
    setIsSubmitting(false);
    closeLoginModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const domEmail = form.elements?.email?.value;
    const domPassword = form.elements?.password?.value;

    let submittedEmail = (typeof domEmail === 'string' && domEmail.trim().length > 0)
      ? domEmail.trim()
      : email.trim();

    let submittedPassword = (typeof domPassword === 'string' && domPassword.length > 0)
      ? domPassword
      : password;

    // If an institutional persona is currently active, ensure its documented development password is used
    // protecting against stale browser autofill or DOM desynchronization
    if (selectedPersona) {
      const activePreset = PRESET_PERSONAS.find((p) => p.role === selectedPersona);
      if (activePreset && (!submittedEmail || activePreset.email.toLowerCase() === submittedEmail.toLowerCase())) {
        submittedEmail = activePreset.email;
        submittedPassword = activePreset.password;
      }
    }

    if (!submittedEmail || !submittedPassword) {
      setErrorMessage('Please enter both your institutional email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(submittedEmail, submittedPassword);
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
      onClose={handleClose}
      maxWidth="580px"
      title="Institutional Staff Authentication"
      subtitle="Sign in with your verified hospital staff credentials to access protected clinical workspaces."
    >
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        autoComplete="off"
        style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
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

        {/* Quick Institutional Role Preset Switcher (Dev & Demo environments only) */}
        {IS_DEV_MODE && (
          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
              Quick Select Institutional Persona (Dev / Demo):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {PRESET_PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.role;
                return (
                  <button
                    type="button"
                    key={p.role}
                    onClick={() => handleSelectPersona(p)}
                    aria-pressed={isSelected}
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
        )}

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="login-staff-email" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)', display: 'block', marginBottom: '6px' }}>
              Institutional Staff Email <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <Mail size={16} />
              </span>
              <input
                id="login-staff-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  const matched = PRESET_PERSONAS.find(
                    (p) => p.email.toLowerCase() === val.trim().toLowerCase()
                  );
                  if (matched) {
                    setSelectedPersona(matched.role);
                    setPassword(matched.password);
                    if (formRef.current?.elements?.password) {
                      formRef.current.elements.password.value = matched.password;
                    }
                  } else {
                    setSelectedPersona(null);
                  }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-staff-password" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                Account Password <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              {IS_DEV_MODE && selectedPersona && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-teal)', fontWeight: '500' }}>
                  Auto-filled from development persona
                </span>
              )}
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                <Lock size={16} />
              </span>
              <input
                id="login-staff-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                data-lpignore="true"
                data-1p-ignore="true"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (selectedPersona) {
                    const activePreset = PRESET_PERSONAS.find((p) => p.role === selectedPersona);
                    if (!activePreset || activePreset.password !== val) {
                      setSelectedPersona(null);
                    }
                  }
                }}
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
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
          <Button variant="ghost" onClick={handleClose}>
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
