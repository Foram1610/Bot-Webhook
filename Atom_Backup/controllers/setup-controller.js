const { get } = require('lodash');
const { getToken } = require("../utils/frontEgg-token")
const sdk = require('api')('@frontegg/v2.0.2#3xdff7936ul7p2motc');
const { getAccountCollection, createTenantDB } = require("../utils/tenancy/Tenancy");
const { sendWelcomeEmail } = require("./../controllers/email-controller");
const updateMetadata = require('api')('@frontegg/v2.0.2#5z3zx22ylnrgdf43');
const permissionsMetadata = require("../utils/permissionsMetadata")
const setupController = {

  async setup(req, res) {
    try {
      const tenant = get(req, 'frontegg.user', {});
      const token = await getToken()
      await sdk.auth(token)
      await updateMetadata.auth(token);
      const metadata = {

        rbac: {
          [tenant.tenantId]: permissionsMetadata.rbac
        }

      };
      const addPermissions = await updateMetadata.usersControllerV1_updateUser({ metadata: JSON.stringify(metadata) }, {
        'frontegg-user-id': tenant.id,
        'frontegg-tenant-id': tenant.tenantId
      })
      const frontEggTenant = await sdk.tenantControllerV1_getTenant({ tenantId: tenant.tenantId })
      const AccountModel = await getAccountCollection(tenant.tenantId)
      const tenantData = await AccountModel.find({})
      /**
       * if the database does not exist then call createTenantDB to create the database  & add permissions to user metadata
       */
      if (tenantData.length === 0) {
        const tenantData = {
          tenantID: tenant.tenantId,
          tenantName: get(frontEggTenant, "data[0].name", tenant.name)
        }

        const newAccount = await createTenantDB(tenant.tenantId, tenantData)
        sendWelcomeEmail(tenant.email, tenant.name)
        
        return res.ok({ data: newAccount });

      } else if (AccountModel) {
        const { tenantId, tenantName } = tenantData[0]
        res.ok({ data: { tenantId: tenantId ?? "", tenantName: tenantName ?? "" } })
      }
    } catch (error) {
      console.log(error);
      res.failureResponse(error);
    }
  },

};

module.exports = setupController;