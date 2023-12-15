const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const { body, param, query } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");
const { flowValidation } = require("../lang/middlewares/custom-input-validation");
const isAuthorised = require("../lang/middlewares/rbac")

const {
  createBot,
  updateBot,
  removeBot,
  getAllBots,
  getBotDetails,
  addBotLabel,
} = require("../controllers/bot-controller");
const {
  getAllLabelsInAccount,
  createLabel,
  updateLabel,
  deleteLabel,
} = require("../controllers/label-controller");
const {
  getAllButtonsInBot,
  createButton,
  deleteButton,
  updateButton,
} = require("../controllers/button-controller");
const { createFlow, updateFlow } = require("../controllers/flow-controller");

/**
 * Create Bot
 */
router.post(
  "/",
  withAuthentication(), isAuthorised("integrations", "write"),
  validate([
    body("botToken")
      .not()
      .isEmpty()
      .escape()
      .trim()
      .withMessage("Token is required"),
    body("messenger")
      .not()
      .isEmpty()
      .escape()
      .trim()
      .withMessage("Messenger is required"),
  ]),
  createBot
);

/**
 * Get all bots for the tenant
 */
router.get(
  "/list",
  withAuthentication(),
  isAuthorised("integrations", "read"),
  getAllBots
);

/**
 * Get bot by ID
 */
router.get(
  "/:id",
  withAuthentication(),
  validate([
    param("id").notEmpty().escape().trim().withMessage("Bot ID is required"),
  ]), isAuthorised("integrations", "read"),
  getBotDetails
);

/**
 * Add label to the bot
 */
router.post(
  "/:id",
  withAuthentication(), isAuthorised("integrations", "read"),
  validate([
    param("id").notEmpty().escape().trim().withMessage("Bot ID is required"),
    body("Label").notEmpty().escape().trim().withMessage("Label is required"),
  ]),
  addBotLabel
);

/**
 * Update bot
 */
router.patch(
  "/:id",
  withAuthentication(), isAuthorised("integrations", "write"),
  validate([
    body("name").notEmpty().escape().trim().withMessage("Bot name is required"),
    body("messenger")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Bot messenger is required"),
  ]),
  updateBot
);

/**
 * Delete bot
 */
router.delete(
  "/:id",
  withAuthentication(), isAuthorised("integrations", "write"),
  validate([
    param("id").notEmpty().escape().trim().withMessage("Bot ID is required"),
  ]),
  removeBot
);

/**
 * Create a flow
 */
router.post(
  "/:botId/flow",
  withAuthentication(),
  isAuthorised("integrations", "write"),
  flowValidation,
  createFlow
);

/**
 * update flow
 */
router.patch(
  "/:botId/flow/:flowId",
  withAuthentication(),
  isAuthorised("integrations", "write"),
  flowValidation,
  updateFlow
);

/**
 * Get all labels from bots in the account
 */
router.get(
  "/account/labels",
  withAuthentication(),
  isAuthorised("integrations", "read"),
  getAllLabelsInAccount
);

/**
 * Create a label
 */
router.post(
  "/:botId/labels",
  withAuthentication(),
  validate([
    body("name")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Label name is required"),
    param("botId").notEmpty().escape().trim().withMessage("Bot ID is required"),
  ]),
  isAuthorised("integrations", "write"),
  createLabel
);

/**
 * Update a label
 */
router.patch(
  "/:botId/labels/:labelId",
  withAuthentication(),
  validate([
    body("name")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Label name is required"),
    body("notify").notEmpty().escape().trim().withMessage("Notify is required"),
    body("color").notEmpty().escape().trim().withMessage("Color is required"),
    param("labelId")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Label ID is required"),
    param("botId").notEmpty().escape().trim().withMessage("Bot ID is required"),
  ]),
  isAuthorised("integrations", "write"),
  updateLabel
);

/**
 * Delete label
 */
router.delete(
  "/:botId/labels/:labelId",
  withAuthentication(),
  validate([
    param("botId").notEmpty().escape().trim().withMessage("Bot ID is required"),
    param("labelId")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Label ID is required"),
  ]),
  isAuthorised("integrations", "write"),
  deleteLabel
);
/**
 * Create a button
 */
router.post(
  "/:botId/buttons",
  withAuthentication(),
  validate([
    body("name")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Button name is required"),
  ]),
  isAuthorised("integrations", "write"),
  createButton
);

/**
 * Get all buttons from bots
 */
router.get(
  "/:botId/buttons",
  withAuthentication(),
  validate([
    param("botId").notEmpty().trim().escape().withMessage("Bot ID is required"),
  ]),
  isAuthorised("integrations", "read"),
  getAllButtonsInBot
);

/**
 * Delete button
 */
router.delete(
  "/:botId/buttons/:botToken/:buttonId",
  withAuthentication(),
  validate([
    param("botId").notEmpty().escape().trim().withMessage("Bot ID is required"),
    param("buttonId")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Button ID is required"),
  ]),

  isAuthorised("integrations", "write"),
  deleteButton
);

/**
 * Update button
 */
router.patch(
  "/:botId/buttons/:buttonId",
  withAuthentication(),
  validate([
    body("name")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Button name is required"),
    param("buttonId")
      .notEmpty()
      .escape()
      .trim()
      .withMessage("Button ID is required"),
    param("botId").notEmpty().escape().trim().withMessage("Bot ID is required"),
  ]),

  isAuthorised("integrations", "write"),
  updateButton
);

module.exports = router;
