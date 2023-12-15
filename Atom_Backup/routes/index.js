const express = require("express");
const router = express.Router();
const setupRoutes = require("./setup.routes");
const accountsRoutes = require("./accounts.routes");
const botRoutes = require("./bot.routes");
const messagesRoutes = require("./messages.routes");
const planUsageRoutes = require("./plan-usage.routes");
const userRoutes = require("./users.routes");
const team = require("./team.routes");
const mqRoutes = require("./mq.routes");
const miscRoutes = require("./miscellaneous.routes");
const plansRoute = require("./plan.routes");
const imagesRoute = require("./images.routes")
router.use("/v1/setup", setupRoutes);
router.use("/v1/plans", plansRoute);
router.use("/v1/accounts", accountsRoutes);
router.use("/v1/bots", botRoutes);
router.use("/v1/messages", messagesRoutes);
router.use("/v1/payments", planUsageRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1/roles", team);
router.use("/v1/mq", mqRoutes);
router.use("/v1/miscellaneous", miscRoutes);
router.use("/v1/images", imagesRoute);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

module.exports = router;
