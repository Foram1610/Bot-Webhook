const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

require("dotenv").config();

const imageController = {

    async uploadImages(req, res) {
        try {
            const { file } = req
            const { tenantId } = req.query
            const bucketName = process.env.AWS_BUCKET_NAME;
            const credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY,
            }

            const s3Client = new S3Client({
                region: process.env.AWS_REGION, credentials

            })
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${tenantId}/${file.originalname}`,
                    Body: fs.createReadStream(file.path),
                })
            );

            const { Body } = await s3Client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: `${tenantId}/${file.originalname}`,
                })
            );
            const imagePath = Body.req.path
            console.log("image :)", imagePath);
            res.ok()
        } catch (error) {
            console.log(error);
            res.failureResponse(error);
        }
    },

};
module.exports = imageController


