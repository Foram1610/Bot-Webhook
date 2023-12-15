const express = require("express");
const router = express.Router();
const multer = require("multer");

const { uploadImages } = require("../controllers/images-controller");



router.post('/upload', multer({ dest: 'temp/', limits: { fieldSize: 8 * 1024 * 1024 } }).single('image'),
    uploadImages)

module.exports = router