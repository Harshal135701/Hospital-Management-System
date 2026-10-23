const fs = require('fs');

let code = fs.readFileSync('client/src/components/patients/PatientsView.jsx', 'utf8');

// 1. Add calculated age badge and additional fields to registration form
const oldDobBlock = `            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              error={formErrors.dob}
              helperText="Optional, but recommended for clinical charting"
              onChange={(e) => {
                setFormData({ ...formData, dob: e.target.value });
                if (formErrors.dob) setFormErrors({ ...formErrors, dob: null });
              }}
            />`;

const newDobBlock = `            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Date of Birth
                </label>
                {formData.dob && calculateAge(formData.dob) && (
                  <Badge variant="teal" size="sm">Age: {calculateAge(formData.dob)}</Badge>
                )}
              </div>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => {
                  setFormData({ ...formData, dob: e.target.value });
                  if (formErrors.dob) setFormErrors({ ...formErrors, dob: null });
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: formErrors.dob ? '1.5px solid var(--color-error)' : '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
              {formErrors.dob && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                  {formErrors.dob}
                </div>
              )}
            </div>`;

code = code.replace(oldDobBlock, newDobBlock);

// 2. Add Alternate Contact & Email
const oldMobileInput = `          <Input
            label="Mobile Contact Number"
            required
            placeholder="+91 98765 43210 or 9876543210"
            value={formData.mobile}
            error={formErrors.mobile}
            helperText="10-digit primary mobile number for SMS and WhatsApp communications"
            onChange={(e) => {
              setFormData({ ...formData, mobile: e.target.value });
              if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: null });
            }}
          />`;

const newContactBlock = `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Primary Mobile Number"
              required
              placeholder="+91 98765 43210"
              value={formData.mobile}
              error={formErrors.mobile}
              helperText="10-digit primary contact"
              onChange={(e) => {
                setFormData({ ...formData, mobile: e.target.value });
                if (formErrors.mobile) setFormErrors({ ...formErrors, mobile: null });
              }}
            />

            <Input
              label="Alternate Mobile (Optional)"
              placeholder="e.g. 9831099887"
              value={formData.altMobile}
              helperText="Secondary contact"
              onChange={(e) => setFormData({ ...formData, altMobile: e.target.value })}
            />
          </div>

          <Input
            label="Email Address (Optional)"
            type="email"
            placeholder="patient@example.com"
            value={formData.email}
            helperText="For digital consultation receipts and investigation lab reports"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />`;

code = code.replace(oldMobileInput, newContactBlock);

// 3. Add Location Fields: Address, City, District, State, PIN
const oldAddressInput = `          <Input
            label="Residential Address"
            placeholder="Flat / House, Street, Area / Locality"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />`;

const newAddressBlock = `          <Input
            label="Residential Address"
            placeholder="Flat / House, Street, Area / Locality"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={formData.pinCode}
              onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
            />
          </div>`;

code = code.replace(oldAddressInput, newAddressBlock);

// 4. Add Emergency Relationship, Allergies, High-risk flag
const oldEmergencyBlock = `          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Emergency Contact Name"
              placeholder="e.g. Rahul Deshmukh (Spouse)"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />

            <Input
              label="Emergency Contact Phone"
              placeholder="e.g. 9831044521"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>`;

const newEmergencyBlock = `          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Emergency Contact Name"
              placeholder="e.g. Rahul Deshmukh"
              value={formData.emergencyName}
              onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
            />

            <Select
              label="Relationship"
              value={formData.emergencyRelationship}
              onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
              options={[
                { value: 'Spouse', label: 'Spouse' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Child', label: 'Child / Dependent' },
                { value: 'Sibling', label: 'Sibling' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            <Input
              label="Emergency Phone"
              placeholder="e.g. 9831044521"
              value={formData.emergencyPhone}
              onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
            <Input
              label="Known Drug Allergies / Alerts"
              placeholder="e.g. Penicillin, Sulfa drugs, None"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            />

            <div style={{ paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input
                  type="checkbox"
                  checked={formData.highRisk}
                  onChange={(e) => setFormData({ ...formData, highRisk: e.target.checked })}
                />
                <span style={{ fontWeight: '600', color: formData.highRisk ? '#DC2626' : 'var(--color-text-primary)' }}>
                  Mark as High Risk
                </span>
              </label>
            </div>
          </div>`;

code = code.replace(oldEmergencyBlock, newEmergencyBlock);

