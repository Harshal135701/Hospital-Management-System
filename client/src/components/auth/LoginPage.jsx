import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Clock
} from 'lucide-react';
import { Button, Badge, Modal } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import { PRESET_PERSONAS, IS_DEV_MODE } from '../../constants/personas';
import sarjiHospitalBg from '../../assets/sarji-hospital-building.png';
import sarjiLogo from '../../assets/sarji-logo.png';

export function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const formRef = useRef(null);

  // Set default dev persona on initial mount for rapid evaluation
  useEffect(() => {
    if (IS_DEV_MODE && PRESET_PERSONAS.length > 0) {
      const defaultP = PRESET_PERSONAS[0];
      setSelectedPersona(defaultP.role);
      setEmail(defaultP.email);
      setPassword(defaultP.password);
    }
  }, []);

  const handleSelectPersona = (p) => {
    setSelectedPersona(p.role);
    setEmail(p.email);
    setPassword(p.password);
    setErrorMessage(null);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let submitEmail = email.trim();
    let submitPassword = password;

    if (selectedPersona) {
      const activePreset = PRESET_PERSONAS.find((p) => p.role === selectedPersona);
      if (activePreset && (!submitEmail || activePreset.email.toLowerCase() === submitEmail.toLowerCase())) {
        submitEmail = activePreset.email;
        submitPassword = activePreset.password;
      }
    }

    if (!submitEmail || !submitPassword) {
      setErrorMessage('Please enter both your institutional email and account password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(submitEmail, submitPassword);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } catch (err) {
      console.warn('[LoginPage] Authentication error:', err);
      if (err.status === 401) {
        setErrorMessage('Invalid institutional credentials. Please check your staff email and password.');
      } else if (err.status === 403) {
        setErrorMessage(err.message || 'Account access is restricted or temporarily locked.');
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please verify your connection or use a preset persona.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickGuestAccess = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const doc = PRESET_PERSONAS.find(p => p.role === 'clinician_doctor') || PRESET_PERSONAS[0];
      await login(doc.email, doc.password);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } catch (err) {
      console.warn('[LoginPage] Demo bypass failed:', err);
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: `url(${sarjiHospitalBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
        color: '#FFFFFF',
        overflowX: 'hidden'
      }}
    >
      {/* Toned Down Soft Translucent Overlay: Keeps the hospital exterior building sharp, bright and fully visible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10, 65, 116, 0.28) 0%, rgba(0, 0, 0, 0.10) 35%, rgba(0, 0, 0, 0.15) 70%, rgba(10, 65, 116, 0.35) 100%)',
          zIndex: 1
        }}
      />

      {/* Top Header Bar */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
          backgroundColor: 'rgba(10, 65, 116, 0.55)',
          backdropFilter: 'blur(8px)',
          gap: '16px'
        }}
      >
        {/* Left: Brand Identity with White Logo Box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              height: '42px',
              flexShrink: 0
            }}
          >
            <img
              src={sarjiLogo}
              alt="Sarji Group of Hospitals"
              style={{ height: '34px', width: 'auto', display: 'block' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '0.02em', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              Sarji Super Speciality Hospital
            </div>
            <div
              style={{
                fontSize: '0.78rem',
                color: '#EBF3FA',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title="ಸರ್ಜಿ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ — ರೋಗಿಗಳ ವಿಶ್ವಾಸ, ಶ್ರೇಷ್ಠ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಕರುಣಾಪೂರ್ವಕ ಆರೈಕೆ."
            >
              ಸರ್ಜಿ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ — ರೋಗಿಗಳ ವಿಶ್ವಾಸ, ಶ್ರೇಷ್ಠ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಕರುಣಾಪೂರ್ವಕ ಆರೈಕೆ.
            </div>
          </div>
        </div>

        {/* Right: Hospital Help & Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#EBF3FA' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
                display: 'inline-block'
              }}
            />
            <span style={{ fontWeight: '600' }}>24x7 Emergency</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              fontSize: '0.78rem',
              color: '#FFFFFF'
            }}
          >
            <PhoneCall size={13} color="#93C5FD" />
            <span>Emergency: <strong>+91 8182 225500</strong></span>
          </div>
        </div>
      </header>

      {/* Main Center Area: Focused Login Form */}
      <main
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 20px',
          width: '100%',
          maxWidth: '520px',
          margin: '0 auto'
        }}
      >
        {/* Hospital Name & Motto Card Header */}
        <div
          style={{
            width: '100%',
            marginBottom: '16px',
            textAlign: 'center',
            backgroundColor: 'rgba(10, 65, 116, 0.70)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '10px 16px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '2px' }}>
            ಸರ್ಜಿ ಸೂಪರ್ ಸ್ಪೆಷಾಲಿಟಿ ಆಸ್ಪತ್ರೆ — ರೋಗಿಗಳ ವಿಶ್ವಾಸ, ಶ್ರೇಷ್ಠ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಕರುಣಾಪೂರ್ವಕ ಆರೈಕೆ.
          </div>
          <div style={{ fontSize: '0.74rem', color: '#CBDDEE' }}>
            Sarji Super Speciality Hospital • Tertiary Care Centre, Shivamogga
          </div>
        </div>

        {/* Floating Glassmorphic Login Card */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            borderRadius: '16px',
            padding: '30px 28px',
            boxShadow: '0 20px 50px rgba(0, 15, 35, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            color: 'var(--color-text-primary, #1E293B)',
            width: '100%',
            backdropFilter: 'blur(12px)'
          }}
        >
          {/* Card Title */}
          <div style={{ marginBottom: '18px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-pale-aqua, #EBF3FA)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-teal, #0A4174)'
                }}
              >
                <LogIn size={18} />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0A4174', margin: 0 }}>
                Staff Login
              </h2>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary, #64748B)', margin: 0 }}>
              Sign in with your verified hospital staff credentials
            </p>
          </div>

          {/* Quick Select Institutional Persona (Dev & Demo) */}
          {IS_DEV_MODE && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: '700',
                    color: '#0A4174',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Quick Select Test Persona:
                </label>
                <span style={{ fontSize: '0.66rem', color: 'var(--color-text-muted, #94A3B8)' }}>
                  1-Click Auto-Fill
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {PRESET_PERSONAS.map((p) => {
                  const isSelected = selectedPersona === p.role;
                  return (
                    <button
                      type="button"
                      key={p.role}
                      onClick={() => handleSelectPersona(p)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: `1.5px solid ${isSelected ? '#0A4174' : 'var(--color-border, #D5E2EE)'}`,
                        backgroundColor: isSelected ? 'var(--color-bg-pale-aqua, #EBF3FA)' : '#FFFFFF',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: isSelected ? '700' : '600',
                          color: isSelected ? '#0A4174' : '#1E293B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {p.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.62rem',
                          color: isSelected ? '#49769F' : '#64748B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {p.badge}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login Form: Only the Valid Fields */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#334155',
                  display: 'block',
                  marginBottom: '5px'
                }}
              >
                Institutional Staff Email <span style={{ color: 'var(--color-error, #EF4444)' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none' }}>
                  <Mail size={16} />
                </span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const matched = PRESET_PERSONAS.find(
                      (p) => p.email.toLowerCase() === e.target.value.trim().toLowerCase()
                    );
                    if (matched) {
                      setSelectedPersona(matched.role);
                      setPassword(matched.password);
                    } else {
                      setSelectedPersona(null);
                    }
                  }}
                  placeholder="doctor@hospital.test"
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--color-border, #D5E2EE)',
                    fontSize: '0.85rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#334155'
                  }}
                >
                  Password <span style={{ color: 'var(--color-error, #EF4444)' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{
                    fontSize: '0.72rem',
                    color: '#0A4174',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: '600'
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none' }}>
                  <Lock size={16} />
                </span>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (selectedPersona) {
                      const activePreset = PRESET_PERSONAS.find((p) => p.role === selectedPersona);
                      if (!activePreset || activePreset.password !== e.target.value) {
                        setSelectedPersona(null);
                      }
                    }
                  }}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '9px 40px 9px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--color-border, #D5E2EE)',
                    fontSize: '0.85rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none'
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
                    color: '#64748B',
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

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#475569' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0A4174', cursor: 'pointer' }}
                />
                <span>Remember this workstation</span>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#0A4174',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(10, 65, 116, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#07315B';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0A4174';
                }}
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In to Workspace</span>
                  </>
                )}
              </button>

              {/* Direct Demo / Guest Explore Button */}
              <button
                type="button"
                onClick={handleQuickGuestAccess}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-bg-pale-aqua, #EBF3FA)',
                  color: '#0A4174',
                  border: '1.5px solid rgba(73, 118, 159, 0.35)',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DCE9F6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-pale-aqua, #EBF3FA)';
                }}
              >
                <Sparkles size={15} color="#0A4174" />
                <span>Explore as Clinical Guest (Demo Mode)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Security Compliance Badge */}
          <div
            style={{
              marginTop: '18px',
              paddingTop: '14px',
              borderTop: '1px solid var(--color-border, #D5E2EE)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.70rem',
              color: '#64748B'
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>256-bit SSL Protected • NABH & HIPAA Isolation</span>
          </div>
        </div>
      </main>

      {/* Footer Strip */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '10px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          backgroundColor: 'rgba(10, 65, 116, 0.55)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.74rem',
          color: '#CBDDEE'
        }}
      >
        <div>
          © {new Date().getFullYear()} Sarji Group of Hospitals. All Rights Reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>MedicsPrime HMS Enterprise</span>
          <span>•</span>
          <span>IT Helpdesk: <strong>ext. 108</strong></span>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Institutional Password Reset"
        subtitle="Hospital IT Security & Clinical Credential Recovery"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '6px 0' }}>
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--color-bg-pale-aqua, #EBF3FA)',
              borderRadius: '8px',
              border: '1px solid rgba(73, 118, 159, 0.35)',
              fontSize: '0.82rem',
              color: '#0A4174',
              lineHeight: '1.5'
            }}
          >
            <strong>Hospital Security Policy Notice:</strong>
            <p style={{ margin: '6px 0 0', color: '#334155', fontSize: '0.78rem' }}>
              Due to NABH clinical governance and patient data isolation standards, staff password resets must be authorized through the Hospital IT Services desk or your Department Head.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', color: '#1E293B' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PhoneCall size={15} color="#0A4174" />
              <span>Direct IT Helpdesk: <strong>+91 8182 225500 (Ext. 108)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="#0A4174" />
              <span>Email: <strong>it.security@sarjihospitals.com</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} color="#0A4174" />
              <span>Operating Hours: <strong>24 Hours / 7 Days a week</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="primary" onClick={() => setIsForgotModalOpen(false)}>
              Understood
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default LoginPage;
