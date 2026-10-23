const fs = require('fs');

let code = fs.readFileSync('client/src/components/billing/andrology/DonorRegistryView.jsx', 'utf8');

// 1. Add BillingOpsService and formatINR imports
code = code.replace(
  "import { INITIAL_DONOR_REGISTRY } from '../common/billingMockData';",
  "import { INITIAL_DONOR_REGISTRY } from '../common/billingMockData';\r\nimport { BillingOpsService } from '../../../services/api';\r\nimport { formatINR } from '../../../utils/formatters';"
);

// 2. Add IndianRupee icon to imports if not present
code = code.replace(
  "  Info\n} from 'lucide-react';",
  "  Info,\n  IndianRupee\n} from 'lucide-react';"
);
code = code.replace(
  "  Info\r\n} from 'lucide-react';",
  "  Info,\r\n  IndianRupee\r\n} from 'lucide-react';"
);

// 3. Add Payout Modal State
const stateAnchor = "  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);";
const newPayoutStates = `  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Compensation Payout Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutDonor, setPayoutDonor] = useState(null);
  const [payoutForm, setPayoutForm] = useState({
    amount: 5000,
    paymentMethod: 'neft',
    txnRef: '',
    approvedBy: 'ART Medical Director',
    notes: 'Medical & travel expense allowance under ART Regulation Act'
  });
  const [payoutHistory, setPayoutHistory] = useState([]);
  const [isDisbursing, setIsDisbursing] = useState(false);
  const [payoutError, setPayoutError] = useState(null);`;

code = code.replace(stateAnchor, newPayoutStates);

// 4. Add handleOpenPayout and handleDisburseSubmit
const handlerAnchor = "  const handleViewDossier = (donor) => {";
const payoutHandlers = `  const handleOpenPayout = async (donor) => {
    setPayoutDonor(donor);
    setPayoutForm({
      amount: 5000,
      paymentMethod: 'neft',
      txnRef: \`NEFT-\${Date.now().toString().slice(-6)}\`,
      approvedBy: 'ART Medical Director',
      notes: 'Medical & travel expense allowance under ART Regulation Act'
    });
    setPayoutError(null);
    setIsPayoutModalOpen(true);

    try {
      const records = await BillingOpsService.getDonorCompensations(donor.donorCode);
      setPayoutHistory(Array.isArray(records) ? records : []);
    } catch {
      setPayoutHistory([]);
    }
  };

  const handleDisburseSubmit = async (e) => {
    e.preventDefault();
    if (!payoutDonor) return;
    setIsDisbursing(true);
    setPayoutError(null);

    try {
      const payload = {
        donor_id: payoutDonor.id || payoutDonor.donorCode,
        donor_code: payoutDonor.donorCode,
        donor_category: payoutDonor.category,
        amount: parseFloat(payoutForm.amount) || 0,
        payment_method: payoutForm.paymentMethod,
        transaction_reference: payoutForm.txnRef || null,
        approved_by: payoutForm.approvedBy,
        notes: payoutForm.notes
      };

      const res = await BillingOpsService.disburseDonorCompensation(payload);
      const created = res?.data || res;
      setPayoutHistory(prev => [created, ...prev]);
      setSuccessBanner(\`Compensation payout of \${formatINR(payoutForm.amount)} disbursed to donor \${payoutDonor.donorCode}.\`);
      setIsPayoutModalOpen(false);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setPayoutError(err.message || 'Failed to process donor compensation disbursement.');
    } finally {
      setIsDisbursing(false);
    }
  };
`;

code = code.replace(handlerAnchor, payoutHandlers + '\r\n' + handlerAnchor);

// 5. Add Disburse button in table
const tableActionAnchor = `<td style={{ textAlign: 'right', padding: '10px' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => handleViewDossier(d)}
                    >
                      Dossier
                    </Button>
                  </td>`;

