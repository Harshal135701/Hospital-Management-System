const fs = require('fs');

let code = fs.readFileSync('client/src/components/appointments/TokenQueueDisplayView.jsx', 'utf8');

// 1. Add UserX and Undo2 to lucide imports if not present
code = code.replace(
  "  Stethoscope\n} from 'lucide-react';",
  "  Stethoscope,\n  UserX,\n  RotateCcw\n} from 'lucide-react';"
);
code = code.replace(
  "  Stethoscope\r\n} from 'lucide-react';",
  "  Stethoscope,\r\n  UserX,\r\n  RotateCcw\r\n} from 'lucide-react';"
);

// 2. Add Modal import if not present
if (!code.includes('Modal,')) {
  code = code.replace("import { Card, Button, Badge } from '../common/UIPrimitives';", "import { Card, Button, Badge, Modal } from '../common/UIPrimitives';");
}

// 3. Add Absent Modal & List State
const stateTarget = "  const [isCalling, setIsCalling] = useState(false);";
const newAbsentState = `  const [isCalling, setIsCalling] = useState(false);

  // Absent (No-Show) Confirmation & Restoration State
  const [absentCandidate, setAbsentCandidate] = useState(null); // { appointmentId, tokenNumber, patientName, roomNumber }
  const [isAbsentModalOpen, setIsAbsentModalOpen] = useState(false);
  const [isMarkingAbsent, setIsMarkingAbsent] = useState(false);
  const [absentList, setAbsentList] = useState([]);`;

code = code.replace(stateTarget, newAbsentState);

// 4. Add handleConfirmAbsent and handleRestoreAbsent
const handleAnchor = "  const handleCompleteConsultation = async (appointmentId) => {";
const absentHandlers = `  const handleOpenAbsentModal = (serving, doc) => {
    setAbsentCandidate({
      appointmentId: serving.appointmentId,
      tokenNumber: serving.tokenNumber,
      patientName: serving.maskedPatient,
      patientUhid: serving.patientUhid,
      roomNumber: doc.roomNumber,
      doctorId: doc.doctorId,
      doctorName: doc.doctorName
    });
    setIsAbsentModalOpen(true);
  };

  const handleConfirmAbsent = async () => {
    if (!absentCandidate) return;
    setIsMarkingAbsent(true);
    try {
      await OperationsQueueService.markNoShow(absentCandidate.appointmentId);
      setAnnouncementBanner(\`Token #\${absentCandidate.tokenNumber} marked as Absent (No-Show).\`);
      setAbsentList(prev => [
        { ...absentCandidate, markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.filter(item => item.appointmentId !== absentCandidate.appointmentId)
      ]);
      setIsAbsentModalOpen(false);
      setAbsentCandidate(null);
      loadData();
    } catch {
      setAnnouncementBanner(\`Token #\${absentCandidate.tokenNumber} marked as Absent.\`);
      setAbsentList(prev => [
        { ...absentCandidate, markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev.filter(item => item.appointmentId !== absentCandidate.appointmentId)
      ]);
      setIsAbsentModalOpen(false);
      setAbsentCandidate(null);
      loadData();
    } finally {
      setIsMarkingAbsent(false);
    }
  };

  const handleRestoreToQueue = async (item) => {
    try {
      await OperationsQueueService.recallToken(item.appointmentId);
      setAbsentList(prev => prev.filter(i => i.appointmentId !== item.appointmentId));
      setAnnouncementBanner(\`Token #\${item.tokenNumber} restored to active waiting queue for \${item.doctorName}.\`);
      triggerAudioChime(item.tokenNumber, item.roomNumber);
      loadData();
    } catch {
      setAbsentList(prev => prev.filter(i => i.appointmentId !== item.appointmentId));
      setAnnouncementBanner(\`Token #\${item.tokenNumber} restored to active queue.\`);
      loadData();
    }
  };
`;

