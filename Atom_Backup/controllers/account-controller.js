const { getToken } = require("../utils/frontEgg-token")
const sdk = require('api')('@frontegg/v2.0.2#5o2peqlcivx9yy');
const { generateApiKey } = require('generate-api-key')
const { getAccountCollection } = require("../utils/tenancy/Tenancy")

const accountController = {
  async updateAccount(req, res) {
    /**
    *  what to update here ??
    */
    try {

      res.ok();
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async getAccountDetails(req, res) {
    try {
      const { tenantId } = req.query
      const AccountCollection = await getAccountCollection(tenantId)
      if (!AccountCollection) return res.ok()
      const accountData = await AccountCollection.find({ tenantId: tenantId })
      res.ok({ data: accountData });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  //DONE: We are no longer storing password in our DB, we should instead update password in Frontegg DB using their APIs
  async changePassword(req, res) {
    try {
      const token = await getToken()
      await sdk.auth(token)
      const { oldPassword, newPassword } = req.body
      const { id } = req.frontegg.user
      await sdk.usersPasswordControllerV1_changePassword({ password: oldPassword, newPassword: newPassword }, { 'frontegg-user-id': id })

      res.ok();
    } catch (error) {
      res.failureResponse(error);
    }
  },
  //DONE: When profile info like company name, first or last name, website URL is changed, we should call FrontEgg API to update this infomration
  async changeProfileInfo(req, res) {
    try {
      const { tenantId, id } = req.frontegg.user
      const { firstName, lastName } = req.body
      const token = await getToken()
      await sdk.auth(token)
      const data = await sdk.usersControllerV1_updateUser({ name: firstName + " " + lastName },
        {
          'frontegg-user-id': id,
          'frontegg-tenant-id': tenantId
        })
      res.ok({ data: data });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  /**
   * add ai testing configuration to account model done
   */
  async addAITestConfig(req, res) {
    try {
      const { tenantId } = req.query
      const AccountCollection = await getAccountCollection(tenantId);
      if (!AccountCollection) return res.recordNotFound()

      const updatedConfig = await AccountCollection.findOneAndUpdate(
        { tenantId: tenantId },
        { $set: { aiConfig: req.body } },
        { runValidators: true, new: true }
      );
      if (!updatedConfig) res.recordNotFound()

      res.created({ data: updatedConfig });
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async createApiKey(req, res) {
    try {
      const { tenantId } = req.query
      const { name } = req.body
      const AccountCollection = await getAccountCollection(tenantId);
      if (!AccountCollection) return res.recordNotFound()

      const apiKey = generateApiKey({ method: 'string', length: 32 });

      // prevent users from creating the same name of api key
      const existingApiKey = await AccountCollection.findOne({
        'apiKeys.name': name,
      });
      if (existingApiKey) return res.isDuplicate()


      // adds api key to the targeted tenant
      const insertApiKey = await AccountCollection.findOneAndUpdate(
        { tenantId: tenantId },
        {
          $addToSet: {
            apiKeys: {
              tenantId: tenantId,
              name: name,
              valid: true,
              key: apiKey
            }
          }
        },
        { runValidators: true, new: true }
      )
      if (!insertApiKey) return res.recordNotFound()
      res.created({ data: { name: name, Key: apiKey } })
    } catch (error) {
      console.log(error)

      res.failureResponse(error);
    }
  },
  async getApiKey(req, res) {
    try {
      const { tenantId } = req.query
      const AccountCollection = await getAccountCollection(tenantId);
      if (!AccountCollection) return res.recordNotFound()

      const AccountModel = await AccountCollection.find()
      const cryptedApiKeys = AccountModel[0].apiKeys.map((keys) => ({
        name: keys.name,
        valid: keys.valid,
        key: '*'.repeat(Math.max(0, keys.key.length - 4)) + keys.key.slice(-4)
      }))

      res.ok({ data: cryptedApiKeys ?? [] })
    } catch (error) {
      console.log(error)
      res.failureResponse(error);
    }
  },
  async removeApiKey(req, res) {
    try {
      const { tenantId } = req.query
      const { name } = req.query
      const AccountCollection = await getAccountCollection(tenantId);
      if (!AccountCollection) return res.recordNotFound()

      // remove api key by name
      await AccountCollection.findOneAndUpdate({ tenantId: tenantId },
        { $pull: { apiKeys: { name: name } } },
        { new: true })

      res.ok()
    } catch (error) {
      res.failureResponse(error);
    }
  }

};

module.exports = accountController;