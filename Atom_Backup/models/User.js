const { Schema } = require("mongoose");

const usersSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: false,
    },
    userId: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: false,
    },
    userFirstname: {
      type: String,
      required: false,
    },
    userLastname: {
      type: String,
      required: false,
    },
    isBot: {
      type: Boolean,
      required: false,
    },
    labels: {
      type: Array,
      required: false,
    },
    botId: {
      type: String,
      required: true,
    },
    botName: {
      type: String,
      required: true,
    },
    botToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = usersSchema;
