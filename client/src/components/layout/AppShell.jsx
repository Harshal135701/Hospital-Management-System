import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Activity,
  LogOut,
  LogIn,
  Lock,
  User
} from 'lucide-react';
import { Button } from '../common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const AppShell = ({
  currentRoute,
  onNavigate,
  children
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('medicsprime_sidebar_collapsed') === 'true';
    }
    return false;
  });
  const isClinicalRoute = currentRoute === 'clinical' || (typeof currentRoute === 'string' && currentRoute.startsWith('clinical:'));
  const [isClinicalExpandedManual, setIsClinicalExpandedManual] = useState(null);
  const isClinicalExpanded = isClinicalExpandedManual !== null ? isClinicalExpandedManual : isClinicalRoute;
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('medicsprime_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const navSections = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Clinical Operations',
      items: [
        { id: 'patients', label: 'Patients', icon: Users, badge: '4 New' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, badge: 'Today' },
        {
          id: 'clinical',
          label: 'Clinical',
          icon: Stethoscope,
          subItems: [
            { id: 'clinical:consultation', label: 'Consultation Desk' },
            { id: 'clinical:vitals', label: 'Vitals & Examination' },
            { id: 'clinical:history', label: 'Complaints & History' },
            { id: 'clinical:orders', label: 'Orders (CPOE)' },
            { id: 'clinical:notes', label: 'Progress Notes' }
          ]
        },
        { id: 'doctors', label: 'Staff & Doctors', icon: UserCheck },
        { id: 'departments', label: 'Departments & Wards', icon: Building2 },
        { id: 'rooms', label: 'Beds & Inpatient', icon: Bed },
        { id: 'lab', label: 'Laboratory', icon: FlaskConical },
        { id: 'bloodbank', label: 'Blood Bank', icon: Droplet, highlight: true }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'reports', label: 'Reports & Audit Logs', icon: FileText },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    }
  ];

  const handleSelectNav = (id) => {
    if (typeof id === 'string' && !id.startsWith('clinical')) {
      setIsClinicalExpandedManual(null);
    }
    onNavigate(id);
    setIsMobileMenuOpen(false);
  };

  const effectiveCollapsed = isCollapsed && !isMobileMenuOpen;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-main)' }}>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 50, 56, 0.45)',
            zIndex: 90,
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isMobileMenuOpen ? 'translateX(0)' : undefined
        }}
        className={`app-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: effectiveCollapsed ? '0 12px' : '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: effectiveCollapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF',
            flexShrink: 0
          }}
        >
          {!effectiveCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 2px 6px rgba(8, 127, 140, 0.25)',
                    flexShrink: 0
                  }}
                >
                  <Activity size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--color-primary-teal)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    MedicsPrime
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: '500', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hospital Management
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  type="button"
                  onClick={toggleCollapse}
                  className="desktop-collapse-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mobile-close-btn"
                  style={{
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    cursor: 'pointer'
                  }}
                  title="Close navigation"
                  aria-label="Close navigation"
                >
                  <X size={16} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(8, 127, 140, 0.25)'
                }}
                title="MedicsPrime Hospital Management"
              >
                <Activity size={18} />
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="desktop-collapse-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-secondary)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Hospital Identity Header */}
        <div style={{ padding: effectiveCollapsed ? '8px 10px 4px' : '10px 12px 4px', flexShrink: 0 }}>
          {!effectiveCollapsed ? (
            <div
              style={{
                padding: '8px 10px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-success)',
                    flexShrink: 0
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--color-primary-teal)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Apex Central Hospital
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'var(--color-text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    Main Clinical Campus
                  </div>
                </div>
              </div>
              <ShieldCheck size={14} color="var(--color-primary-teal)" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '34px',
                backgroundColor: 'var(--color-bg-pale-aqua)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(8, 127, 140, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              title="Apex Central Hospital • Main Clinical Campus"
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)'
                }}
              />
              <ShieldCheck size={14} color="var(--color-primary-teal)" />
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div style={{ flex: 1, overflowY: 'auto', padding: effectiveCollapsed ? '8px 8px' : '8px 10px' }}>
          {navSections.map((section, idx) => (
            <div key={section.title} style={{ marginBottom: effectiveCollapsed ? '8px' : '12px' }}>
              {!effectiveCollapsed ? (
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '8px 10px 4px',
                    textAlign: 'left'
                  }}
                >
                  {section.title}
                </div>
              ) : (
                idx > 0 && (
                  <div
                    style={{
                      height: '1px',
                      backgroundColor: 'var(--color-border-subtle)',
                      margin: '6px 6px 8px'
                    }}
                  />
                )
              )}

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map((item) => {
                  const isItemActive = currentRoute === item.id || (typeof currentRoute === 'string' && currentRoute.startsWith(item.id + ':'));
                  const Icon = item.icon;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = isClinicalExpanded && !effectiveCollapsed;

                  const handleItemClick = () => {
                    if (hasSubItems) {
                      if (effectiveCollapsed) {
                        handleSelectNav(item.id);
                      } else {
                        setIsClinicalExpandedManual(prev => (prev !== null ? !prev : !isClinicalRoute));
                        if (!isItemActive) {
                          handleSelectNav(item.id);
                        }
                      }
                    } else {
                      handleSelectNav(item.id);
                    }
                  };

                  return (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'column' }}>
                      <button
                        type="button"
                        onClick={handleItemClick}
                        title={effectiveCollapsed ? item.label : undefined}
                        aria-label={item.label}
                        className={`nav-item ${isItemActive ? 'nav-item-active' : ''}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: effectiveCollapsed ? 'center' : 'flex-start',
                          width: '100%',
                          textAlign: 'left',
                          padding: effectiveCollapsed ? '8px 0' : '8px 10px',
                          minHeight: '38px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: isItemActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                          color: isItemActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                          fontWeight: isItemActive ? '600' : '500',
                          fontSize: 'var(--font-size-sm)',
                          border: '1px solid',
                          borderColor: isItemActive ? 'rgba(8, 127, 140, 0.2)' : 'transparent',
                          boxShadow: isItemActive && !effectiveCollapsed ? 'inset 3px 0 0 var(--color-primary-teal)' : 'none',
                          transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
                          position: 'relative',
                          cursor: 'pointer'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            minWidth: 0,
                            flex: effectiveCollapsed ? 'none' : 1,
                            textAlign: 'left'
                          }}
                        >
                          <Icon
                            size={18}
                            color={isItemActive ? 'var(--color-primary-teal)' : 'currentColor'}
                            style={{ flexShrink: 0 }}
                          />
                          {!effectiveCollapsed && (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                textAlign: 'left'
                              }}
                            >
                              {item.label}
                            </span>
                          )}
                        </div>

                        {!effectiveCollapsed && item.badge && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              flexShrink: 0,
                              padding: '2px 7px',
                              fontSize: '0.68rem',
                              fontWeight: '600',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: isItemActive ? 'var(--color-primary-teal)' : '#EEF2F2',
                              color: isItemActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                              lineHeight: 1.3
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {!effectiveCollapsed && hasSubItems && (
                          <span
                            style={{
                              marginLeft: 'auto',
                              color: 'var(--color-text-secondary)',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </span>
                        )}

                        {effectiveCollapsed && item.badge && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '6px',
                              right: '12px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isItemActive ? 'var(--color-primary-teal)' : 'var(--color-aqua-accent)'
                            }}
                          />
                        )}
                      </button>

                      {/* Expandable Sub-Navigation */}
                      {hasSubItems && isExpanded && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            marginTop: '2px',
                            marginLeft: '12px',
                            paddingLeft: '14px',
                            borderLeft: '1.5px solid var(--color-border)'
                          }}
                        >
                          {item.subItems.map((sub) => {
                            const isSubActive =
                              currentRoute === sub.id ||
                              (sub.id === 'clinical:consultation' && currentRoute === 'clinical');
                            return (
                              <button
                                type="button"
                                key={sub.id}
                                onClick={() => handleSelectNav(sub.id)}
                                className={`nav-subitem ${isSubActive ? 'nav-subitem-active' : ''}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '6px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: isSubActive ? 'var(--color-bg-pale-aqua)' : 'transparent',
                                  color: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                                  fontWeight: isSubActive ? '600' : '400',
                                  fontSize: '0.8rem',
                                  border: 'none',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span
                                  style={{
                                    width: '5px',
                                    height: '5px',
                                    borderRadius: '50%',
                                    backgroundColor: isSubActive ? 'var(--color-primary-teal)' : 'var(--color-border)',
                                    flexShrink: 0
                                  }}
                                />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {sub.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div
          style={{
            padding: effectiveCollapsed ? '10px 8px' : '12px 14px',
            borderTop: '1px solid var(--color-border-subtle)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: effectiveCollapsed ? 'center' : 'space-between',
            flexShrink: 0
          }}
        >
          {isAuthenticated && user ? (
            !effectiveCollapsed ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-primary-teal)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    {user.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <div
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '600',
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {user.full_name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--color-text-secondary)',
                        textTransform: 'capitalize',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {user.role ? user.role.replace(/_/g, ' ') : 'Staff'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openLoginModal()}
                    style={{ color: 'var(--color-text-muted)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    title="Switch Staff Account"
                    aria-label="Switch Staff Account"
                  >
                    <User size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    style={{ color: 'var(--color-error)', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
                    title="Sign out"
                    aria-label="Sign out"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-teal)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title={`${user.full_name} (${user.role ? user.role.replace(/_/g, ' ') : 'Staff'}) • Click to switch user`}
                aria-label="User profile"
              >
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
              </button>
            )
          ) : (
            !effectiveCollapsed ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#E2E8F0',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Lock size={14} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                      Not Signed In
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>
                      Public Terminal
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogIn}
                  onClick={() => openLoginModal()}
                  style={{ width: '100%', padding: '6px 12px' }}
                >
                  Staff Login
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openLoginModal()}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#E2E8F0',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Staff Login"
                aria-label="Staff Login"
              >
                <LogIn size={16} />
              </button>
            )
          )}
        </div>
      </aside>

      {/* Main Container Area */}
      <div
        style={{
          flex: 1,
          marginLeft: effectiveCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className="main-container"
      >
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
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="mobile-menu-trigger"
              style={{ display: 'none', padding: '8px', color: 'var(--color-text-primary)' }}
              title="Open menu"
              aria-label="Open menu"
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
              type="button"
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)'
              }}
              title="Notifications"
              aria-label="Notifications"
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
        .nav-item {
          outline: none;
        }
        .nav-item:hover {
          background-color: var(--color-bg-soft-cyan) !important;
          color: var(--color-text-primary) !important;
        }
        .nav-item-active:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
        }
        .nav-subitem {
          outline: none;
        }
        .nav-subitem:hover {
          background-color: var(--color-bg-soft-cyan) !important;
          color: var(--color-text-primary) !important;
        }
        .nav-subitem-active:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
        }
        .desktop-collapse-btn:hover {
          background-color: var(--color-bg-pale-aqua) !important;
          color: var(--color-primary-teal) !important;
          border-color: rgba(8, 127, 140, 0.3) !important;
        }
        @media (max-width: 900px) {
          .app-sidebar {
            transform: translateX(-100%) !important;
            width: 260px !important;
            box-shadow: var(--shadow-modal) !important;
          }
          .app-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .desktop-collapse-btn {
            display: none !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
          .mobile-menu-trigger {
            display: inline-flex !important;
          }
          .main-container {
            margin-left: 0 !important;
          }
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
