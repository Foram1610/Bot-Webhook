const { mongodb } = require('./index');

/**
 * Creating New MongoDb Connection  by Switching DB
 */
const getTenantDB = (tenantId, modelName, schema) => {
    try {
        if (mongodb) {
            // useDb will return new connection
            const db = mongodb.useDb(tenantId, { useCache: true });
            const Model = db.model(modelName, schema);
            return Model;
        }
    } catch (error) {
        console.log(error)
    }
};

/**
 * Return Model as per tenant
 */
exports.getModelByTenant = (tenantId, modelName, schema) => {
    const tenantDb = getTenantDB(tenantId, modelName, schema);
    return tenantDb.model(modelName);
};