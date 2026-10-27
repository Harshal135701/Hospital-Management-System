import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  RefreshCw,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { Badge, Button } from '../common/UIPrimitives';
import { FINANCE_SUBMODULES } from './financeConstants';
import {
  INITIAL_CHART_OF_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_VOUCHERS,
  INITIAL_DOCTORS_REVENUE_SHARE,
  INITIAL_BANK_RECONCILIATION,
  INITIAL_PL_STATEMENT
} from './financeMockData';
import { ChartOfAccountsDesk } from './ChartOfAccountsDesk';
import { VouchersDesk } from './VouchersDesk';
import { DoctorPayoutDesk } from './DoctorPayoutDesk';
import { BankReconciliationDesk } from './BankReconciliationDesk';
import { FinancialReportsDesk } from './FinancialReportsDesk';

const STORAGE_KEY = 'medicsprime_finance_state_v2';

export function FinanceView({ initialSubtab = '13.1', onNavigate }) {
  // Normalize subtab id to 13.1 ... 13.5
  const normalizeSubtab = (tab) => {
    if (!tab) return '13.1';
    const cleaned = String(tab).replace('finance:', '').replace('submodule:', '').replace('appointments:', '');
    if (['13.1', '13.2', '13.3', '13.4', '13.5'].includes(cleaned)) {
      return cleaned;
    }
    return '13.1';
  };

  const [activeSubtab, setActiveSubtab] = useState(() => normalizeSubtab(initialSubtab));
  const [toastMessage, setToastMessage] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Synchronize state when initialSubtab changes
  useEffect(() => {
    if (initialSubtab) {
      setActiveSubtab(normalizeSubtab(initialSubtab));
    }
  }, [initialSubtab]);

  // Load Persisted or Initial State
  const [financeData, setFinanceData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.accounts && parsed.vouchers) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('[FinanceView] Could not load persisted finance state:', err);
      }
    }
    return {
      accounts: INITIAL_CHART_OF_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      vouchers: INITIAL_VOUCHERS,
      doctors: INITIAL_DOCTORS_REVENUE_SHARE,
      bankReconciliations: INITIAL_BANK_RECONCILIATION,
      plStatement: INITIAL_PL_STATEMENT
    };
  });

  // Persist whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(financeData));
      } catch (err) {
        console.warn('[FinanceView] Could not persist state:', err);
      }
    }
  }, [financeData]);

  // Tab switch handler
  const handleSelectSubtab = (subId) => {
    const cleanId = normalizeSubtab(subId);
    setActiveSubtab(cleanId);
    if (onNavigate) {
      onNavigate(`finance:${cleanId}`);
    }
  };

  // Reset to Demo Data
  const handleResetData = () => {
    const initial = {
      accounts: INITIAL_CHART_OF_ACCOUNTS,
      journalEntries: INITIAL_JOURNAL_ENTRIES,
      vouchers: INITIAL_VOUCHERS,
      doctors: INITIAL_DOCTORS_REVENUE_SHARE,
      bankReconciliations: INITIAL_BANK_RECONCILIATION,
      plStatement: INITIAL_PL_STATEMENT
    };
    setFinanceData(initial);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
    showToast('Finance demo data successfully reset to baseline.');
  };

  // Sync / Refresh Simulation
  const handleSyncLedger = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('General ledger and bank balances synchronized with central billing.');
    }, 600);
  };

  // 13.1 Add Account Head
  const handleAddAccount = (newAcc) => {
    setFinanceData(prev => ({
      ...prev,
      accounts: [...prev.accounts, newAcc]
    }));
    showToast(`Account Head #${newAcc.code} - ${newAcc.name} added successfully.`);
  };

  // 13.1 Post Manual Journal Entry (JV)
  const handlePostJournalEntry = ({ date, voucherNo, debitAcc, creditAcc, amount, narration }) => {
    const entryId = `jv-${Date.now()}`;

    const newEntries = [
      {
        id: `${entryId}-dr`,
        voucherNo,
        date,
        accountCode: debitAcc.code,
        accountName: debitAcc.name,
        debit: amount,
        credit: 0,
        narration
      },
      {
        id: `${entryId}-cr`,
        voucherNo,
        date,
        accountCode: creditAcc.code,
        accountName: creditAcc.name,
        debit: 0,
        credit: amount,
        narration
      }
    ];

    setFinanceData(prev => {
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.code === debitAcc.code) {
          const delta = (acc.category === 'asset' || acc.category === 'expense') ? amount : -amount;
          return { ...acc, balance: acc.balance + delta };
        }
        if (acc.code === creditAcc.code) {
          const delta = (acc.category === 'asset' || acc.category === 'expense') ? -amount : amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      });

      return {
        ...prev,
        accounts: updatedAccounts,
        journalEntries: [...newEntries, ...prev.journalEntries]
      };
    });

    showToast(`Journal Voucher ${voucherNo} posted to General Ledger.`);
  };

  // 13.2 Create Voucher
  const handleCreateVoucher = (newVoucher) => {
    setFinanceData(prev => ({
      ...prev,
      vouchers: [newVoucher, ...prev.vouchers]
    }));
    showToast(`Voucher ${newVoucher.voucherNo} (${newVoucher.type.toUpperCase()}) created.`);
  };

  // 13.2 Update Voucher Status
  const handleUpdateVoucherStatus = (voucherId, newStatus) => {
    setFinanceData(prev => ({
      ...prev,
      vouchers: prev.vouchers.map(v => v.id === voucherId ? { ...v, status: newStatus } : v)
    }));
    showToast(`Voucher status updated to ${newStatus.toUpperCase()}.`);
  };

  // 13.3 Disburse Doctor Payout
  const handleDisburseDoctorPayout = (doctorId) => {
    const doctor = financeData.doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const randNum = String(Math.floor(1000 + Math.random() * 9000));
    const voucherNo = `PV-2026-${randNum}`;
    const today = new Date().toISOString().slice(0, 10);

    // Auto-create Payment Voucher
    const autoVoucher = {
      id: `vch-${Date.now()}`,
      voucherNo,
      type: 'payment',
      date: today,
      entityName: doctor.name,
      department: doctor.department,
      accountCode: '2030',
      accountName: 'Doctor Revenue Share Payable',
      amount: doctor.doctorGrossShare,
      tdsAmount: doctor.tdsAmount,
      netAmount: doctor.netPayout,
      paymentMode: 'neft_rtgs',
      referenceNo: `NEFT/HDFCN5${randNum}`,
      status: 'paid',
      authorizedBy: 'Chief Financial Officer (CFO)',
      narration: `Doctor revenue share payout for ${doctor.name} (${doctor.department}) - 10% TDS Sec 194J deducted.`
    };

    setFinanceData(prev => {
      // 1. Update doctor status
      const updatedDoctors = prev.doctors.map(d => {
        if (d.id === doctorId) {
          return {
            ...d,
            status: 'disbursed',
            paidDate: today,
            voucherRef: voucherNo
          };
        }
        return d;
      });

      // 2. Add payment voucher
      const updatedVouchers = [autoVoucher, ...prev.vouchers];

      // 3. Deduct from Doctor Share Payable liability in Accounts
      const updatedAccounts = prev.accounts.map(acc => {
        if (acc.code === '2030') {
          return { ...acc, balance: Math.max(0, acc.balance - doctor.doctorGrossShare) };
        }
        if (acc.code === '1020') {
          return { ...acc, balance: acc.balance - doctor.netPayout };
        }
        return acc;
      });

      return {
        ...prev,
        doctors: updatedDoctors,
        vouchers: updatedVouchers,
        accounts: updatedAccounts
      };
    });

    showToast(`Payout disbursed to ${doctor.name}. Voucher ${voucherNo} posted!`);
  };

  // 13.3 Recalculate All Doctor Payouts
  const handleCalculateAllPayouts = () => {
    setFinanceData(prev => ({
      ...prev,
      doctors: prev.doctors.map(doc => {
        const gross = Math.round(doc.totalBillings * (doc.procedureShareRate / 100));
        const tds = Math.round(gross * 0.1);
        const net = gross - tds;
        return {
          ...doc,
          doctorGrossShare: gross,
          hospitalRetained: doc.totalBillings - gross,
          tdsAmount: tds,
          netPayout: net,
          status: doc.status === 'disbursed' ? 'disbursed' : 'calculated'
        };
      })
    }));
    showToast('Consultant revenue share calculations updated across all specialties.');
  };

  // 13.4 Toggle Bank Reconciled Checkbox
  const handleToggleReconciledItem = (bankAccountId, transactionId) => {
    setFinanceData(prev => {
      const bankData = prev.bankReconciliations[bankAccountId];
      if (!bankData) return prev;

      const updatedTxs = bankData.transactions.map(tx => {
        if (tx.id === transactionId) {
          return { ...tx, bookMatched: !tx.bookMatched };
        }
        return tx;
      });

      return {
        ...prev,
        bankReconciliations: {
          ...prev.bankReconciliations,
          [bankAccountId]: {
            ...bankData,
            transactions: updatedTxs
          }
        }
      };
    });
  };

  // 13.4 Auto-Match Bank Transactions
  const handleAutoMatchBank = (bankAccountId) => {
    setFinanceData(prev => {
      const bankData = prev.bankReconciliations[bankAccountId];
      if (!bankData) return prev;

      const updatedTxs = bankData.transactions.map(tx => ({
        ...tx,
        bookMatched: true
      }));

      return {
        ...prev,
        bankReconciliations: {
          ...prev.bankReconciliations,
          [bankAccountId]: {
            ...bankData,
            transactions: updatedTxs
          }
        }
      };
    });
    showToast('Automatic reconciliation complete: All UTRs paired with ledger.');
  };

  // 13.4 Add Bank Adjustment
  const handleAddBankAdjustment = (bankAccountId, newTx) => {
    setFinanceData(prev => {
      const bankData = prev.bankReconciliations[bankAccountId];
      if (!bankData) return prev;

      const updatedTxs = [
        { id: `adj-${Date.now()}`, ...newTx },
        ...bankData.transactions
      ];

      return {
        ...prev,
        bankReconciliations: {
          ...prev.bankReconciliations,
          [bankAccountId]: {
            ...bankData,
            transactions: updatedTxs
          }
        }
      };
    });
    showToast(`Bank adjustment ${newTx.ref} posted to passbook statement.`);
  };

  // Active submodule object
  const currentSubmodule = useMemo(() => {
    return FINANCE_SUBMODULES.find(s => s.id === activeSubtab) || FINANCE_SUBMODULES[0];
  }, [activeSubtab]);

  // Tab Badge Counts
  const tabBadges = useMemo(() => {
    return {
      '13.1': `${financeData.accounts.length} Accounts`,
      '13.2': `${financeData.vouchers.length} Vouchers`,
      '13.3': `${financeData.doctors.length} Doctors`,
      '13.4': '3 Banks',
      '13.5': 'FY 2026-27'
    };
  }, [financeData]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%'
      }}
    >
      {/* Workspace Context Navigation Banner matching AppointmentsView */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
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
            onClick={() => handleSelectSubtab('13.1')}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'var(--color-primary-teal)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Landmark size={13} />
            <span>Finance & Accounts</span>
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{ fontWeight: '700', color: 'var(--color-text-primary)' }}>
            {currentSubmodule.shortLabel}
          </span>
          <Badge variant="teal" size="sm">
            {currentSubmodule.badge}
          </Badge>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Desk Ref: #{currentSubmodule.id}
          </span>
        </div>
      </div>

      {/* Main Module Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingBottom: '4px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: '800',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em'
              }}
            >
              Hospital Finance & Accounts (FAMS)
            </h1>
            <Badge variant="teal">Statutory Financial Governance</Badge>
          </div>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: '0.84rem',
              color: 'var(--color-text-secondary)'
            }}
          >
            Chart of Accounts, Debit/Credit Payment Vouchers, Doctor Revenue Share, Bank Reconciliation, and P&L Statements.
          </p>
        </div>

        {/* Global Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetData}
            title="Reset to clean hospital finance seed data"
          >
            Reset Demo Data
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isSyncing}
            onClick={handleSyncLedger}
            title="Sync Ledger balances"
          >
            Sync Ledger
          </Button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 Submodule Tab Navigation Bar matching Appointments & Emergency modules */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          borderBottom: '2px solid var(--color-border)',
          marginBottom: '4px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {FINANCE_SUBMODULES.map((sub) => {
          const isActive = activeSubtab === sub.id;
          const Icon = sub.icon;
          const badgeText = tabBadges[sub.id];

          return (
            <button
              type="button"
              key={sub.id}
              onClick={() => handleSelectSubtab(sub.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: isActive ? '3px solid var(--color-primary-teal)' : '3px solid transparent',
                backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                color: isActive ? 'var(--color-primary-teal)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? '700' : '500',
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                marginBottom: '-2px',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{sub.label}</span>
              
            </button>
          );
        })}
      </div>

      {/* Render Active Desk */}
      <div>
        {activeSubtab === '13.1' && (
          <ChartOfAccountsDesk
            accounts={financeData.accounts}
            journalEntries={financeData.journalEntries}
            onAddAccount={handleAddAccount}
            onPostJournalEntry={handlePostJournalEntry}
          />
        )}

        {activeSubtab === '13.2' && (
          <VouchersDesk
            vouchers={financeData.vouchers}
            accounts={financeData.accounts}
            onCreateVoucher={handleCreateVoucher}
            onUpdateVoucherStatus={handleUpdateVoucherStatus}
          />
        )}

        {activeSubtab === '13.3' && (
          <DoctorPayoutDesk
            doctors={financeData.doctors}
            onDisbursePayout={handleDisburseDoctorPayout}
            onCalculatePayout={handleCalculateAllPayouts}
          />
        )}

        {activeSubtab === '13.4' && (
          <BankReconciliationDesk
            bankReconciliations={financeData.bankReconciliations}
            onToggleReconciledItem={handleToggleReconciledItem}
            onAutoMatchBank={handleAutoMatchBank}
            onAddBankAdjustment={handleAddBankAdjustment}
          />
        )}

        {activeSubtab === '13.5' && (
          <FinancialReportsDesk
            accounts={financeData.accounts}
            plStatement={financeData.plStatement}
          />
        )}
      </div>
    </div>
  );
}

export default FinanceView;
