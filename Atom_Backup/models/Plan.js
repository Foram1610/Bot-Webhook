const { Schema, model } = require("mongoose");

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    stripePlanId: {
      type: String,
      required: false,
    },
    monthlyPriceId: {
      type: String,
      required: false,
    },
    monthlyPrice: {
      type: Number,
      required: false,
    },
    features: {
      type: Object,
    },
    counters: {
      type: Object,
    },

    isDeleted: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },

  { timestamps: true }
);

module.exports = planSchema;
