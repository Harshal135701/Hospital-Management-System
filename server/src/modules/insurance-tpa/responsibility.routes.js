const express = require("express");
const router = express.Router();

const controller = require("./responsibility.controller");

router.post("/", controller.createResponsibility);

router.get("/", controller.getResponsibilities);

router.get("/:id", controller.getResponsibilityById);

router.patch("/:id/collect", controller.collectPayment);

module.exports = router;