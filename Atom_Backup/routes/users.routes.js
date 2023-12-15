const express = require("express");
const router = express.Router();
const validate = require("../lang/middlewares/input-validation");
const { query, param } = require("express-validator");
const { withAuthentication } = require("@frontegg/client");
const { getallUsersByAccount, getCountUsers, getallUsersbyBot } = require("../controllers/users-controller");
const { VALIDATION_ERROR } = require("../constants");
const isAuthorised = require("../lang/middlewares/rbac")

/**
 * Get all users for all bots in specific account ID
 */

router.get(
  "/list",
  withAuthentication(),
  isAuthorised("contacts", "read"),
  getallUsersByAccount
);
/**
 * Get all users count by account ID
 */

router.get(
  "/count",
  withAuthentication(),
  validate([
    query("from")
      .escape()
      .trim()
      .isString()
      .isNumeric()
      .withMessage("Search parameter must be a string.")
      .notEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    query("to")
      .escape()
      .trim()
      .isNumeric()
      .isString()
      .withMessage("Search parameter must be a string.")
      .notEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  isAuthorised("contacts", "read"),
  getCountUsers
);
/**
 * Get all users for a spefic bot ID
 */
router.get(
  "/bot/:botID",
  withAuthentication(),
  validate([
    param("botID")
      .trim()
      .escape()
      .notEmpty()
      .isString()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  isAuthorised("contacts", "read"),
  getallUsersbyBot
);

module.exports = router;
