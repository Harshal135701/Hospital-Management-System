
const express = require("express");
const router = express.Router();
const controller = require("./bloodRequest.controller");

router.post("/", controller.createBloodRequest);
router.get("/", controller.getBloodRequests);
router.get("/:id", controller.getBloodRequestById);
router.patch("/:id/status", controller.updateBloodRequestStatus);

module.exports = router;
