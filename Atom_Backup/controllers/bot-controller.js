require("dotenv").config();
const mongoose = require("mongoose");
const { get } = require("lodash");
const AtomBot = require("./classes/Telegram/Bot");
const rateLimit = require("telegraf-ratelimit");
const { VALIDATION_ERROR } = require("../constants");
const { getBotCollection } = require("../utils/tenancy/Tenancy")
const botController = {
  async bootstrapBots() {

    try {
      // Fetch all tenant tables and loop through each table and gather all bots
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()
      const Bots = await BotCollection.find({})
      const limitConfig = rateLimit({
        window: 3000,
        limit: 1,
      });
      Bots.forEach((bot) => {
        const bot_token = get(bot, "botToken", null);
        if (bot_token) {
          const account_bot = new AtomBot(bot_token);
          account_bot.getBot().use(rateLimit(limitConfig));
          account_bot.getBot().launch({
            webhook: {
              domain: process.env.NGROK_URL || process.env.WEBHOOK_URL,
              hookPath: `/api/bots-webhook?tenantId=${bot.tenantId}&botToken=${bot_token}&botId=${bot._id}`,
              drop_pending_updates: true,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  },

  async addBotLabel(req, res) {
    try {
      const { id } = req.params;
      const { tenantId } = req.query
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const botDetails = await BotCollection.findOneAndUpdate(
        { _id: id, tenantId: tenantId },
        { $addToSet: { labels: req.body } },
        { runValidators: true, new: true }
      );

      res.created({ data: botDetails ? botDetails : null });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async createBot(req, res) {
    try {
      const { botToken } = req.body;
      const { tenantId } = req.query
      //Bot with this token already exists, you can;t have 2 bots with the same token
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const existingBot = await BotCollection.find({ botToken: botToken });

      if (existingBot.length > 0) {
        return res.isDuplicate();
      }

      const tryBot = new AtomBot(botToken).getBot();
      const botDetails = await tryBot.telegram.getMe();
      //Bot with this token doesn;t exist
      if (!botDetails.username) {
        return res.recordNotFound({
          message: VALIDATION_ERROR.INVALID_BOT_TOKEN,
        });
      }
      const newBot = new BotCollection({
        ...req.body,
        tenantId: tenantId,
        name: botDetails.username,
      });

      await newBot.save();
      tryBot.launch({
        webhook: {
          domain: process.env.NGROK_URL || process.env.WEBHOOK_URL,
          hookPath: `/api/bots-webhook?tenantId=${newBot.tenantId}&botToken=${newBot.botToken}&botId=${newBot._id}`,
          drop_pending_updates: true,
        },
      });
      res.created({ data: newBot });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async removeBot(req, res) {
    try {
      const { id } = req.params;
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const bot = await BotCollection.findByIdAndDelete(
        new mongoose.Types.ObjectId(id)
      );

      res.ok();
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async getAllBots(req, res) {
    try {
      const { tenantId } = req.query
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const bots = await BotCollection.find({ tenantId: tenantId });
      res.ok({ data: bots ? bots : [] });
    } catch (error) {
      res.failureResponse(error);
      console.log(error)
    }
  },

  async getBotDetails(req, res) {
    try {
      const { id } = req.params;
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const bot = await BotCollection.findById(new mongoose.Types.ObjectId(id));

      res.ok({ data: bot ? bot : null });
    } catch (error) {
      console.log(error);
    }
  },

  async updateBot(req, res) {
    try {
      const { id } = req.params;
      const BotCollection = await getBotCollection()
      if (!BotCollection) return res.recordNotFound()

      const bot = await BotCollection.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        req.body,
        { new: true }
      );

      res.ok({ data: bot ? bot : null });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = botController;
