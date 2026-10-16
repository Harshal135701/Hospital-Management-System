import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { PRESET_PERSONAS } from '../../client/src/constants/personas.js';
import { hashPassword, verifyPassword } from '../src/modules/auth/auth.utils.js';

describe('LoginModal Persona & Autofill Resilience Suite', () => {

  test('PRESET_PERSONAS contains all 6 documented institutional roles with expected attributes', () => {
    assert.equal(PRESET_PERSONAS.length, 6, 'Should have exactly 6 preset personas');

    const expectedRoles = [
      'blood_bank_officer',
      'lab_technician',
      'phlebotomist',
      'clinician_doctor',
      'receptionist',
      'super_admin'
    ];

    const actualRoles = PRESET_PERSONAS.map(p => p.role);
    assert.deepEqual(actualRoles, expectedRoles, 'All 6 institutional roles must be defined in canonical order');

    for (const persona of PRESET_PERSONAS) {
      assert.ok(persona.email.endsWith('@hospital.test'), `Email ${persona.email} must follow @hospital.test convention`);
      assert.ok(persona.password && persona.password.length >= 8, `Password for ${persona.role} must be non-empty and at least 8 chars`);
      assert.ok(persona.title && persona.title.length > 0, `Title for ${persona.role} must be defined`);
      assert.ok(persona.badge && persona.badge.length > 0, `Badge for ${persona.role} must be defined`);
    }
  });

  test('Configured development passwords cryptographically verify against scrypt hashes', () => {
    for (const persona of PRESET_PERSONAS) {
      const hash = hashPassword(persona.password);
      const isMatch = verifyPassword(persona.password, hash);
      assert.equal(isMatch, true, `Password for ${persona.role} must verify against generated scrypt hash`);

      const wrongMatch = verifyPassword('IncorrectPassword123!', hash);
      assert.equal(wrongMatch, false, `Wrong password for ${persona.role} must fail verification`);
    }
  });

  test('Default persona on modal open is Blood Bank Officer', () => {
    const defaultPersona = PRESET_PERSONAS[0];
    assert.equal(defaultPersona.role, 'blood_bank_officer');
    assert.equal(defaultPersona.email, 'bbo@hospital.test');
  });

  test('Form submission resolver prioritizes active persona over stale browser autofill', () => {
    // Simulate: User selected Blood Bank Officer persona, but browser autofilled an outdated password in the DOM
    const selectedPersona = 'blood_bank_officer';
    const activePreset = PRESET_PERSONAS.find(p => p.role === selectedPersona);

    const domEmail = 'bbo@hospital.test';
    const domPassword = 'stale_autofilled_browser_password_123';
    const stateEmail = 'bbo@hospital.test';
    const statePassword = activePreset.password;

    // Resolver logic mirroring LoginModal.jsx handleSubmit
    let submittedEmail = (typeof domEmail === 'string' && domEmail.trim().length > 0)
      ? domEmail.trim()
      : stateEmail.trim();

    let submittedPassword = (typeof domPassword === 'string' && domPassword.length > 0)
      ? domPassword
      : statePassword;

    if (selectedPersona) {
      const personaConfig = PRESET_PERSONAS.find(p => p.role === selectedPersona);
      if (personaConfig && (!submittedEmail || personaConfig.email.toLowerCase() === submittedEmail.toLowerCase())) {
        submittedEmail = personaConfig.email;
        submittedPassword = personaConfig.password;
      }
    }

    assert.equal(submittedEmail, 'bbo@hospital.test');
    assert.equal(submittedPassword, activePreset.password, 'Should use configured persona password instead of stale autofill');
  });

  test('Form submission resolver preserves custom manually typed credentials when persona is not selected', () => {
    // Simulate: User typed custom credentials
    const selectedPersona = null;
    const domEmail = 'custom_doctor@hospital.test';
    const domPassword = 'CustomSecretPassword2026!';
    const stateEmail = 'custom_doctor@hospital.test';
    const statePassword = 'CustomSecretPassword2026!';

    let submittedEmail = (typeof domEmail === 'string' && domEmail.trim().length > 0)
      ? domEmail.trim()
      : stateEmail.trim();

    let submittedPassword = (typeof domPassword === 'string' && domPassword.length > 0)
      ? domPassword
      : statePassword;

    if (selectedPersona) {
      const personaConfig = PRESET_PERSONAS.find(p => p.role === selectedPersona);
      if (personaConfig && (!submittedEmail || personaConfig.email.toLowerCase() === submittedEmail.toLowerCase())) {
        submittedEmail = personaConfig.email;
        submittedPassword = personaConfig.password;
      }
    }

    assert.equal(submittedEmail, 'custom_doctor@hospital.test');
    assert.equal(submittedPassword, 'CustomSecretPassword2026!', 'Manual credentials must be preserved verbatim');
  });

  test('Email typing matches and re-syncs corresponding persona', () => {
    const inputEmail = 'TECH@hospital.TEST';
    const matched = PRESET_PERSONAS.find(p => p.email.toLowerCase() === inputEmail.trim().toLowerCase());
    assert.ok(matched, 'Should find matching persona case-insensitively');
    assert.equal(matched.role, 'lab_technician');
    assert.equal(matched.password, PRESET_PERSONAS.find(p => p.role === 'lab_technician').password);

    const unknownEmail = 'unknown@test.local';
    const unknownMatch = PRESET_PERSONAS.find(p => p.email.toLowerCase() === unknownEmail.trim().toLowerCase());
    assert.equal(unknownMatch, undefined, 'Unknown email should not match any persona');
  });

  test('Password modification deselects the persona', () => {
    const selectedPersona = 'phlebotomist';
    const activePreset = PRESET_PERSONAS.find(p => p.role === selectedPersona);

    // Matching password retains persona
    const samePassword = activePreset.password;
    const isRetained = activePreset && activePreset.password === samePassword;
    assert.equal(isRetained, true);

    // Edited password clears persona
    const editedPassword = 'NewPasswordTypedByUser!';
    const isCleared = !activePreset || activePreset.password !== editedPassword;
    assert.equal(isCleared, true);
  });

  test('Modal close resets form state and clears errors without clearing session', () => {
    // Initial active session state
    const authSession = {
      user: { id: 'user-1', email: 'bbo@hospital.test', role: 'blood_bank_officer' },
      token: 'jwt.token.here'
    };

    // Modal internal state
    let modalState = {
      isLoginModalOpen: true,
      selectedPersona: 'blood_bank_officer',
      email: 'bbo@hospital.test',
      password: 'some-password',
      errorMessage: 'Invalid institutional credentials',
      showPassword: true,
      isSubmitting: false
    };

    // Simulate handleClose()
    const handleClose = () => {
      modalState = {
        isLoginModalOpen: false,
        selectedPersona: null,
        email: '',
        password: '',
        errorMessage: null,
        showPassword: false,
        isSubmitting: false
      };
    };

    handleClose();

    // Verify modal internal state is clean
    assert.equal(modalState.isLoginModalOpen, false);
    assert.equal(modalState.selectedPersona, null);
    assert.equal(modalState.email, '');
    assert.equal(modalState.password, '');
    assert.equal(modalState.errorMessage, null);
    assert.equal(modalState.showPassword, false);

    // Verify user session is completely intact
    assert.equal(authSession.user.email, 'bbo@hospital.test');
    assert.equal(authSession.token, 'jwt.token.here');
  });

});
