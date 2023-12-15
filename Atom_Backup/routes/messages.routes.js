const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const { body, param, query } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");
const { sendMessageValidation } = require("../lang/middlewares/custom-input-validation");
const { VALIDATION_ERROR } = require("../constants");
const isAuthorised = require("../lang/middlewares/rbac")

const {
  createMessage,
  sendMessage,
  deleteMessage,
  getMessageDetails,
  getAllMessages,
  getAImessagesFiltered,
  getSpecificDateMessagesbyAccount,
  getSpecificDateMessagesbyBot,
  getSpecificDateLabel,
  getMsgLabelCountbyBot,
  getMessagesFiltered
} = require("../controllers/messages-controller");

/**
 * Create Message
 */
router.post(
  "/",
  withAuthentication(),
  validate([
    // body("accountId")
    //   .not()
    //   .escape()
    //   .isEmpty()
    //   .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    body("botId")
      .not()
      .escape()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    body("answered")
      .not()
      .escape()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    // body("contactId")
    //   .not()
    //   .escape()
    //   .isEmpty()
    //   .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    body("contactUsername")
      .not()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  isAuthorised("messages", "write"),
  createMessage
);
/**
 * Send Message
 */

router.post(
  "/bot/all",
  withAuthentication(),
  isAuthorised("messages", "write"),
  validate([
  ]),
  sendMessageValidation,
  sendMessage
);

/**
 * get all message by account
 */
router.get(
  "/list",
  withAuthentication(),
  isAuthorised("messages", "read"),
  getAllMessages
);
/**
 * get message from specific date to specific date by account
 */
router.get(
  "/account/date",
  withAuthentication(),
  isAuthorised("messages", "read"),
  validate([
    query("from")
      .not()
      .escape()
      .trim()
      .isEmpty()
      .withMessage("date is required"),
    query("to")
      .not()
      .escape()
      .trim()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),

  getSpecificDateMessagesbyAccount
);
/**
 * get message from specific date to specific date by bot
 */
router.get(
  "/bot/date",
  withAuthentication(),
  isAuthorised("messages", "read"),
  validate([
    query("from")
      .not()
      .escape()
      .trim()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    query("to")
      .not()
      .escape()
      .trim()
      .isEmpty()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    query("botToken")
      .notEmpty()
      .escape()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  getSpecificDateMessagesbyBot
);
/**
 * get message label count by bot
 */
router.get(
  "/bot/label",
  withAuthentication(),
  isAuthorised("messages", "read"),
  validate([
    query("tenantId")
      .notEmpty()
      .escape()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  getMsgLabelCountbyBot
);
/**
 * get label from specific date to specific date
 */
router.post(
  "/label",
  withAuthentication(),
  isAuthorised("messages", "read"),
  getSpecificDateLabel
);

/**
 * get Ai message filtred
 */
router.post(
  "/filter",
  withAuthentication(),
  isAuthorised("ai", "read"),
  validate([
    query("tenantId")
      .notEmpty()
      .escape()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    body("type")
      .notEmpty()
      .escape()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  getAImessagesFiltered
);
/**
 * get label message filtred
 */
router.get(
  "/filter/label",
  withAuthentication(),
  isAuthorised("messages", "read"),
  validate([
    query("type")
      .notEmpty()
      .escape()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  getMessagesFiltered
);
/**
 * get message by id
 */

router.get(
  "/:id",
  withAuthentication(),
  isAuthorised("messages", "read"),
  validate([
    param("id")
      .notEmpty()
      .escape()
      .trim()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  getMessageDetails
);

/**
 * delete message by id
 */

router.delete(
  "/:id",
  withAuthentication(),
  isAuthorised("messages", "write"),
  validate([
    param("id")
      .notEmpty()
      .escape()
      .trim()
      .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
  ]),
  deleteMessage
);

module.exports = router;
