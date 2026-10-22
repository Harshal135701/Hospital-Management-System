import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  IndianRupee,
  Landmark,
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../common/UIPrimitives';
import { CREDIT_BILLING_SUBMODULES } from './creditBillingConstants';
import {
  INITIAL_PREAUTHORIZATIONS,
  INITIAL_ENHANCEMENT_REQUESTS,
  INITIAL_CLAIM_DOSSIERS,
  INITIAL_RESPONSIBILITIES,
  INITIAL_RECONCILIATIONS
} from './creditBillingMockData';
import { InsuranceTpaService } from '../../services/api';

// Submodule components
import { PreAuthDesk } from './PreAuthDesk';
import { EnhancementRequestDesk } from './EnhancementRequestDesk';
import { ClaimDossierDesk } from './ClaimDossierDesk';
import { CoPayDeductibleDesk } from './CoPayDeductibleDesk';
import { TpaReconciliationDesk } from './TpaReconciliationDesk';

export function CreditBillingView({ initialSubtab = '7.1', onNavigate }) {
  // Normalize subtab parameter
  const normalizeSubtab = useCallback((tab) => {
    if (!tab) return '7.1';
    if (tab === 'preauth' || tab === 'preauthorizations') return '7.1';
    if (tab === 'enhancement' || tab === 'enhancements') return '7.2';
    if (tab === 'claims' || tab === 'dossiers') return '7.3';
    if (tab === 'copay' || tab === 'responsibilities') return '7.4';
    if (tab === 'reconciliation' || tab === 'reconciliations') return '7.5';

    const clean = tab.replace('credit-billing:', '').replace('insurance:', '').replace('submodule:', '');
    const found = CREDIT_BILLING_SUBMODULES.find(s => s.id === clean || s.number === clean);
    return found ? found.id : '7.1';
  }, []);

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [submoduleSearch, setSubmoduleSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Live and simulated state
  const [preauthorizations, setPreauthorizations] = useState(INITIAL_PREAUTHORIZATIONS);
  const [enhancements, setEnhancements] = useState(INITIAL_ENHANCEMENT_REQUESTS);
  const [dossiers, setDossiers] = useState(INITIAL_CLAIM_DOSSIERS);
  const [responsibilities, setResponsibilities] = useState(INITIAL_RESPONSIBILITIES);
  const [reconciliations, setReconciliations] = useState(INITIAL_RECONCILIATIONS);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Sync prop updates
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab, normalizeSubtab]);

  // Current active submodule descriptor
  const activeSubmodule = useMemo(() => {
    return CREDIT_BILLING_SUBMODULES.find(s => s.id === activeSubtab) || CREDIT_BILLING_SUBMODULES[0];
  }, [activeSubtab]);

  // Load backend data if available, fallback gracefully
  const loadBackendData = useCallback(async () => {
    setLoading(true);
    try {
      const [preRes, enhRes, claimRes, respRes, recRes] = await Promise.allSettled([
        InsuranceTpaService.getPreauthorizations(),
        InsuranceTpaService.getEnhancements(),
        InsuranceTpaService.getClaimDossiers(),
        InsuranceTpaService.getResponsibilities(),
        InsuranceTpaService.getReconciliations()
      ]);

      if (preRes.status === 'fulfilled' && Array.isArray(preRes.value) && preRes.value.length > 0) {
        setPreauthorizations(preRes.value);
      }
      if (enhRes.status === 'fulfilled' && Array.isArray(enhRes.value) && enhRes.value.length > 0) {
        setEnhancements(enhRes.value);
      }
      if (claimRes.status === 'fulfilled' && Array.isArray(claimRes.value) && claimRes.value.length > 0) {
        setDossiers(claimRes.value);
      }
      if (respRes.status === 'fulfilled' && Array.isArray(respRes.value) && respRes.value.length > 0) {
        setResponsibilities(respRes.value);
      }
      if (recRes.status === 'fulfilled' && Array.isArray(recRes.value) && recRes.value.length > 0) {
        setReconciliations(recRes.value);
      }
    } catch (err) {
      console.warn('[CreditBillingView] Live backend sync fallback to state:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  const handleSelectSubmodule = (id) => {
    setActiveSubtab(id);
    if (onNavigate) {
      onNavigate(`credit-billing:${id}`);
    }
  };

  // Handlers for 7.1 Pre-Authorizations
  const handleCreatePreauth = async (newRecord) => {
    setPreauthorizations(prev => [newRecord, ...prev]);
    showToast(`Pre-authorization submitted for ${newRecord.patient_name} (${newRecord.insurance_provider}).`);
    try {
      await InsuranceTpaService.createPreauthorization(newRecord);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleSubmitPreauth = async (id) => {
    setPreauthorizations(prev =>
      prev.map(p => (p.id === id ? { ...p, status: 'submitted', updated_at: new Date().toISOString() } : p))
    );
    showToast(`Pre-authorization request ${id} transmitted to insurer cashless switch.`);
    try {
      await InsuranceTpaService.submitPreauthorization(id);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleRecordPreauthDecision = async (id, decisionData) => {
    setPreauthorizations(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              ...decisionData,
              updated_at: new Date().toISOString()
            }
          : p
      )
    );
    showToast(`Insurer authorization decision recorded for request ${id}.`);
    try {
      await InsuranceTpaService.recordPreauthDecision(id, decisionData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleResolvePreauthQuery = async (id, queryData) => {
    setPreauthorizations(prev =>
      prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: 'submitted',
            tpa_query: {
              ...p.tpa_query,
              status: 'resolved',
              response_text: queryData.response_text,
              response_doc_name: queryData.doc_reference
            },
            updated_at: new Date().toISOString()
          };
        }
        return p;
      })
    );
    showToast(`Clinical query clarification submitted to TPA auditor.`);
  };

  // Handlers for 7.2 Enhancement Requests
  const handleCreateEnhancement = async (newRecord) => {
    setEnhancements(prev => [newRecord, ...prev]);
    showToast(`Enhancement ${newRecord.enhancement_number} submitted to TPA.`);
    try {
      await InsuranceTpaService.createEnhancement(newRecord);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleRecordEnhancementDecision = async (id, decisionData) => {
    setEnhancements(prev =>
      prev.map(e =>
        e.id === id
          ? {
              ...e,
              ...decisionData,
              current_approved_amount: decisionData.cumulative_approved_amount || e.current_approved_amount,
              updated_at: new Date().toISOString()
            }
          : e
      )
    );
    showToast(`Enhancement limit updated for case.`);
    try {
      await InsuranceTpaService.recordEnhancementDecision(id, decisionData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  // Handlers for 7.3 Claim Dossiers
  const handleCreateDossier = async (newRecord) => {
    setDossiers(prev => [newRecord, ...prev]);
    showToast(`Claim dossier ${newRecord.dossier_number} initialized.`);
    try {
      await InsuranceTpaService.createClaimDossier(newRecord);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleCompileDossier = async (id) => {
    setDossiers(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'ready_for_dispatch', updated_at: new Date().toISOString() } : d))
    );
    showToast(`Claim dossier ${id} marked ready for dispatch.`);
    try {
      await InsuranceTpaService.compileClaimDossier(id);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleSubmitDossier = async (id, dispatchData) => {
    setDossiers(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              ...dispatchData,
              status: 'dispatched',
              updated_at: new Date().toISOString()
            }
          : d
      )
    );
    showToast(`Dossier dispatched via ${dispatchData.courier_agency}. Tracking: ${dispatchData.tracking_number}`);
    try {
      await InsuranceTpaService.submitClaimDossier(id, dispatchData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleRecordDossierDecision = async (id, decisionData) => {
    setDossiers(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              ...decisionData,
              updated_at: new Date().toISOString()
            }
          : d
      )
    );
    showToast(`Claim settlement confirmed for dossier.`);
    try {
      await InsuranceTpaService.recordClaimDecision(id, decisionData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  // Handlers for 7.4 Co-Pay & Responsibilities
  const handleCreateResponsibility = async (newRecord) => {
    setResponsibilities(prev => [newRecord, ...prev]);
    showToast(`Patient responsibility calculated for ${newRecord.patient_name}.`);
    try {
      await InsuranceTpaService.createResponsibility(newRecord);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handleCollectResponsibilityPayment = async (id, collectData) => {
    setResponsibilities(prev =>
      prev.map(r => {
        if (r.id === id) {
          const newCollected = Number(r.amount_collected || 0) + Number(collectData.amount_paid);
          const newBalance = Math.max(0, Number(r.net_patient_payable) - newCollected);
          const newStatus = newBalance === 0 ? 'collected' : 'partially_collected';
          const newGatepass = newBalance === 0 ? 'cleared' : 'blocked';
          return {
            ...r,
            amount_collected: newCollected,
            balance_due: newBalance,
            status: newStatus,
            gatepass_status: newGatepass,
            receipts: [...(r.receipts || []), collectData.receipt]
          };
        }
        return r;
      })
    );
    showToast(`Payment of ₹${collectData.amount_paid.toLocaleString('en-IN')} collected. Gate pass updated.`);
    try {
      await InsuranceTpaService.collectResponsibilityPayment(id, collectData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  // Handlers for 7.5 TPA Reconciliations
  const handleCreateReconciliation = async (newRecord) => {
    setReconciliations(prev => [newRecord, ...prev]);
    showToast(`Reconciliation entry created for dossier ${newRecord.dossier_number}.`);
    try {
      await InsuranceTpaService.createReconciliation(newRecord);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  const handlePostPayment = async (id, paymentData) => {
    setReconciliations(prev =>
      prev.map(r => (r.id === id ? { ...r, ...paymentData, status: 'settled' } : r))
    );
    showToast(`Remittance payment posted for UTR ${paymentData.utr_number}.`);
    try {
      await InsuranceTpaService.postReconciliationPayment(id, paymentData);
    } catch (e) {
      console.info('[CreditBillingView] Live API fallback:', e.message);
    }
  };

  // Render submodule view
  const renderSubmoduleContent = () => {
    switch (activeSubtab) {
      case '7.1':
        return (
          <PreAuthDesk
            preauthorizations={preauthorizations}
            onCreatePreauth={handleCreatePreauth}
            onSubmitPreauth={handleSubmitPreauth}
            onRecordDecision={handleRecordPreauthDecision}
            onResolveQuery={handleResolvePreauthQuery}
          />
        );

      case '7.2':
        return (
          <EnhancementRequestDesk
            enhancements={enhancements}
            onCreateEnhancement={handleCreateEnhancement}
            onRecordDecision={handleRecordEnhancementDecision}
          />
        );

      case '7.3':
        return (
          <ClaimDossierDesk
            dossiers={dossiers}
            onCreateDossier={handleCreateDossier}
            onCompileDossier={handleCompileDossier}
            onSubmitDossier={handleSubmitDossier}
            onRecordDecision={handleRecordDossierDecision}
          />
        );

      case '7.4':
        return (
          <CoPayDeductibleDesk
            responsibilities={responsibilities}
            onCreateResponsibility={handleCreateResponsibility}
            onCollectPayment={handleCollectResponsibilityPayment}
          />
        );

      case '7.5':
        return (
          <TpaReconciliationDesk
            reconciliations={reconciliations}
            onCreateReconciliation={handleCreateReconciliation}
            onPostPayment={handlePostPayment}
          />
        );

      default:
        return (
          <PreAuthDesk
            preauthorizations={preauthorizations}
            onCreatePreauth={handleCreatePreauth}
            onSubmitPreauth={handleSubmitPreauth}
            onRecordDecision={handleRecordPreauthDecision}
            onResolveQuery={handleResolvePreauthQuery}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1100,
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderLeft: '4px solid var(--color-primary-teal)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={16} style={{ color: 'var(--color-primary-teal)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb & Quick Actions Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-secondary)',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={() => handleSelectSubmodule('7.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ShieldCheck size={14} />
            <span>Credit Billing Workspace</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ color: 'var(--color-primary-teal)', fontWeight: '600' }}>
            Group 7 — Insurance & TPA
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {activeSubmodule.title}
          </span>
        </nav>

        {/* Global Submodule Search in Credit Billing */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Input
            placeholder="Jump to any submodule (7.1 - 7.5)..."
            icon={Search}
            value={submoduleSearch}
            onChange={(e) => setSubmoduleSearch(e.target.value)}
          />

          {submoduleSearch.trim().length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                maxHeight: '260px',
                overflowY: 'auto',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-modal)',
                border: '1px solid var(--color-border)',
                zIndex: 200,
                padding: '6px'
              }}
            >
              {CREDIT_BILLING_SUBMODULES.filter(s =>
                s.title.toLowerCase().includes(submoduleSearch.toLowerCase()) ||
                s.description.toLowerCase().includes(submoduleSearch.toLowerCase())
              ).map((sub) => (
                <button
                  type="button"
                  key={sub.id}
                  onClick={() => {
                    handleSelectSubmodule(sub.id);
                    setSubmoduleSearch('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: activeSubtab === sub.id ? 'var(--color-bg-pale-aqua)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <sub.icon size={15} style={{ color: 'var(--color-primary-teal)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.82rem', color: 'var(--color-text-primary)' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '1px' }}>
                      {sub.description.slice(0, 60)}...
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Credit Billing Workspace Tabs (All 5 Submodules) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '2px solid var(--color-border-subtle)',
          scrollbarWidth: 'thin'
        }}
      >
        {CREDIT_BILLING_SUBMODULES.map((sub) => {
          const isActive = activeSubtab === sub.id;
          const SubIcon = sub.icon;

          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => handleSelectSubmodule(sub.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <SubIcon size={16} />
              <span>{sub.title}</span>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? 'var(--color-bg-pale-aqua)' : '#F1F5F9',
                  color: isActive ? 'var(--color-primary-teal)' : '#64748B',
                  fontWeight: '600'
                }}
              >
                {sub.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submodule Description Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFB',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-primary-teal)',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <activeSubmodule.icon size={20} style={{ color: 'var(--color-primary-teal)' }} />
          <div>
            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
              {activeSubmodule.title}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
              — {activeSubmodule.description}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant="ghost"
            icon={RefreshCw}
            onClick={() => {
              loadBackendData();
              showToast('Refreshed latest cashless data from backend.');
            }}
            title="Refresh latest data"
          >
            Sync
          </Button>
          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
            Module 7 • NABH / IRDAI Standard
          </span>
        </div>
      </div>

      {/* Submodule Main Workspace Content */}
      <div style={{ minHeight: '500px' }}>
        {renderSubmoduleContent()}
      </div>
    </div>
  );
}