const newTableActions = `<td style={{ textAlign: 'right', padding: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Eye}
                        onClick={() => handleViewDossier(d)}
                      >
                        Dossier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={IndianRupee}
                        onClick={() => handleOpenPayout(d)}
                        style={{ borderColor: 'var(--color-primary-teal)', color: 'var(--color-primary-teal)' }}
                      >
                        Payout
                      </Button>
                    </div>
                  </td>`;

code = code.replace(tableActionAnchor, newTableActions);

// 6. Append Payout Modal
const payoutModalHtml = `
      {/* Donor Compensation Payout Modal */}
      {isPayoutModalOpen && payoutDonor && (
        <Modal
          isOpen={isPayoutModalOpen}
          onClose={() => {
            if (!isDisbursing) {
              setIsPayoutModalOpen(false);
              setPayoutDonor(null);
            }
          }}
          title="Disburse Donor Non-Revenue Compensation"
          subtitle={\`Confidential ICMR & ART Act compliant disbursement for \${payoutDonor.donorCode} (\${payoutDonor.category})\`}
          maxWidth="640px"
        >
          <form onSubmit={handleDisburseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {payoutError && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#FDE8E8',
                  borderRadius: 'var(--radius-md)',
                  color: '#9B1C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <AlertTriangle size={16} />
                <span>{payoutError}</span>
              </div>
            )}

            <div style={{ padding: '12px 14px', backgroundColor: '#F8FBFB', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-primary-teal)' }}>{payoutDonor.donorCode}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {payoutDonor.category} • Blood Group: {payoutDonor.bloodGroup} • Vials: {payoutDonor.inventoryVials}
                </div>
              </div>
              <Badge variant="teal" size="sm">ART Bank Certified</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Disbursement Amount (₹)"
                type="number"
                min="100"
                required
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
              />

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Payment Method
                </label>
                <select
                  value={payoutForm.paymentMethod}
                  onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  <option value="neft">NEFT / RTGS Wire Remittance</option>
                  <option value="upi">UPI Escrow / Bank Transfer</option>
                  <option value="cash">Direct Cash Voucher</option>
                  <option value="cheque">Bank Account Payee Cheque</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Bank Txn / UTR Reference"
                required
                value={payoutForm.txnRef}
                onChange={(e) => setPayoutForm({ ...payoutForm, txnRef: e.target.value })}
              />

              <Input
                label="Authorizing Medical Official"
                required
                value={payoutForm.approvedBy}
                onChange={(e) => setPayoutForm({ ...payoutForm, approvedBy: e.target.value })}
              />
            </div>

            <Input
              label="Disbursement Legal Justification / Notes"
              value={payoutForm.notes}
              onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
            />

            {/* Past Compensations History */}
            {payoutHistory.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Past Disbursements for {payoutDonor.donorCode}
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Ref #</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Mode</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payoutHistory.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                          <td style={{ padding: '6px 8px' }}>{item.compensation_number || item.transaction_reference}</td>
                          <td style={{ padding: '6px 8px' }}>{formatDateIN(item.created_at)}</td>
                          <td style={{ padding: '6px 8px', textTransform: 'uppercase' }}>{item.payment_method}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: '700', color: 'var(--color-primary-teal)' }}>
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button type="button" variant="ghost" disabled={isDisbursing} onClick={() => setIsPayoutModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isDisbursing} icon={IndianRupee}>
                {isDisbursing ? 'Disbursing...' : \`Disburse \${formatINR(parseFloat(payoutForm.amount) || 0)}\`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
`;

code = code.replace("    </div>\n  );\n}", payoutModalHtml + "\n    </div>\n  );\n}");
code = code.replace("    </div>\r\n  );\r\n}", payoutModalHtml + "\r\n    </div>\r\n  );\r\n}");

fs.writeFileSync('client/src/components/billing/andrology/DonorRegistryView.jsx', code, 'utf8');
console.log('Successfully updated DonorRegistryView.jsx!');
