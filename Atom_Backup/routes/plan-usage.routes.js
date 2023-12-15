const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");
const { withAuthentication } = require("@frontegg/client");
const isAuthorised = require("../lang/middlewares/rbac")

const {
  createCustomerAndAttachPaymentMethod,
  getCustomerPaymentMethod,
  updateCustomerPaymentMethod,
  getCustomerInvoice,
  getdataUsage
} = require("../controllers/plan-usage-controller");

/**
 * Create Payment
 */
router.post(
  "/:subscription",
  withAuthentication(),
  isAuthorised("billing", "write"),
  validate([
    param("subscription")
      .notEmpty()
      .trim()
      .escape()
      .withMessage("Subscription type is required"),
    body("paymentMethodId")
      .not()
      .trim()
      .isEmpty()
      .escape()
      .withMessage("PaymentMethodId is required"),
    body("plan").not().isEmpty().withMessage("Plan is required"),
  ]),
  async function createStripeCustomer(req, res, next) {
    try {
      const id = req.query.tenantId;
      const subscription = req.params.subscription;
      const data = await createCustomerAndAttachPaymentMethod(
        id,
        subscription,
        req.body.paymentMethodId,
        req.body.plan
      );
      res.json(data);
    } catch (error) {
      //return next(new CustomError(error.message, 500));
    }
  }
);

router.get(
  "/method",
  withAuthentication(),
  isAuthorised("billing", "read"),
  getCustomerPaymentMethod
);

router.patch(
  "/methods/update",
  withAuthentication(),
  isAuthorised("billing", "write"),
  updateCustomerPaymentMethod
);

router.get(
  "/invoices",
  withAuthentication(),
  isAuthorised("billing", "read"),
  getCustomerInvoice
);

router.get(
  "/usage",
  withAuthentication(),
  isAuthorised("billing", "read"),
  getdataUsage
);

module.exports = router;
