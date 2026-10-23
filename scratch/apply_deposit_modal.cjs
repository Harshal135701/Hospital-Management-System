const fs = require('fs');
const path = require('path');

const file = path.resolve('client/src/components/billing/operations/AdvanceDepositView.jsx');
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// 1. Add formError display in modal
content = content.replace(
  '<form onSubmit={handleDepositSubmit} style={{ display: \'flex\', flexDirection: \'column\', gap: \'14px\' }}>',
  `<form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {formError && (
            <div style={{ padding: '8px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-md)', color: '#DC2626', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={15} />
              <span>{formError}</span>
            </div>
          )}`
);

// 2. Add Money Receipt Modal before the closing </div>
const receiptModal = `
      {/* Printable Advance Money Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Advance Deposit Money Receipt"
        size="md"
      >
        {selectedReceipt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem',
                lineHeight: 1.5
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #087F8C', paddingBottom: '10px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#087F8C', fontWeight: '800', fontSize: '1.1rem' }}>APEX CENTRAL HOSPITAL</h3>
                  <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>Advance Cashier & Trust Collections Desk</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#087F8C' }}>{selectedReceipt.receipt_number}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Date: {formatDateTimeIN(selectedReceipt.date)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', backgroundColor: '#F9FAFB', padding: '10px', borderRadius: '4px' }}>
                <div><strong>Patient Name:</strong> {selectedReceipt.patient_name}</div>
                <div><strong>UHID:</strong> {selectedReceipt.patient_uhid}</div>
                <div><strong>Admission Ref:</strong> {selectedReceipt.admission_number}</div>
                <div><strong>Payment Mode:</strong> {selectedReceipt.payment_mode}</div>
                {selectedReceipt.txn_ref && <div><strong>Txn Ref:</strong> {selectedReceipt.txn_ref}</div>}
                <div><strong>Received By:</strong> {selectedReceipt.received_by}</div>
              </div>

              <div style={{ borderTop: '1px dashed #D1D5DB', borderBottom: '1.5px solid #111827', padding: '10px 0', margin: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700' }}>DEPOSIT AMOUNT RECEIVED:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#087F8C' }}>{formatINR(selectedReceipt.amount)}</span>
              </div>

              {selectedReceipt.notes && (
                <div style={{ fontSize: '0.75rem', color: '#4B5563', fontStyle: 'italic', marginTop: '6px' }}>
                  Notes: {selectedReceipt.notes}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>
                Print Money Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}`;

content = content.replace(/\s*<\/div>\s*<span style.*<\/span>\s*<\/Modal>\s*<\/div>\s*\);\s*}\s*$/m, '');
// Replace the end of the file
content = content.replace(/<\/Modal>\s*<\/div>\s*\);\s*}\s*$/, `</Modal>${receiptModal}`);

fs.writeFileSync(file, content, 'utf8');
console.log('AdvanceDepositView receipt modal added');
