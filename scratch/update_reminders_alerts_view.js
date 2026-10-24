const fs = require('fs');

let code = fs.readFileSync('client/src/components/appointments/RemindersAlertsView.jsx', 'utf8');

// 1. Add new state for Batch Reminders
const stateAnchor = "  const [isSending, setIsSending] = useState(false);";
const batchStates = `  const [isSending, setIsSending] = useState(false);

  // Manual Date-Selection Batch Reminders State
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [batchDate, setBatchDate] = useState(tomorrowStr);
  const [batchAppointments, setBatchAppointments] = useState([]);
  const [selectedApptIds, setSelectedApptIds] = useState(new Set());
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchResults, setBatchResults] = useState(null);`;

code = code.replace(stateAnchor, batchStates);

// 2. Add batch reminder handlers
const handlerAnchor = "  const loadData = useCallback(async () => {";
const batchHandlers = `  const fetchAppointmentsForBatch = async (date) => {
    setIsLoadingBatch(true);
    setBatchResults(null);
    try {
      const data = await OperationsQueueService.getAppointmentsByDate(date);
      const list = Array.isArray(data) ? data : [];
      setBatchAppointments(list);
      setSelectedApptIds(new Set(list.map(a => a.id)));
    } catch {
      setBatchAppointments([]);
      setSelectedApptIds(new Set());
    } finally {
      setIsLoadingBatch(false);
    }
  };

  const handleSendBatchReminders = async () => {
    if (selectedApptIds.size === 0) return;
    setIsSendingBatch(true);
    try {
      const ids = Array.from(selectedApptIds);
      const res = await OperationsQueueService.sendRemindersForDate(batchDate, ids);
      setBatchResults(res?.data || res);
      setSuccessBanner(\`Successfully triggered 1-day-before batch appointment reminders for \${ids.length} patient(s).\`);
      loadData();
    } catch (err) {
      setSuccessBanner(null);
      alert(err.message || 'Failed to dispatch batch reminders.');
    } finally {
      setIsSendingBatch(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsForBatch(batchDate);
  }, [batchDate]);
`;

code = code.replace(handlerAnchor, batchHandlers + '\r\n' + handlerAnchor);

// 3. Insert the Batch Day-Before Reminders UI Card right after the Success Notification Banner
const bannerAnchor = "      {/* Success Notification Banner */}";
const batchUiCard = `      {/* Day-Before Manual Date Selection Batch Reminders Card */}
      <Card
        title="1-Day-Before Batch Appointment Reminders"
        subtitle="Select consultation date to review tomorrow's scheduled clinic roster and dispatch automated SMS / WhatsApp reminders."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-primary)' }}>
                Target Appointment Date:
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={(e) => setBatchDate(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: '0.85rem'
                }}
              />
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                loading={isLoadingBatch}
                onClick={() => fetchAppointmentsForBatch(batchDate)}
              >
                Refresh List
              </Button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {batchAppointments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedApptIds.size === batchAppointments.length) {
                      setSelectedApptIds(new Set());
                    } else {
                      setSelectedApptIds(new Set(batchAppointments.map(a => a.id)));
                    }
                  }}
                >
                  {selectedApptIds.size === batchAppointments.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                loading={isSendingBatch}
                disabled={isSendingBatch || selectedApptIds.size === 0}
                onClick={handleSendBatchReminders}
              >
                Send Reminders ({selectedApptIds.size})
              </Button>
            </div>
          </div>

          {/* Appointments Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '8px 12px', width: '40px' }}></th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Patient Name</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>UHID</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Doctor / Dept</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Slot Time</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Mobile Contact</th>
                  <th style={{ padding: '8px 12px', fontWeight: '600' }}>Delivery Status</th>
                </tr>
              </thead>
              <tbody>
                {batchAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No booked appointments scheduled on {formatDateIN(batchDate)}. Select another date to preview reminders.
                    </td>
                  </tr>
                ) : (
                  batchAppointments.map((appt) => {
                    const isSelected = selectedApptIds.has(appt.id);
                    const apptResult = batchResults?.results?.find(r => r.appointmentId === appt.id);
                    return (
                      <tr key={appt.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: isSelected ? 'rgba(8, 127, 140, 0.04)' : 'transparent' }}>
                        <td style={{ padding: '8px 12px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const next = new Set(selectedApptIds);
                              if (e.target.checked) next.add(appt.id);
                              else next.delete(appt.id);
                              setSelectedApptIds(next);
                            }}
                          />
                        </td>
                        <td style={{ padding: '8px 12px', fontWeight: '600' }}>{appt.patient_name}</td>
                        <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{appt.patient_uhid || 'Registered'}</td>
                        <td style={{ padding: '8px 12px' }}>{appt.doctor_name} ({appt.department_name})</td>
                        <td style={{ padding: '8px 12px' }}>{String(appt.start_time).slice(0, 5)}</td>
                        <td style={{ padding: '8px 12px' }}>{appt.mobile || 'No mobile'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          {apptResult ? (
                            <Badge variant={apptResult.status === 'sent' ? 'success' : 'danger'} size="sm">
                              {apptResult.status.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant="teal" size="sm">READY</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
`;

code = code.replace(bannerAnchor, batchUiCard + '\r\n' + bannerAnchor);

fs.writeFileSync('client/src/components/appointments/RemindersAlertsView.jsx', code, 'utf8');
console.log('Successfully updated RemindersAlertsView.jsx!');
