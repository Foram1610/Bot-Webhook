const stripe = require("stripe")(process.env.STRIPE_API_KEY);

const stripeFuncation = {
  retryCustomerPaymentMethod({ customerId }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Returns a list of PaymentMethods for a given Customer
        const paymentMethods = await stripe.customers.listPaymentMethods(
          customerId,
          { type: "card" }
        );
        resolve(paymentMethods);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  createUsageRecord(subscriptionItemID, quantity) {
    // Creates a usage record for a specified subscription item and fills it with a quantity.
    return new Promise(async (resolve, reject) => {
      try {
        let usageRecord = await stripe.subscriptionItems.createUsageRecord(
          subscriptionItemID,
          { quantity: quantity }
        );
        resolve(usageRecord);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  fetchInvoices(customerId) {
    // Fetch Invoices of logged in user.
    return new Promise(async (resolve, reject) => {
      try {
        const allInvoice = await stripe.invoices.list();
        let customerInvoice = [];
        allInvoice.data.forEach((invoices) => {
          if (invoices.customer === customerId) {
            customerInvoice.push(invoices);
          }
        });
        resolve(customerInvoice);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  createStripeCustomer(companyName, email, paymentMethodId) {
    // Create customer in the stripe.
    return new Promise(async (resolve, reject) => {
      try {
        const Customer = await stripe.customers.create({
          name: companyName,
          email: email,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        resolve(Customer);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  createSubscription(priceId, customerId, paymentMethodId) {
    return new Promise(async (resolve, reject) => {
      try {
        // Create the PaymentIntent to get Client_secret key.
        const getIntentdata = await this.createPaymentIntent(
          priceId,
          customerId,
          paymentMethodId
        );

        // Create the subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          default_payment_method: paymentMethodId,
        });
        
        let returnObject = {
          clientSecret: getIntentdata.client_secret,
          subscriptionId: subscription.id,
          subscription: subscription,
        };

        resolve(returnObject);
      } catch (err) {
        reject(err);
      }
    });
  },

  cancelSubscription(subscriptionId, quanity) {
    //Cancel the current subscription and generate invoice according to the usage.
    return new Promise(async (resolve, reject) => {
      try {
        const subscriptionData = await this.fetchSubsciptionById(
          subscriptionId
        );
        await this.createUsageRecord(
          subscriptionData.items.data[0].id,
          quanity
        );
        const cancelSubscription = await stripe.subscriptions.cancel(
          subscriptionId,
          { invoice_now: true }
        );
        resolve(cancelSubscription);
      } catch (err) {
        reject(err);
      }
    });
  },

  createPaymentIntent(priceId, customerId, paymentMethodId) {
    //Cancel payment intent.
    return new Promise(async (resolve, reject) => {
      try {
        const getPricedata = await this.fetchPriceById(priceId);
        const paymentIntent = await stripe.paymentIntents.create({
          amount: getPricedata.tiers[0].flat_amount,
          currency: getPricedata.currency,
          automatic_payment_methods: { enabled: true },
          payment_method: paymentMethodId,
          customer: customerId,
        });
        resolve(paymentIntent);
      } catch (err) {
        reject(err);
      }
    });
  },

  updateCustomer(data, customerId) {
    //Update stripe customer.
    return new Promise(async (resolve, reject) => {
      try {
        const updateCustomer = await stripe.customers.update(customerId, data);
        resolve(updateCustomer);
      } catch (err) {
        reject(err);
      }
    });
  },

  updatePaymentMethod(
    customerId,
    updatedPaymentMethodId,
    existingPaymentMethodId
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        // Detach old payment method
        await stripe.paymentMethods.detach(existingPaymentMethodId);

        //Attaching new payment method to customer
        const attachCustomer = await stripe.paymentMethods.attach(
          updatedPaymentMethodId,
          {
            customer: customerId,
          }
        );
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: updatedPaymentMethodId,
          },
        });

        resolve(attachCustomer);
      } catch (err) {
        reject(err);
      }
    });
  },
  fetchAllPlans() {
    // Will fetch all the products from stripe.
    return new Promise(async (resolve, reject) => {
      try {
        const allPlans = await stripe.products.list();
        resolve(allPlans);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  fetchPaymentMethodById(id) {
    // Will fetch single payment method.
    return new Promise(async (resolve, reject) => {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(id);
        resolve(paymentMethod);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  fetchPlanById(id) {
    // Will fetch single product.
    return new Promise(async (resolve, reject) => {
      try {
        const plan = await stripe.products.retrieve(id);
        resolve(plan);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  fetchPriceById(id) {
    // Will fetch single price.
    return new Promise(async (resolve, reject) => {
      try {
        const price = await stripe.prices.retrieve(id, { expand: ["tiers"] });
        resolve(price);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  },
  fetchCustomerById(id) {
    // Will fetch single customer.
    return new Promise(async (resolve, reject) => {
      try {
        const getCustomer = await stripe.customers.retrieve(id);
        resolve(getCustomer);
      } catch (err) {
        reject(err);
      }
    });
  },
  fetchSubsciptionById(id) {
    // Will fetch single subscription.
    return new Promise(async (resolve, reject) => {
      try {
        const getSubscription = await stripe.subscriptions.retrieve(id);
        resolve(getSubscription);
      } catch (err) {
        reject(err);
      }
    });
  },
};

module.exports = stripeFuncation;
