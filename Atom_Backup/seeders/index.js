const { getPlanCollection } = require("../utils/tenancy/Tenancy");
const stripeFuncation = require("../utils/stripe");
// const Plan = require("../models/Plan");
require("dotenv").config();

async function seedPlan() {
  try {
    // const stripePlans = await stripeFuncation.fetchAllPlans();
    // for (let i = 0; i < 4; i++) {
    //   const element = stripePlans.data[i];
    //   let features = {
    //     aiChatBots : element.metadata.aiChatbots.split('\|'),
    //     businessInsights : element.metadata.businessInsights.split('\|')
    //   }
    //   let priceData = await stripeFuncation.fetchPriceById(
    //     element.default_price
    //   );
    //   let flatAmount = priceData.tiers[0].flat_amount / 100;

    //     let plan = {
    //       name : element.name,
    //       description : element.description,
    //       stripePlanId: element.id,
    //       features: features,
    //       monthlyPriceId: element.default_price,
    //       monthlyPrice: "$" + flatAmount,
    //     };
    // }

    // const plans = [
    //   {
    //     name: "Free",
    //     title: "For individuals",
    //     stripePlanId: free.product,
    //     monthlyPriceId: free.price,
    //     // price_y_id: "",
    //     monthlyPrice: "$0",
    //     // price_y: "$0",
    //     // users: "Unlimited",
    //     // bots: "Unlimited",
    //     // stories: "Unlimited",
    //     // labels: "Max 4 labels",
    //     // chats: "300 valid chats",
    //     // actions: "Yes",
    //     // language: "1 language support",
    //     // security: "256-bit SSL encryption",
    //     // messengers: ["Telegram", "Messenger"],
    //     // apiAndIntegrations: "-",
    //     // team: "-",
    //     // analytics: "Basic",
    //     features: {
    //       aiChatbots: [
    //         "300 chats included",
    //         "Unlimited users",
    //         "Unlimited automations",
    //         "Basic Analytics",
    //         "256-bit SSL encryption",
    //         "Telegram integration",
    //       ],
    //       businessInsights: ["Insights visualization", "1 dashboard"],
    //     },
    //     active: true,
    //   },
    //   {
    //     name: "Pro",
    //     title: "For growing teams",
    //     stripePlanId: pro.product,
    //     monthlyPriceId: pro.price,
    //     // price_y_id: STRIPE_PRO_YEARLY_PRICE_ID,
    //     monthlyPrice: "$49",
    //     // price_y: "$39",
    //     // users: "Unlimited",
    //     // bots: "Unlimited",
    //     // stories: "Unlimited",
    //     // labels: "6",
    //     // chats: "1,000 valid chats included",
    //     // actions: "Yes",
    //     // language: "All languages support",
    //     // security: "256-bit SSL encryption",
    //     // messengers: ["Telegram", "Messenger", "Whatsapp", "Viber"],
    //     // apiAndIntegrations: "-",
    //     // team: "-",
    //     // analytics: "Advanced",
    //     features: {
    //       aiChatbots: [
    //         "All from Free plan",
    //         "1 k chats included",
    //         "Advanced Analytics",
    //         "Whatsapp Integration",
    //         "Zoom Integration",
    //         "Slack Integration",
    //       ],
    //       businessInsights: ["2 dashboards", "plans error", "1 prediction"],
    //     },
    //     active: true,
    //   },
    //   {
    //     name: "Business",
    //     title: "For large organization",
    //     stripePlanId: business.product,
    //     monthlyPriceId: business.price,
    //     // price_y_id: STRIPE_BUSINESS_YEARLY_PRICE_ID,
    //     monthlyPrice: "$179",
    //     // price_y: "$144",
    //     // users: "Unlimited",
    //     // bots: "Unlimited",
    //     // stories: "Unlimited",
    //     // labels: "Max 12 labels",
    //     // chats: "10,000 valid chats included",
    //     // actions: "Yes",
    //     // language: "All languages support",
    //     // security: "256-bit SSL encryption",
    //     // messengers: ["Telegram", "Messenger", "Whatsapp", "Viber"],
    //     // apiAndIntegrations: "Yes",
    //     // team: "Yes",
    //     // analytics: "Advanced",
    //     features: {
    //       aiChatbots: [
    //         "All from Pro plan",
    //         "10 k chats included",
    //         "Team support",
    //         "API and Integrations",
    //         "Webhooks",
    //         "Account manager",
    //       ],
    //       businessInsights: [
    //         "5 dashboards",
    //         "Anomaly detection (daily)",
    //         "5 predictions",
    //         "2 Advanced data connectors (database)",
    //       ],
    //     },
    //     active: true,
    //   },
    //   {
    //     name: "Enterprise",
    //     title: "",
    //     stripePlanId: enterprise.product,
    //     monthlyPriceId: enterprise.price,
    //     // price_y_id: "",
    //     monthlyPrice: "Let's Talk",
    //     // price_y: "$*",
    //     // users: "Unlimited",
    //     // bots: "Unlimited",
    //     // stories: "Unlimited",
    //     // labels: "Max 12 labels",
    //     // chats: ">10,000 valid chats included",
    //     // actions: "Yes",
    //     // language: "All languages support",
    //     // security: "256-bit SSL encryption",
    //     // messengers: ["Telegram", "Messenger", "Whatsapp", "Viber"],
    //     // apiAndIntegrations: "Yes",
    //     // team: "Yes",
    //     // analytics: "Advanced",
    //     features: {
    //       aiChatbots: [
    //         "All from Business plan",
    //         ">100 k chats included",
    //         "Team roles & permissions",
    //         "Unlimited AI training",
    //       ],
    //       businessInsights: [
    //         "Unlimited data connectors",
    //         "Unlimited predictions",
    //         "Anomaly detection",
    //         "Unlimited dashboards",
    //         "IoT (predictive maintanance)",
    //         "On-Premises support",
    //       ],
    //     },
    //     active: true,
    //   },
    // ];
    // const Plan = await getPlanCollection();
    // for (let i = 0; i < plans.length; i++) {
    //   const element = plans[i];

    //   const isPlanFound = await Plan.findOne({
    //     name: element.name,
    //   });
    //   if (isPlanFound?.name) {
    //     await Plan.findOneAndUpdate(
    //       { _id: isPlanFound._id },
    //       { $set: element },
    //       { runValidators: true, upsert: true }
    //     );
    //     console.info("Plan model updated 🍺");
    //   } else {
    //     const newPlan = new Plan(element);
    //     await newPlan.save();
    //     console.info("Plan model seeded 🍺");
    //   }
    // }

    // console.info("Plan model seeded 🍺");
  } catch (error) {
    console.log("Plan seeder failed.", error);
  }
}

async function seedData() {
  await seedPlan();
}

module.exports = seedData;
