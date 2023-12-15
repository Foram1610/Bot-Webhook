const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const isAuthorised = require("../lang/middlewares/rbac")

const {
  addPlans,
  getPlansList,
  purchaseSubscription,
  cancelSubscription,
} = require("../controllers/plan-controller");

router.post("/plans", addPlans);

router.get(
  "/plans",
  getPlansList
);

router.get("/fetchplans", getPlansList);

router.post(
  "/purchaseSubscription",
  withAuthentication(),
  isAuthorised("billing", "write"),
  purchaseSubscription
);

router.delete(
  "/cancelSubscription",
  withAuthentication(),
  isAuthorised("billing", "write"),
  cancelSubscription
);

module.exports = router;
