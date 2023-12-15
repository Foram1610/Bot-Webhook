const express = require("express");
const router = express.Router();
const { withAuthentication } = require("@frontegg/client");
const { inviteTeamMember, deleteMember, getTeamMembers } = require("../controllers/roles-controller");
const { body, param, query } = require("express-validator");
const validate = require("../lang/middlewares/input-validation");
const { VALIDATION_ERROR } = require("../constants");
const isAuthorised = require("../lang/middlewares/rbac")


router.post("/team", withAuthentication(), isAuthorised("team", "write"),
    validate([
        body("email")
            .trim()
            .escape()
            .notEmpty()
            .isString()
            .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
    ]),
    inviteTeamMember);
router.delete("/team", withAuthentication(), isAuthorised("team", "write"), validate([
    query("userId")
        .trim()
        .escape()
        .notEmpty()
        .isString()
        .withMessage(VALIDATION_ERROR.REQUIRED_FIELD),
]), deleteMember);
router.get("/team", withAuthentication(), isAuthorised("team", "read"), getTeamMembers);
module.exports = router;
