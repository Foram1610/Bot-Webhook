const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const isAuthorised = require("../lang/middlewares/rbac")

const {
  submitURLTask,
  submitFileTask,
  trainOnInput,
  trainOnAtlassian,
  trainOnGithub
} = require("../controllers/mq-controller");

router.post("/train_with_urls", withAuthentication(), isAuthorised("ai", "write"), submitURLTask);
router.post("/train_model_on_file", withAuthentication(), isAuthorised("ai", "write"), submitFileTask);
router.post("/train_on_input", withAuthentication(), isAuthorised("ai", "write"), trainOnInput);
router.post("/train_on_confluence", withAuthentication(), isAuthorised("ai", "write"), trainOnAtlassian);
router.post("/train_on_github", withAuthentication(), isAuthorised("ai", "write"), trainOnGithub);

module.exports = router;
