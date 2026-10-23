const fs = require('fs');

let code = fs.readFileSync('client/src/components/billing/operations/IpdRunningBillView.jsx', 'utf8');

// 1. Add Special Service modal state
const stateAnchor = "  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);";
const newSpecialStates = `  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Add Special Service State
  const [isSpecialServiceModalOpen, setIsSpecialServiceModalOpen] = useState(false);
  const [specialServiceForm, setSpecialServiceForm] = useState({
    name: 'ABCD - Bedside Special Clinical Care',
    rate: 400,
    qty: 1,
    notes: 'Prescribed attending specialist monitoring'
  });`;

code = code.replace(stateAnchor, newSpecialStates);

// 2. Add handleAddSpecialService function
const recordPaymentAnchor = "  const handleRecordPayment = (e) => {";
const addSpecialServiceFunc = `  const handleAddSpecialService = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    const rate = parseFloat(specialServiceForm.rate) || 0;
    const qty = parseInt(specialServiceForm.qty) || 1;
    const totalAdded = rate * qty;
    if (totalAdded <= 0) return;

    setInpatientBills(prev =>
      prev.map(p =>
        p.id === selectedPatient.id
          ? {
              ...p,
              procedure_charges: (p.procedure_charges || 0) + totalAdded,
              special_services: [
                ...(p.special_services || []),
                { name: specialServiceForm.name, rate, qty, total: totalAdded, date: new Date().toISOString() }
              ]
            }
          : p
      )
    );

    setSelectedPatient(prev => ({
      ...prev,
      procedure_charges: (prev.procedure_charges || 0) + totalAdded,
      special_services: [
        ...(prev.special_services || []),
        { name: specialServiceForm.name, rate, qty, total: totalAdded, date: new Date().toISOString() }
      ]
    }));

    setIsSpecialServiceModalOpen(false);
    setSuccessBanner(\`Special service '\${specialServiceForm.name}' of \${formatINR(totalAdded)} billed to \${selectedPatient.patient_name}.\`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };
`;

code = code.replace(recordPaymentAnchor, addSpecialServiceFunc + '\r\n' + recordPaymentAnchor);

// 3. Add button in itemized card
const buttonGridAnchor = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => setIsStatementModalOpen(true)}
              >
                Statement
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            </div>`;

const newButtonGrid = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '8px', marginTop: '16px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => setIsStatementModalOpen(true)}
              >
                Statement
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setIsSpecialServiceModalOpen(true)}
              >
                + Special Service
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={CreditCard}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Record Payment
              </Button>
            </div>`;

code = code.replace(buttonGridAnchor, newButtonGrid);

// 4. Append Special Service Modal
const specialServiceModalHtml = `
      {/* Add Special Service Modal */}
      {isSpecialServiceModalOpen && (
        <Modal
          isOpen={isSpecialServiceModalOpen}
          onClose={() => setIsSpecialServiceModalOpen(false)}
          title="Add Special Clinical Service to Running Bill"
          subtitle={\`Billing service to \${selectedPatient.patient_name} (\${selectedPatient.ward_bed})\`}
          maxWidth="500px"
        >
          <form onSubmit={handleAddSpecialService} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Service Description"
              required
              value={specialServiceForm.name}
              onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, name: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Tariff / Unit Rate (₹)"
                type="number"
                min="1"
                required
                value={specialServiceForm.rate}
                onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, rate: e.target.value })}
              />

              <Input
                label="Quantity / Units"
                type="number"
                min="1"
                required
                value={specialServiceForm.qty}
                onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, qty: e.target.value })}
              />
            </div>

            <Input
              label="Clinical Remarks / Prescribing Doctor"
              value={specialServiceForm.notes}
              onChange={(e) => setSpecialServiceForm({ ...specialServiceForm, notes: e.target.value })}
            />

            <div style={{ padding: '10px 14px', backgroundColor: '#F8FBFB', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Net Accrued Charge:</span>
              <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-primary-teal)' }}>
                {formatINR((parseFloat(specialServiceForm.rate) || 0) * (parseInt(specialServiceForm.qty) || 1))}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsSpecialServiceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Add to Running Bill
              </Button>
            </div>
          </form>
        </Modal>
      )}
`;

code = code.replace("    </div>\n  );\n}", specialServiceModalHtml + "\n    </div>\n  );\n}");
code = code.replace("    </div>\r\n  );\r\n}", specialServiceModalHtml + "\r\n    </div>\r\n  );\r\n}");

fs.writeFileSync('client/src/components/billing/operations/IpdRunningBillView.jsx', code, 'utf8');
console.log('Successfully updated IpdRunningBillView.jsx!');
