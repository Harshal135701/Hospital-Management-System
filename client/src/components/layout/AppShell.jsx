import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Building2,
  Bed,
  FlaskConical,
  Droplet,
  FileText,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Activity,
  LogOut,
  LogIn,
  Lock,
  User
} from 'lucide-react';
import { Badge, Button } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({
  currentRoute,
  onNavigate,
  children
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Operational Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients Master', icon: Users, badge: '4 New' },
    { id: 'appointments', label: 'Appointments & Schedule', icon: Calendar, badge: 'Today' },
    { id: 'doctors', label: 'Clinical Staff & Doctors', icon: UserCheck },
    { id: 'departments', label: 'Departments & Wings', icon: Building2 },
    { id: 'rooms', label: 'Beds & Inpatient Wards', icon: Bed },
    { id: 'lab', label: 'Laboratory Diagnostics', icon: FlaskConical },
    { id: 'bloodbank', label: 'Blood Bank Transfusion', icon: Droplet, highlight: true },
    { id: 'reports', label: 'Reports & Audit Logs', icon: FileText },
    { id: 'settings', label: 'System Configuration', icon: Settings }
  ];

  const handleSelectNav = (id) => {
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 50, 56, 0.4)',
            zIndex: 90,
            backdropFilter: 'blur(2px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isMobileMenuOpen ? 'translateX(0)' : undefined
        }}
        className="app-sidebar"
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 3px 8px rgba(8, 127, 140, 0.3)'
              }}
            >
              <Activity size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: 'var(--font-size-md)', color: 'var(--color-primary-teal)', letterSpacing: '-0.02em' }}>
                MedicsPrime
              </div>
              <div style={{ fontSize: '0.68rem', fontWeight: '500', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Hospital Management SaaS
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-close-btn"
            style={{ display: 'none', padding: '6px', color: 'var(--color-text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Hospital Info Pill */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-bg-pale-aqua)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(100, 216, 208, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-primary-teal)' }}>
                  Apex Central Hospital
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>
                  Main Clinical Campus
                </div>
              </div>
            </div>
            <ShieldCheck size={16} color="var(--color-primary-teal)" />
          </div>
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.05em' }}>
            Clinical & Operational
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                    color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                    fontWeight: isActive ? '600' : '500',
                    fontSize: 'var(--font-size-sm)',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(100, 216, 208, 0.4)' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                  className="nav-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color={isActive ? 'var(--color-primary-teal)' : 'inherit'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        fontWeight: '600',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'var(--color-primary-teal)' : '#EEF2F2',
                        color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {isAuthenticated && user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-teal)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {user.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.full_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                    {user.role ? user.role.replace(/_/g, ' ') : 'Staff'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => openLoginModal()}
                  style={{ color: 'var(--color-text-muted)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                  title="Switch Staff Account"
                >
                  <User size={16} />
                </button>
                <button
                  onClick={logout}
                  style={{ color: 'var(--color-error)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#E2E8F0',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                    Not Signed In
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    Public Terminal
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={LogIn}
                onClick={() => openLoginModal()}
                style={{ width: '100%' }}
              >
                Staff Login
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navigation Bar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-menu-trigger"
              style={{ display: 'none', padding: '8px', color: 'var(--color-text-primary)' }}
            >
              <Menu size={22} />
            </button>

            {/* Global Patient Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'var(--color-bg-soft-cyan)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid var(--color-border)',
                width: '340px',
                transition: 'border-color 0.15s ease'
              }}
            >
              <Search size={16} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search UHID, patient name, doctor, or blood unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: 'var(--font-size-xs)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Live Clinical Status Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                All Systems Operational
              </span>
            </div>

            {/* Notification Bell */}
            <button
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)'
              }}
              title="Notifications"
            >
              <Bell size={19} />
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-error)'
                }}
              />
            </button>

            {/* Department Quick Switcher */}
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#F8FBFB',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: '500',
                color: 'var(--color-text-primary)'
              }}
            >
              <span>Emergency & Clinical OP</span>
              <ChevronDown size={14} color="var(--color-text-muted)" />
            </div>

            {/* Staff Role Badge or Sign In Button */}
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--color-bg-pale-aqua)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(8, 127, 140, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: '600',
                  color: 'var(--color-primary-teal)',
                  cursor: 'pointer'
                }}
                title="Click to switch staff role"
              >
                <ShieldCheck size={14} />
                <span>{user.role ? user.role.replace(/_/g, ' ').toUpperCase() : 'STAFF'}</span>
              </button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={LogIn}
                onClick={() => openLoginModal()}
              >
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Content Workspace */}
        <main style={{ flex: 1, padding: '32px', backgroundColor: 'var(--color-bg-main)' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        @media (max-width: 900px) {
          .app-sidebar {
            transform: translateX(-100%);
          }
          .mobile-menu-trigger {
            display: inline-flex !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
          main {
            padding: 18px !important;
          }
          div[style*="marginLeft: 'var(--sidebar-width)'"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
