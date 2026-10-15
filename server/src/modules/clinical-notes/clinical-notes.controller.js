const service = require("./clinical-notes.service");

async function createClinicalNote(req, res, next) {
  try {
    const note = await service.createClinicalNote(req.body);

    res.status(201).json({
      success: true,
      message: "Clinical progress note created successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

async function getNotesByEncounterId(req, res, next) {
  try {
    const notes = await service.getNotesByEncounterId(
      req.params.encounterId
    );

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
}

async function getClinicalNoteById(req, res, next) {
  try {
    const note = await service.getClinicalNoteById(req.params.id);

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

async function updateClinicalNote(req, res, next) {
  try {
    const note = await service.updateClinicalNote(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Clinical progress note updated successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createClinicalNote,
  getNotesByEncounterId,
  getClinicalNoteById,
  updateClinicalNote,
};