const service = require("./claim-dossier.service");

async function createClaimDossier(req, res, next) {
  try {
    const data = await service.createClaimDossier(req.body);
    res.status(201).json({
      success: true,
      message: "Claim dossier created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getClaimDossiers(req, res, next) {
  try {
    const data = await service.getClaimDossiers({
      preauthorization_id: req.query.preauthorization_id,
      bill_id: req.query.bill_id,
      status: req.query.status,
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getClaimDossierById(req, res, next) {
  try {
    const data = await service.getClaimDossierById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function compileClaimDossier(req, res, next) {
  try {
    const data = await service.compileClaimDossier(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Claim dossier compiled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function submitClaimDossier(req, res, next) {
  try {
    const data = await service.submitClaimDossier(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Claim dossier submitted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function recordClaimDecision(req, res, next) {
  try {
    const data = await service.recordClaimDecision(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Claim decision recorded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClaimDossier,
  getClaimDossiers,
  getClaimDossierById,
  compileClaimDossier,
  submitClaimDossier,
  recordClaimDecision,
};