const fs = require('fs');

let wardCode = fs.readFileSync('client/src/components/wards/WardsView.jsx', 'utf8');

// 1. Add RoomService, DepartmentService, formatINR, Input, Select imports
wardCode = wardCode.replace(
  "import { Card, Button, Badge, SafeImage, Modal } from '../common/UIPrimitives';",
  "import { Card, Button, Badge, SafeImage, Modal, Input, Select } from '../common/UIPrimitives';\r\nimport { RoomService, DepartmentService, TokenManager } from '../../services/api';\r\nimport { formatINR } from '../../utils/formatters';"
);

// 2. Add Add Room Modal State
const stateAnchor = "  const [filterCategory, setFilterCategory] = useState('all');";
const newRoomStates = `  const [filterCategory, setFilterCategory] = useState('all');
  const [successBanner, setSuccessBanner] = useState(null);

  // Add Room / Bed Modal State
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [roomForm, setRoomForm] = useState({
    roomNumber: '105',
    name: 'General Ward Room 105',
    floor: '1st Floor',
    roomType: 'General Ward',
    departmentId: '',
    capacity: 4,
    dailyTariff: 2000
  });
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);
  const [roomModalError, setRoomModalError] = useState(null);`;

wardCode = wardCode.replace(stateAnchor, newRoomStates);

// 3. Add department loader and submit handler
const effectAnchor = "  useEffect(() => {\r\n    async function loadWards() {";
const effectAnchorLf = "  useEffect(() => {\n    async function loadWards() {";

const deptLoaderCode = `  useEffect(() => {
    async function loadDepts() {
      try {
        const depts = await DepartmentService.getDepartments();
        if (Array.isArray(depts)) setDepartmentsList(depts);
      } catch {}
    }
    loadDepts();
  }, []);

  const handleAddRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.roomNumber.trim() || !roomForm.name.trim()) {
      setRoomModalError('Room number and name are required.');
      return;
    }
    setIsSubmittingRoom(true);
    setRoomModalError(null);

    try {
      const payload = {
        room_number: roomForm.roomNumber.trim(),
        name: roomForm.name.trim(),
        floor: roomForm.floor.trim(),
        room_type: roomForm.roomType,
        department_id: roomForm.departmentId || (departmentsList[0]?.id || null),
        capacity: parseInt(roomForm.capacity) || 1,
        daily_tariff: parseFloat(roomForm.dailyTariff) || 2000
      };

      if (TokenManager.getToken()) {
        const res = await RoomService.createRoom(payload);
        const created = res?.data || res;
        setWards(prev => [
          {
            id: created.id,
            name: created.name,
            wing: \`\${created.floor} Wing\`,
            category: created.room_type,
            imageKey: created.room_type === 'ICU' ? 'hospitalRoomPrivate' : 'inpatientWardBed',
            total_beds: created.capacity,
            occupied_beds: 0,
            available_beds: created.capacity,
            nurse_lead: 'Sister Incharge',
            target_temp: '22°C (Controlled)',
            daily_tariff: created.daily_tariff,
            beds: Array.from({ length: created.capacity }).map((_, idx) => ({
              id: \`\${created.id}-b\${idx+1}\`,
              number: \`Bed \${created.room_number}-\${String(idx+1).padStart(2, '0')}\`,
              status: 'available',
              telemetry: 'Clean / Sanitized'
            }))
          },
          ...prev
        ]);
      } else {
        const newRoom = {
          id: \`rm-\${Date.now()}\`,
          name: payload.name,
          wing: \`\${payload.floor} Wing\`,
          category: payload.room_type,
          imageKey: payload.room_type === 'ICU' ? 'hospitalRoomPrivate' : 'inpatientWardBed',
          total_beds: payload.capacity,
          occupied_beds: 0,
          available_beds: payload.capacity,
          nurse_lead: 'Sister Incharge',
          target_temp: '22°C (Controlled)',
          daily_tariff: payload.daily_tariff,
          beds: Array.from({ length: payload.capacity }).map((_, idx) => ({
            id: \`rm-\${Date.now()}-b\${idx+1}\`,
            number: \`Bed \${payload.room_number}-\${String(idx+1).padStart(2, '0')}\`,
            status: 'available',
            telemetry: 'Clean / Sanitized'
          }))
        };
        setWards(prev => [newRoom, ...prev]);
      }

      setIsAddRoomOpen(false);
      setSuccessBanner(\`Room \${payload.name} (\${payload.room_type}) added with daily tariff of \${formatINR(payload.daily_tariff)}.\`);
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      setRoomModalError(err.message || 'Failed to add room.');
    } finally {
      setIsSubmittingRoom(false);
    }
  };
`;

