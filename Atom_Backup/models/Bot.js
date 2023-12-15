const { Schema, model } = require("mongoose");
const labelSchema = require("./Label");
const flowSchema = require("./Flow");
const buttonSchema = require("./Button");

const botSchema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    botToken: {
      type: String,
      required: true,
    },
    messenger: {
      type: String,
      default: "Telegram",
      enum: ["Telegram", "Whatsapp"],
      required: true,
    },
    automation: { 
      type: String
    },
    labels: [labelSchema],
    flow: [flowSchema],
    buttons: [buttonSchema],
  },

  { timestamps: true }
);

module.exports = botSchema;
