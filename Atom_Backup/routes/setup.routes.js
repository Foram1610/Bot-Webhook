const { withAuthentication } = require("@frontegg/client");
const express = require("express");
const router = express.Router();
const { setup } = require("../controllers/setup-controller");

/**
 * Tenant setup with collections after sign up
 */
router.post(
  "/",
  withAuthentication(),
  setup
);

module.exports = router;
