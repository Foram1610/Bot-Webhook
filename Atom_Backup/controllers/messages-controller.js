const mongoose = require("mongoose");
const AtomBot = require("./classes/Telegram/Bot");
const { getMessageCollection, getBotCollection } = require("../utils/tenancy/Tenancy");

const messagesController = {
  /*
  // create message
  */

  async createMessage(req, res) {
    try {
      const { tenantId } = req.query
      const data = req.body;
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()
      const newMessage = new MessageCollection({
        ...data,
        tenantId: tenantId,
      });
      const savedMessage = await newMessage.save();

      res.created({
        data: savedMessage ?? [],
      });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /*
  // send messages
  */
  async sendMessage(req, res) {
    try {
      const { tenantId } = req.query;
      const data = req.body;

      const BotCollection = await getBotCollection();
      const bot = await BotCollection
        .findById(new mongoose.Types.ObjectId(data.botID))
        .select("botToken");

      if (!bot) {
        return res.recordNotFound();
      }

      const botInstance = new AtomBot(bot.botToken).bot
      const MessageCollection = await getMessageCollection(tenantId);

      if (!MessageCollection) {
        return res.recordNotFound();
      }

      // Get all chat IDs of our users
      const chatIdQuery = { botId: data.botID };
      const chatId = await MessageCollection.find(chatIdQuery).distinct("chatId");

      // Get specific chat IDs if specified in the request
      const specificUsers = await MessageCollection
        .find({
          $or: [
            { contactUsername: { $in: data.users } },
            { contactFirstName: { $in: data.users } },
            { contactLastName: { $in: data.users } },
          ],
        })
        .distinct("chatId");

      // Combine all chat IDs (unique)
      const usersId = specificUsers.length > 0 ? specificUsers : chatId;
      const uniqueArray = Array.from(usersId);
      for (const id of uniqueArray) {
        /**
         * send text message
         */
        if (data.config.isText) {
          await botInstance.telegram.sendMessage(id, data.config.textMsg);
        }
        /**
         * send button message
         */
        if (data.config.isButtons === true) {
          this.inlineKeyboard = [];
          for (const button of data.config.buttons.actionButtons) {
            const inlineButton = {
              text: button.name,
              callback_data: button.value || "Data",
            };
            this.inlineKeyboard.push(inlineButton);
          }

          await botInstance.telegram.sendMessage(id, data.config.buttons.buttonsMsg, {
            reply_markup: {
              inline_keyboard: [this.inlineKeyboard],
            },
          });
        }

        /**
         * send gallery message
         */
        if (data.config.isGallery === true) {
          this.inlineGallery = [];
          for (const gallery of data.config.gallery) {
            const inlineGallery = [
              {
                text: gallery.buttonName,
                url: gallery.buttonURL,
                callback_data: "image",
              },
            ];

            await botInstance.telegram.sendPhoto(
              id,
              "https://i.ibb.co/bsG4DPM/OIP.jpg",
              {
                caption: gallery.description,
                reply_markup: {
                  inline_keyboard: [inlineGallery],
                },
              }
            );
          }
        }
        /**
         * send question message
         */
        if (data.config.isQuestions === true) {
          await botInstance.telegram.sendMessage(
            id,
            data.config.questions[0].query || "question"
          );
        }
      }
      res.ok();
    } catch (error) {

      console.log(error)
    }
  },

  /*
  // get one message
  */
  async getMessageDetails(req, res) {
    try {
      const { tenantId } = req.query
      const MessageId = req.params.id;
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()
      const message = await MessageCollection.findById(
        new mongoose.Types.ObjectId(MessageId)
      );


      res.ok({
        data: message ?? [],
      });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /*
  // get message from specific date to specific date by account
  */
  async getSpecificDateMessagesbyAccount(req, res) {
    try {

      const { from, to } = req.query;
      const { tenantId } = req.query

      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()


      const result = await MessageCollection.aggregate([
        {
          $match: {
            tenantId: tenantId,
            createdAt: {
              $gte: new Date(parseInt(from)),
              $lte: new Date(parseInt(to)),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%m/%d/%Y",
                date: "$createdAt",
              },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            when: "$_id",
            total: 1,
            _id: 0,
          },
        },
      ]);

      const messages = await MessageCollection.countDocuments({
        createdAt: {
          $gte: new Date(parseInt(from)),
          $lte: new Date(parseInt(to)),
        },
        tenantId: tenantId,
      });

      res.ok({
        data: {
          messages: messages ?? [],
          counts: result ?? [],
        },
      });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /*
  // get message from specific date to specific date by bot
  */
  async getSpecificDateMessagesbyBot(req, res) {
    try {
      const { from, to, botToken, tenantId } = req.query;
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()

      const result = await MessageCollection.aggregate([
        {
          $match: {
            botToken: botToken,
            createdAt: {
              $gte: new Date(parseInt(from)),
              $lte: new Date(parseInt(to)),
            },
            tenantId: tenantId,
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%d/%m/%Y",
                date: "$createdAt",
              },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            when: "$_id",
            total: 1,
            _id: 0,
          },
        },
      ]);
      const messagesbyDate = await MessageCollection.countDocuments({
        tenantId: tenantId,
        botToken: botToken,
        createdAt: {
          $gte: new Date(parseInt(from)),
          $lte: new Date(parseInt(to)),
        },
      });
      const grandTotal = await MessageCollection.countDocuments({
        tenantId: tenantId,
        botToken: botToken,
      });

      res.ok({
        data: {
          grandTotal: grandTotal ?? [],
          messagesbyDate: messagesbyDate ?? [],
          counts: result ?? [],
        },
      });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /*
  // get number of labels from specific date to specific date by account
  */
  async getSpecificDateLabel(req, res) {
    try {
      const { tenantId } = req.query;
      const { from, to } = req.body;
      const MessageCollection = await getMessageCollection(tenantId);
      console.log(await MessageCollection.find({}));
      if (!MessageCollection) return res.recordNotFound();

      const matchQuery = {
        label: { $exists: true, $ne: [] },
        tenantId: tenantId,
      };

      if (from && to !== "") {
        matchQuery.createdAt = {
          $gte: new Date(parseInt(from)),
          $lte: new Date(parseInt(to)),
        };
      }
      const labels = await MessageCollection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$label",
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            label: {
              $cond: {
                if: { $isArray: "$_id" },
                then: { $arrayElemAt: ["$_id", 0] },
                else: "$_id",
              },
            },
            total: "$total",
            _id: 0,
          },
        },
        {
          $match: {
            label: { $ne: "Unknown" },
          },
        },
      ]);

      res.ok({ data: labels ?? [] });
    } catch (error) {
      console.log(error);
      res.failureResponse(error);
    }
  },
  /*
  // get all message by account 
  */

  async getAllMessages(req, res) {
    try {
      const { tenantId } = req.query
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()

      const messages = await MessageCollection.find({ tenantId: tenantId, type: { $exists: false } })

      res.ok({ data: messages ?? [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /*
  // get all message by filter to AI messages
  */
  async getAImessagesFiltered(req, res) {
    try {
      const { tenantId } = req.query
      const { type } = req.body;
      const MessageCollection = await getMessageCollection(req.query.tenantId);
      if (!MessageCollection) return res.recordNotFound()
      const messages = await MessageCollection.find({ tenantId: tenantId, type: type })
      res.ok({ data: messages ?? [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async getMessagesFiltered(req, res) {
    try {
      const { tenantId, type } = req.query
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()

      const messages = await MessageCollection.find({ tenantId: tenantId, label: type, });

      res.ok({ data: messages ?? [] });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async getMsgLabelCountbyBot(req, res) {
    try {
      const { tenantId } = req.query
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()

      const matchQuery = {
        label: { $exists: true, $ne: [] },
        tenantId: tenantId,
      };


      const labels = await MessageCollection.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$label",
            botId: { $first: "$botId" }, // Use $first to get the botId associated with the group
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            label: { $replaceAll: { input: "$_id", find: ".", replacement: "" } },
            botId: 1,
            total: 1,
            _id: 0,
          },
        },
        {
          $match: {
            label: { $ne: "Unknown" },
          },
        },
      ]);
      res.ok({ data: labels })
    } catch (error) {
      res.failureResponse(error);

    }
  },

  async deleteMessage(req, res) {
    try {
      const messageId = req.params.id;
      const { tenantId } = req.query
      const MessageCollection = await getMessageCollection(tenantId);
      if (!MessageCollection) return res.recordNotFound()

      const messages = await MessageCollection.findByIdAndDelete(
        new mongoose.Types.ObjectId(messageId)
      );

      res.ok({
        data: messages ? messages : [],
      });
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = messagesController;
