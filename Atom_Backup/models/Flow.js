const { Schema } = require("mongoose");

const flowSchema = new Schema(
  {
    configId: {
      type: String,
    },
    nodes: {
      type: Array,
      required: true,
    },
    edges: {
      type: Array,
      required: true,
    },
    pairs: {
      type: Array,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = flowSchema;
