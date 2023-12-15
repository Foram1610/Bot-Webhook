const { get } = require("lodash");
const jwtDecode = require('jwt-decode')

const isAuthorised = (mainAsset, action) => {
    return async (req, res, next) => {
        try {
            const tenantData = get(req, 'frontegg.user', {});
            const { tenantId } = req.query
            const { authorization } = req.headers

            const decode = jwtDecode(authorization)
            req.email = decode.email
            /**
             * check if user is allowed to request this data
             * check if tenantId exists ny tenantIds array
             */
            const isAuthorized = tenantData.tenantIds.includes(tenantId)

            /**
             * check if user has permissions
             */
            const userPermissions = tenantData.metadata.rbac[tenantId]
            const isAllowed = userPermissions[mainAsset]?.[action]
            if (!isAllowed || !isAuthorized) return res.unAuthorizedRequest()
            next()
        } catch (error) {
            res.failureResponse(error);
        }

    };
};
module.exports = isAuthorised