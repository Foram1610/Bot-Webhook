const { Schema, model } = require("mongoose");

const messagesSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    botToken: {
      type: String,
      required: true,
    },
    botId: {
      type: String,
      required: true,
    },
    query: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
    },
    isAdmin: {
      type: String,
      required: false,
    },
    answer: {
      type: String,
      required: false,
    },
    answered: {
      type: Boolean,
      required: false,
    },
    chatId: {
      type: String,
      required: true,
    },
    contactFirstName: {
      type: String,
      required: false,
    },
    contactLastName: {
      type: String,
      required: false,
    },
    contactUsername: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = messagesSchema;
