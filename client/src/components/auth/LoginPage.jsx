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
  Clock,
  Building2,
  CheckCircle2,
  HelpCircle,
  User
} from 'lucide-react';
import { Button, Badge, Modal } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';
import { PRESET_PERSONAS, IS_DEV_MODE } from '../../constants/personas';
import sarjiHospitalBg from '../../assets/sarji-hospital-building.png';
import sarjiLogo from '../../assets/sarji-logo.png';

const HOSPITAL_BRANCHES = [
  { id: 'main', name: 'Sarji Super Speciality Hospital — Main Campus (Shivamogga)' },
  { id: 'multispeciality', name: 'Sarji Multi Speciality Hospital — Tilak Nagar' },
  { id: 'diagnostics', name: 'Sarji Diagnostic & Imaging Institute — Shivamogga' },
  { id: 'womens_care', name: 'Sarji Fertility & Women Care Centre — Shivamogga' }
];

export function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const formRef = useRef(null);

  // Set default dev persona on initial mount for rapid evaluation in dev mode
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
        setErrorMessage(err.message || 'Account access is restricted or temporarily locked. Please contact Hospital IT.');
      } else {
        setErrorMessage(err.message || 'Authentication service unavailable. Please check your network connection.');
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
      console.warn('[LoginPage] Demo access fallback:', err);
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
        fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
        color: '#FFFFFF',
        overflowX: 'hidden'
      }}
    >
      {/* Subtle Healthcare Gradient Scrim Overlay:
          Balances hospital architecture visibility with high contrast readability for login form */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(10, 45, 80, 0.62) 0%, rgba(10, 65, 116, 0.40) 45%, rgba(10, 35, 65, 0.68) 100%)',
          zIndex: 1
        }}
      />

      {/* Top Enterprise Header */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.22)',
          backgroundColor: 'rgba(10, 65, 116, 0.65)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Brand Identity with White Logo Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '4px 10px',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
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
            <div style={{ fontSize: '0.96rem', fontWeight: '800', letterSpacing: '0.02em', color: '#FFFFFF', whiteSpace: 'nowrap' }}>
              Sarji Super Speciality Hospital
            </div>
            <div
              style={{
                fontSize: '0.76rem',
                color: '#D1E4F5',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title="Patient Trust, Clinical Excellence and Compassionate Care"
            >
              Patient Trust, Clinical Excellence and Compassionate Care
            </div>
          </div>
        </div>

        {/* Emergency Helpline & Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
            <span style={{ fontWeight: '600' }}>24x7 Emergency Services</span>
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

      {/* Main Center Area: Professional Hospital Staff Login Portal */}
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
        {/* Enterprise Login Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '32px 30px',
            boxShadow: '0 20px 50px rgba(0, 15, 35, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.8)',
            border: '1px solid #E2E8F0',
            color: '#1E293B',
            width: '100%'
          }}
        >
          {/* Card Title & Institutional Identity */}
          <div style={{ marginBottom: '22px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#EBF3FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A4174'
                }}
              >
                <LogIn size={20} />
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0A4174', margin: 0, letterSpacing: '-0.01em' }}>
                Staff Portal Sign In
              </h1>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '4px 0 0' }}>
              Sarji Group of Hospitals • Healthcare Information Management System
            </p>
          </div>

          {/* Quick Select Institutional Persona (Dev & Demo Evaluation Mode) */}
          {IS_DEV_MODE && (
            <div style={{ marginBottom: '18px', padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '0.70rem',
                    fontWeight: '700',
                    color: '#0A4174',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Quick Select Staff Persona:
                </span>
                <span style={{ fontSize: '0.66rem', color: '#64748B' }}>
                  1-Click Auto-Fill (Demo)
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
                        border: `1.5px solid ${isSelected ? '#0A4174' : '#CBD5E1'}`,
                        backgroundColor: isSelected ? '#EBF3FA' : '#FFFFFF',
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

          {/* Form Controls */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Hospital / Campus Branch Selector */}
            <div>
              <label
                htmlFor="login-branch"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  color: '#334155',
                  display: 'block',
                  marginBottom: '5px'
                }}
              >
                Hospital / Campus Branch <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <Building2 size={16} />
                </span>
                <select
                  id="login-branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.82rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {HOSPITAL_BRANCHES.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email / Username Field */}
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
                Username or Staff Email <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
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
                  placeholder="e.g. doctor@hospital.test or staff ID"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
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
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  style={{
                    fontSize: '0.74rem',
                    color: '#0A4174',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
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
                  placeholder="Enter your account password"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
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
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 0 4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: '#475569' }}>
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#0A4174', cursor: 'pointer', width: '15px', height: '15px' }}
                />
                <span>Remember this workstation</span>
              </label>
              <span style={{ fontSize: '0.70rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#10B981" />
                <span>Protected Session</span>
              </span>
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

            {/* Primary Sign In Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
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
                  boxShadow: '0 4px 12px rgba(10, 65, 116, 0.25)',
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

              {/* Direct Demo / Clinical Guest Explore Button */}
              <button
                type="button"
                onClick={handleQuickGuestAccess}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#EBF3FA',
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
                  e.currentTarget.style.backgroundColor = '#EBF3FA';
                }}
              >
                <Sparkles size={15} color="#0A4174" />
                <span>Explore as Clinical Guest (Demo Mode)</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>

          {/* Security Compliance Seal */}
          <div
            style={{
              marginTop: '20px',
              paddingTop: '14px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.70rem',
              color: '#64748B'
            }}
          >
            <ShieldCheck size={14} color="#10B981" />
            <span>NABH & HIPAA Compliant Healthcare System • 256-bit SSL Protection</span>
          </div>
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '10px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.18)',
          backgroundColor: 'rgba(10, 65, 116, 0.65)',
          backdropFilter: 'blur(8px)',
          fontSize: '0.74rem',
          color: '#D1E4F5'
        }}
      >
        <div>
          © {new Date().getFullYear()} Sarji Group of Hospitals. All Rights Reserved.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>MedicsPrime HMS Enterprise</span>
          <span>•</span>
          <span>Shivamogga, Karnataka</span>
          <span>•</span>
          <span>IT Helpdesk: <strong>Ext. 108</strong> (+91 8182 225500)</span>
        </div>
      </footer>

      {/* Forgot Password / Institutional Recovery Modal */}
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
              backgroundColor: '#EBF3FA',
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
