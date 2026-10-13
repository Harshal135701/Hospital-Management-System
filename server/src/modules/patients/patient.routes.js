const express = require('express');
const router = express.Router();
const patientController = require('./patient.controller');

router.get('/', (req, res, next) => patientController.getPatients(req, res, next));
router.get('/:uhid', (req, res, next) => patientController.getPatientByUhid(req, res, next));
router.post('/', (req, res, next) => patientController.createPatient(req, res, next));

module.exports = router;
