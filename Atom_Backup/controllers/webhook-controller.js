const ProducerFactory = require("./classes/AtomKafka");
const { getAccountCollection } = require("../utils/tenancy/Tenancy");
require("dotenv").config();

const processWebhook = {
  async validateWebhook(req, res) {
    try {

      const { query, api_key, webhookUrl } = req.body

      // check which webhook mode is sent from coinfinch and send the targeted url

      const AccountCollection = await getAccountCollection("d948b3ba-fc67-46f9-823c-06e097a1a386");

      // check if the api key is valid in mongodb database
      const Account = await AccountCollection.find({ "apiKeys.key": api_key });
      const isValid = Account[0]?.apiKeys.find(key => key.key === api_key)?.valid;
      if (!isValid) {
        return res.invalidRequest()
      }
      // if key is valid then send to kafka    
      await ProducerFactory.sendBatchWebhook([
        {
          query: {
            msg: query.msg,
            extraData: query.extraData
          },
          tenantId: "d948b3ba-fc67-46f9-823c-06e097a1a386",
          webhook_url: webhookUrl,
          api_key: api_key
        }
      ])
      return res.ok()

    } catch (error) {
      console.log(error)
      res.failureResponse(error);
    }

  }

}
module.exports = processWebhook