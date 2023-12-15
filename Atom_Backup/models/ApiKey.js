const { Schema } = require("mongoose");

const apischema = new Schema(
  {
    tenantId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true
    },
    valid: {
      type: Boolean,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = apischema;