if (wardCode.includes(effectAnchor)) {
  wardCode = wardCode.replace(effectAnchor, deptLoaderCode + '\r\n' + effectAnchor);
} else {
  wardCode = wardCode.replace(effectAnchorLf, deptLoaderCode + '\n' + effectAnchorLf);
}

// 4. Add "+ Add Room" button in header
const headerButtonAnchor = `{onBack && (
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
            Back to Dashboard
          </Button>
        )}`;

const newHeaderButtons = `<div style={{ display: 'flex', gap: '10px' }}>
          {onBack && (
            <Button variant="outline" size="sm" icon={ArrowLeft} onClick={onBack}>
              Back
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setRoomForm({
                roomNumber: \`\${Math.floor(100 + Math.random() * 800)}\`,
                name: 'Inpatient Care Room',
                floor: '1st Floor',
                roomType: 'General Ward',
                departmentId: departmentsList[0]?.id || '',
                capacity: 4,
                dailyTariff: 2000
              });
              setRoomModalError(null);
              setIsAddRoomOpen(true);
            }}
          >
            + Add Room / Ward
          </Button>
        </div>`;

wardCode = wardCode.replace(headerButtonAnchor, newHeaderButtons);

// 5. Add Daily Tariff display on ward card
const wardCardTitleAnchor = `<h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                        {w.name}
                      </h3>`;

const newWardCardTitle = `<h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#FFFFFF', margin: '2px 0 0 0' }}>
                        {w.name}
                      </h3>
                      {w.daily_tariff && (
                        <div style={{ fontSize: '0.72rem', color: '#64D8D0', fontWeight: '700' }}>
                          Tariff: {formatINR(Number(w.daily_tariff))}/day
                        </div>
                      )}`;

wardCode = wardCode.replace(wardCardTitleAnchor, newWardCardTitle);

// 6. Append Add Room Modal before closing </div>
const addRoomModalHtml = `
      {/* Add Inpatient Room Modal */}
      {isAddRoomOpen && (
        <Modal
          isOpen={isAddRoomOpen}
          onClose={() => setIsAddRoomOpen(false)}
          title="Add Inpatient Room & Ward Capacity"
          subtitle="Configure room number, tariff, ward type, and bed bay capacity"
          maxWidth="540px"
        >
          <form onSubmit={handleAddRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {roomModalError && (
              <div style={{ padding: '10px 14px', backgroundColor: '#FDE8E8', borderRadius: 'var(--radius-md)', color: '#9B1C1C', fontSize: '0.85rem' }}>
                {roomModalError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '12px' }}>
              <Input
                label="Room Number"
                required
                placeholder="e.g. 204"
                value={roomForm.roomNumber}
                onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
              />

              <Input
                label="Room / Bay Name"
                required
                placeholder="e.g. Post-Op Recovery Ward"
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Room Classification Type
                </label>
                <select
                  value={roomForm.roomType}
                  onChange={(e) => {
                    const t = e.target.value;
                    let defTariff = 2000;
                    if (t === 'ICU') defTariff = 5000;
                    else if (t === 'Deluxe') defTariff = 4500;
                    else if (t === 'Semi-Private') defTariff = 3500;
                    setRoomForm({ ...roomForm, roomType: t, dailyTariff: defTariff });
                  }}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  <option value="General Ward">General Ward (₹2,000/day)</option>
                  <option value="ICU">Intensive Care Unit (ICU @ ₹5,000/day)</option>
                  <option value="Semi-Private">Semi-Private Sharing (₹3,500/day)</option>
                  <option value="Deluxe">Private Deluxe (₹4,500/day)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                  Assigned Department
                </label>
                <select
                  value={roomForm.departmentId}
                  onChange={(e) => setRoomForm({ ...roomForm, departmentId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--color-border)', fontSize: 'var(--font-size-sm)' }}
                >
                  {departmentsList.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
              <Input
                label="Floor / Level"
                value={roomForm.floor}
                onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
              />

              <Input
                label="Bed Capacity"
                type="number"
                min="1"
                max="20"
                required
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
              />

              <Input
                label="Daily Tariff (₹)"
                type="number"
                min="0"
                required
                value={roomForm.dailyTariff}
                onChange={(e) => setRoomForm({ ...roomForm, dailyTariff: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAddRoomOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSubmittingRoom} icon={CheckCircle2}>
                Add Room & Beds
              </Button>
            </div>
          </form>
        </Modal>
      )}
`;

wardCode = wardCode.replace("    </div>\n  );\n};", addRoomModalHtml + "\n    </div>\n  );\n};");
wardCode = wardCode.replace("    </div>\r\n  );\r\n};", addRoomModalHtml + "\r\n    </div>\r\n  );\r\n};");

fs.writeFileSync('client/src/components/wards/WardsView.jsx', wardCode, 'utf8');
console.log('Successfully updated WardsView.jsx!');
