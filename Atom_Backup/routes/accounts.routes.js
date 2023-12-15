const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const { body } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");
require("dotenv").config();
const isAuthorised = require("../lang/middlewares/rbac")

const {
  getAccountDetails,
  updateAccount,
  changeProfileInfo,
  changePassword,
  addAITestConfig,
  getApiKey,
  createApiKey,
  removeApiKey
} = require("../controllers/account-controller");


router.post("/config", withAuthentication(), isAuthorised("ai", "write"), addAITestConfig);

/**
 * Get account details
 */
router.get(
  "/me",
  withAuthentication(),
  getAccountDetails,
);

/**
 * Update account details
 */
router.patch(
  "/me",
  withAuthentication(),
  validate([
    body("firstName").optional().trim().escape(),
    body("lastName").optional().trim().escape(),
    body("company").optional().trim().escape(),
    body("website").optional().trim().escape(),
  ]),
  changeProfileInfo
);

/**
 * Update password
 */
router.patch(
  "/password",
  withAuthentication(),
  changePassword
);

router.get("/api-key", withAuthentication(), isAuthorised("apikey", "read"), getApiKey);
router.post("/api-key", withAuthentication(), isAuthorised("apikey", "write"), createApiKey);
router.delete("/api-key", withAuthentication(), isAuthorised("apikey", "write"), removeApiKey);

module.exports = router;