// 5. Append Edit Patient Modal right before the last closing </div>
const editModalHtml = `
      {/* Edit Patient Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          if (!isEditSubmitting) {
            setIsEditModalOpen(false);
            setEditingPatient(null);
          }
        }}
        title="Edit Patient Demographic Details"
        subtitle={editingPatient ? \`Updating record for \${editingPatient.full_name} (\${editingPatient.uhid})\` : 'Update Patient'}
        maxWidth="680px"
      >
        <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {editApiError && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: '#991B1B',
                fontSize: 'var(--font-size-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
              <div>{editApiError}</div>
            </div>
          )}

          <Input
            label="Patient Full Name"
            required
            value={editFormData.fullName || ''}
            onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                  Date of Birth
                </label>
                {editFormData.dob && calculateAge(editFormData.dob) && (
                  <Badge variant="teal" size="sm">Age: {calculateAge(editFormData.dob)}</Badge>
                )}
              </div>
              <input
                type="date"
                value={editFormData.dob || ''}
                onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)'
                }}
              />
            </div>

            <Select
              label="Gender"
              required
              value={editFormData.gender || 'female'}
              onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
              options={[
                { value: 'female', label: 'Female' },
                { value: 'male', label: 'Male' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Select
              label="Blood Group"
              value={editFormData.bloodGroup || 'B'}
              onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
              options={['A', 'B', 'AB', 'O']}
            />

            <Select
              label="Rh Factor"
              value={editFormData.rhFactor || 'positive'}
              onChange={(e) => setEditFormData({ ...editFormData, rhFactor: e.target.value })}
              options={[
                { value: 'positive', label: 'Rh Positive (+)' },
                { value: 'negative', label: 'Rh Negative (-)' }
              ]}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="Primary Mobile Number"
              required
              value={editFormData.mobile || ''}
              onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
            />

            <Input
              label="Alternate Mobile"
              value={editFormData.altMobile || ''}
              onChange={(e) => setEditFormData({ ...editFormData, altMobile: e.target.value })}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            value={editFormData.email || ''}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
          />

          <Input
            label="Residential Address"
            value={editFormData.address || ''}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
            <Input
              label="City"
              value={editFormData.city || ''}
              onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
            />
            <Input
              label="District"
              value={editFormData.district || ''}
              onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
            />
            <Input
              label="State"
              value={editFormData.state || ''}
              onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
            />
            <Input
              label="PIN Code"
              value={editFormData.pinCode || ''}
              onChange={(e) => setEditFormData({ ...editFormData, pinCode: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
            <Input
              label="Emergency Contact Name"
              value={editFormData.emergencyName || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyName: e.target.value })}
            />

            <Select
              label="Relationship"
              value={editFormData.emergencyRelationship || 'Spouse'}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyRelationship: e.target.value })}
              options={[
                { value: 'Spouse', label: 'Spouse' },
                { value: 'Parent', label: 'Parent' },
                { value: 'Child', label: 'Child / Dependent' },
                { value: 'Sibling', label: 'Sibling' },
                { value: 'Guardian', label: 'Legal Guardian' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Other', label: 'Other' }
              ]}
            />

            <Input
              label="Emergency Phone"
              value={editFormData.emergencyPhone || ''}
              onChange={(e) => setEditFormData({ ...editFormData, emergencyPhone: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
            <Input
              label="Known Allergies"
              value={editFormData.allergies || ''}
              onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
            />

            <div style={{ paddingTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: 'var(--font-size-sm)' }}>
                <input
                  type="checkbox"
                  checked={Boolean(editFormData.highRisk)}
                  onChange={(e) => setEditFormData({ ...editFormData, highRisk: e.target.checked })}
                />
                <span style={{ fontWeight: '600', color: editFormData.highRisk ? '#DC2626' : 'var(--color-text-primary)' }}>
                  Mark as High Risk
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button
              variant="ghost"
              disabled={isEditSubmitting}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPatient(null);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              type="submit"
              loading={isEditSubmitting}
              icon={Check}
            >
              {isEditSubmitting ? 'Saving...' : 'Save Patient Changes'}
            </Button>
          </div>
        </form>
      </Modal>
`;

code = code.replace("    </div>\n  );\n};", editModalHtml + "\n    </div>\n  );\n};");
code = code.replace("    </div>\r\n  );\r\n};", editModalHtml + "\r\n    </div>\r\n  );\r\n};");

fs.writeFileSync('client/src/components/patients/PatientsView.jsx', code, 'utf8');
console.log('Successfully completed PatientsView.jsx enhancements!');
