const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");

const {
  createJIRA,
  sendQuestion,
  addTagToCustomer,
} = require("../controllers/email-controller");

router.post(
  "/issues",
  validate([
    body("email_address")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .trim()
      .withMessage("Email is required"),
    body("description")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage("Description is required"),
  ]), createJIRA
);

router.post(
  "/questions",
  validate([
    body("email_address")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage("Email is required"),
    body("description")
      .not()
      .isEmpty()
      .trim()
      .escape()
      .withMessage("Description is required"),
  ]), sendQuestion
);

router.post(
  "/tag_customer",
  validate([
    body("email")
      .not()
      .isEmpty()
      .escape()
      .trim()
      .withMessage("Email is required"),
    body("tag").not().isEmpty().escape().trim().withMessage("Tag is required"),
  ]), addTagToCustomer

);

module.exports = router;
