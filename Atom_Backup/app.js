const path = require("path");
require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const seeder = require("./seeders");
const db = require("./config/connection");
const PORT = process.env.PORT || 8443;
const { bootstrapBots } = require("./controllers/bot-controller");
const MsgConstructor = require("./controllers/classes/Telegram/Message");
const { cron, invoiceCronJob } = require("./controllers/cron-controller");
const { validateWebhook } = require("./controllers/webhook-controller");
const { body } = require("express-validator");
const { VALIDATION_ERROR } = require("./constants");
const validate = require("./lang/middlewares/input-validation");
const { FronteggContext } = require("@frontegg/client");
const { handleUncaughtExceptions } = require("./utils/UncaughtExceptions");
const { getPlanUsageCollection } = require("./utils/tenancy/Tenancy");
const { addPlans } = require("./controllers/plan-controller")
const app = express();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(require("./utils/responseHandler"));
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
/**
 * run error monitor only on production
  */
if (process.env.NODE_ENV === "production") { handleUncaughtExceptions() }

FronteggContext.init({
  FRONTEGG_CLIENT_ID: process.env.FRONTEGG_CLIENT_ID,
  FRONTEGG_API_KEY: process.env.FRONTEGG_API_KEY,
});

app.post("/api/bots-webhook", async (req, res, next) => {
  try {
    const tenantId = req.query["tenantId"];
    const botToken = req.query["botToken"];
    const botId = req.query["botId"];
    const msg = new MsgConstructor(req.body, tenantId, botToken, botId);
    await msg.processQuery();
    const PlanUsageCollection = await getPlanUsageCollection(tenantId);
    const getPlanUsageData = await PlanUsageCollection.findOne({
      tenantId: tenantId,
      isActive: true,
    });
    if (getPlanUsageData.totalMonthlyChats === 300) {
      if (getPlanUsageData.usedChats >= getPlanUsageData.totalMonthlyChats) {
        res.send("Your free plan usage is over.");
      } else {
        await PlanUsageCollection.findOneAndUpdate(
          { tenantId: tenantId },
          { usedChats: getPlanUsageData.usedChats + 1 }
        );
      }
    } else {
      if (getPlanUsageData.usedChats >= getPlanUsageData.totalMonthlyChats) {
        await PlanUsageCollection.findOneAndUpdate(
          { tenantId: tenantId },
          { meteredQuota: getPlanUsageData.meteredQuota + 1 }
        );
      } else {
        await PlanUsageCollection.findOneAndUpdate(
          { tenantId: tenantId },
          { usedChats: getPlanUsageData.usedChats + 1 }
        );
      }
    }

    res.send("success");
  } catch (error) {
    res.failureResponse(error);
  }
});

/**
 * bootstrap all bots in database
 */
bootstrapBots();
addPlans()
app.post(
  "/api/webhook/msg_queries",
  validate([
    body("query.msg")
      .notEmpty()
      .isString()
      .withMessage(VALIDATION_ERROR.INVALID_MSG),
  ]),
  validateWebhook
);
invoiceCronJob();
// cron();
app.use("/api", require("./routes"));
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  return res.status(err.statusCode || 500).json({ error: err.message });
  //res.status(err.status || 500);
  //res.render("error");
});

db.once("open", () => {
  app.listen(PORT, async () => {
    // seeder().then(() => {
    //   console.log("Seeding done.");
    // });
    console.log(`API server running on port ${PORT}!`);
  });
});

module.exports = app;
