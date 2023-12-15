const { ResourcePatternTypes } = require("kafkajs");
const { getToken } = require("../utils/frontEgg-token")
const { get } = require("lodash");
const userSDK = require('api')('@frontegg/v2.0.2#5o2peqlcivx9yy');
const metadataSDK = require('api')('@frontegg/v2.0.2#5z3zx22ylnrgdf43');


const rolesController = {
  async inviteTeamMember(req, res) {
    /**
     *  call FrontEgg API here to invite a new member
     */
    try {
      const { email, permissions } = req.body
      const tenantId = get(req, "frontegg.user.tenantId", "")
      const token = await getToken()
      await userSDK.auth(token);
      await metadataSDK.auth(token);
      // gets all users fot tenant
      const members = await userSDK.usersControllerV2_getUsers({ 'frontegg-tenant-id': tenantId })

      /**
       * check if user is already invited , if yes then see if there any updates to permissions
       */
      const check = members.data.items.some(emails => emails.email === email);
      if (check) {
        // 
        const updateUserPerms = members.data.items.find(user => user.email === email)
        const userId = updateUserPerms.id
        const userMetadata = updateUserPerms.metadata;

        let metadata = JSON.parse(userMetadata || '{}');

        /**
        * check if metadata is empty, if yes then create a new rbac property with the permissions
        */
        if (!metadata.rbac) {
          metadata.rbac = {};
        }
        /**
        * check if metadata has aready the same tenantid if yes the  update if not then add new permissions
        */
        if (metadata.rbac[tenantId]) {
          metadata.rbac[tenantId] = permissions.rbac;
        }

        /**
        * add permissions
        */

        const addPermissions = await metadataSDK.usersControllerV1_updateUser(
          { metadata: JSON.stringify(metadata) },
          {
            'frontegg-user-id': userId,
            'frontegg-tenant-id': tenantId
          }
        );


        res.created({ data: addPermissions })
      }
      /** 
       * invite user and add thier permissions
       */
      else {
        // invite member 
        const inviteMember = await userSDK.usersControllerV2_createUser({ email: email, roleIds: [""] }, { 'frontegg-tenant-id': tenantId })

        const userId = inviteMember.data.id
        const userMetadata = inviteMember.data.metadata;

        let metadata = JSON.parse(userMetadata || '{}');

        /**
        * check if metadata is empty, if yes then create a new rbac property with the permissions
        */
        if (!metadata.rbac) {
          metadata.rbac = {};
        }
        /**
        * check if metadata has aready the same tenantid if yes the  update if not then add new permissions
        */
        if (!metadata.rbac[tenantId]) {
          metadata.rbac[tenantId] = permissions.rbac;
        }

        /**
        * add permissions
        */

        const addPermissions = await metadataSDK.usersControllerV1_updateUser(
          { metadata: JSON.stringify(metadata) },
          {
            'frontegg-user-id': userId,
            'frontegg-tenant-id': tenantId
          }
        );


        res.created({ data: addPermissions })
      }

    } catch (error) {

      res.failureResponse(error);
    }

  },

  async getTeamMembers(req, res) {
    /**
     *  call FrontEgg API to get all users for the tenant
     */
    try {
      const tenantId = get(req, "frontegg.user.tenantId", "")
      const token = await getToken()
      await userSDK.auth(token);
      const members = await userSDK.usersControllerV2_getUsers({ 'frontegg-tenant-id': tenantId })
      res.ok({ data: members.data.items })
    } catch (error) {
      res.failureResponse(error);
    }
  },

  async deleteMember(req, res) {
    /**
     * call FrontEgg API to delete team member
     */
    try {
      const { userId } = req.query
      const token = await getToken()
      await userSDK.auth(token);
      const removeMember = await userSDK.usersControllerV1_removeUserFromTenant({ userId: userId })
      res.ok()
    } catch (error) {
      res.failureResponse(error);
    }
  },
};

module.exports = rolesController;


