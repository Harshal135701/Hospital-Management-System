/**
 * Curated authentic clinical healthcare photography assets.
 * Uses reliable local bundled assets with graceful fallbacks and verified remote mirrors.
 *
 * Categories:
 * A. Doctors and Clinical Staff
 * B. Family and Patient Care
 * C. Ambulance and Emergency Care
 * D. Diagnostic and Laboratory Services
 * E. Blood Bank and Transfusion Medicine
 * F. Hospital Facilities and Inpatient Wards
 */

// Import local downloaded images
import doctorFemaleLocal from './images/doctor-female.jpg';
import doctorConsultationLocal from './images/doctor-consultation.jpg';
import doctorMaleScrubsLocal from './images/doctor-male-scrubs.jpg';
import surgeonStaffLocal from './images/surgeon-staff.jpg';
import nurseCareLocal from './images/nurse-care.jpg';
import doctorStethoscopeLocal from './images/doctor-stethoscope.jpg';

import hospitalWardBedLocal from './images/hospital-ward-bed.jpg';
import hospitalRoomPrivateLocal from './images/hospital-room-private.jpg';
import hospitalReceptionLocal from './images/hospital-reception.jpg';
import modernClinicLocal from './images/modern-clinic.jpg';

import diagnosticLabLocal from './images/diagnostic-lab.jpg';
import microscopeAnalysisLocal from './images/microscope-analysis.jpg';

import bloodStorageLocal from './images/blood-storage.jpg';
import bloodCentrifugeLocal from './images/blood-centrifuge.jpg';

import ambulanceLocal from './images/ambulance.jpg';
import familyCareLocal from './images/family-care.jpg';

import dayCareWardLocal from './images/daycare-ward.png';
import dietKitchenLocal from './images/diet-kitchen.jpg';
import emrRecordsLocal from './images/emr-records.jpg';

// Elegant SVG fallback placeholder (prevents browser broken-image icons or ugly alt text blowups)
export const CLINICAL_FALLBACK_SVG = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23EAF8F7'/%3E%3Cpath d='M200 120v60m-30-30h60' stroke='%23087F8C' stroke-width='6' stroke-linecap='round'/%3E%3Ctext x='200' y='210' font-family='sans-serif' font-size='13' font-weight='600' fill='%23087F8C' text-anchor='middle'%3EMedicsPrime Clinical Context%3C/text%3E%3C/svg%3E";

export const HEALTHCARE_IMAGES = {
  // Category A: Doctors and Clinical Staff
  femaleDoctor: doctorFemaleLocal,
  doctorConsultation: doctorConsultationLocal,
  doctorMaleScrubs: doctorMaleScrubsLocal,
  surgeonStaff: surgeonStaffLocal,
  nurseCare: nurseCareLocal,
  doctorWithStethoscope: doctorStethoscopeLocal,

  // Category B: Family and Patient Care
  familyConsultation: familyCareLocal,
  pediatricCare: familyCareLocal,
  seniorPatientCare: doctorConsultationLocal,

  // Category C: Ambulance and Emergency Care
  ambulanceEmergency: ambulanceLocal,
  emergencyTeam: surgeonStaffLocal,

  // Category D: Diagnostic and Laboratory Services
  diagnosticLab: diagnosticLabLocal,
  microscopeAnalysis: microscopeAnalysisLocal,
  biochemAnalyzer: diagnosticLabLocal,

  // Category E: Blood Bank and Transfusion Medicine
  bloodBankCentrifuge: bloodCentrifugeLocal,
  phlebotomyDonation: nurseCareLocal,
  bloodStorageFridge: bloodStorageLocal,

  // Category F: Hospital Facilities & Inpatient Wards
  modernClinic: modernClinicLocal,
  hospitalReception: hospitalReceptionLocal,
  inpatientWardBed: hospitalWardBedLocal,
  hospitalRoomPrivate: hospitalRoomPrivateLocal,

  // Category G: Day Care, Diet & Clinical Records
  dayCareWard: dayCareWardLocal,
  dietKitchen: dietKitchenLocal,
  emrRecords: emrRecordsLocal
};

/**
 * Image helper with graceful fallback
 */
export const getSafeImage = (key, fallbackKey = 'modernClinic') => {
  return HEALTHCARE_IMAGES[key] || HEALTHCARE_IMAGES[fallbackKey] || modernClinicLocal || CLINICAL_FALLBACK_SVG;
};
