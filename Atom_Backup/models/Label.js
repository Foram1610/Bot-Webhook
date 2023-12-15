const { Schema } = require("mongoose");

const labelSchema = new Schema(
  {
    labelId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    notify: {
      type: Array,
    },
    color: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = labelSchema;
