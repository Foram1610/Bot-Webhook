const sdkAuth = require('api')('@frontegg/v2.0.2#1mld74kq6wif2i');
require("dotenv").config();

const authController = {
    async getToken() {
        const VendorToken = await sdkAuth.authenticate_vendor({ clientId: process.env.FRONTEGG_CLIENT_ID, secret: process.env.FRONTEGG_API_KEY })
        return VendorToken.data.token
    }
}

module.exports = authController