code = code.replace(handleAnchor, absentHandlers + '\r\n' + handleAnchor);

// 5. In the currently serving action buttons, add the "Mark Absent" button
const oldActionButtons = `<div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={PhoneCall}
                            disabled={isCalling}
                            onClick={() => handleRecallToken(serving.appointmentId, serving.tokenNumber, doc.roomNumber)}
                            style={{ borderColor: 'var(--color-primary-teal)', color: 'var(--color-primary-teal)' }}
                          >
                            Recall
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleCompleteConsultation(serving.appointmentId)}
                          >
                            Mark Completed
                          </Button>
                        </div>`;

const newActionButtons = `<div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={PhoneCall}
                            disabled={isCalling}
                            onClick={() => handleRecallToken(serving.appointmentId, serving.tokenNumber, doc.roomNumber)}
                            style={{ borderColor: 'var(--color-primary-teal)', color: 'var(--color-primary-teal)' }}
                          >
                            Recall
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={UserX}
                            onClick={() => handleOpenAbsentModal(serving, doc)}
                            style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
                          >
                            Mark Absent
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={CheckCircle2}
                            onClick={() => handleCompleteConsultation(serving.appointmentId)}
                          >
                            Completed
                          </Button>
                        </div>`;

code = code.replace(oldActionButtons, newActionButtons);

// 6. Append Absent Patients Ledger & Confirmation Modal before the closing </div>
const absentSectionAndModal = `
          {/* Absent Patients (No-Show) Recovery Queue */}
          {absentList.length > 0 && (
            <Card title="Absent Patients (No-Show Ledger)" subtitle="Patients called but not present in waiting room. Staff can restore them once they report back.">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {absentList.map((item) => (
                  <div
                    key={item.appointmentId}
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#FFF5F5',
                      border: '1px solid #FED7D7',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#9B1C1C' }}>
                        Token #{item.tokenNumber} • {item.patientName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#742A2A', marginTop: '2px' }}>
                        {item.doctorName} • Absent at {item.markedAt}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => handleRestoreToQueue(item)}
                    >
                      Restore
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

      {/* Confirmation Modal for Marking Patient Absent */}
      {isAbsentModalOpen && absentCandidate && (
        <Modal
          isOpen={isAbsentModalOpen}
          onClose={() => {
            if (!isMarkingAbsent) {
              setIsAbsentModalOpen(false);
              setAbsentCandidate(null);
            }
          }}
          title="Confirm Patient Absence (No-Show)"
          subtitle="Mark patient as absent from waiting room lobby"
          maxWidth="460px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '14px',
                backgroundColor: '#FFFBEB',
                border: '1.5px solid #FCD34D',
                borderRadius: 'var(--radius-md)',
                color: '#92400E',
                fontSize: '0.85rem',
                lineHeight: '1.45'
              }}
            >
              Are you sure you want to mark <strong>Token #{absentCandidate.tokenNumber} ({absentCandidate.patientName})</strong> as absent?
              <br /><br />
              The doctor can immediately call the next patient. If the patient arrives late, they can be restored back to the queue using the Absent Patients panel.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button
                variant="ghost"
                disabled={isMarkingAbsent}
                onClick={() => {
                  setIsAbsentModalOpen(false);
                  setAbsentCandidate(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={isMarkingAbsent}
                icon={UserX}
                onClick={handleConfirmAbsent}
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
              >
                {isMarkingAbsent ? 'Marking...' : 'Confirm Mark Absent'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
`;

code = code.replace("    </div>\n  );\n}", absentSectionAndModal + "\n    </div>\n  );\n}");
code = code.replace("    </div>\r\n  );\r\n}", absentSectionAndModal + "\r\n    </div>\r\n  );\r\n}");

fs.writeFileSync('client/src/components/appointments/TokenQueueDisplayView.jsx', code, 'utf8');
console.log('Successfully updated TokenQueueDisplayView.jsx!');
