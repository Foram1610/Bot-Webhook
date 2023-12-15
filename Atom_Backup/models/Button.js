const { Schema } = require("mongoose");

const buttonSchema = new Schema(
  {
    buttonId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
      required: true
    },
  },

  { timestamps: true }
);

module.exports = buttonSchema;