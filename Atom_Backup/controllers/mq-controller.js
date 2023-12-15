const MQFactory = require("./classes/AtomMQ");
const multer = require("multer");
const fs = require("fs");

const { getPlanUsageCollection } = require("../utils/tenancy/Tenancy")
const mqController = {
  async submitURLTask(req, res) {
    try {
      const { tenantId } = req.query
      const data = await MQFactory.sendURLTask(req.body, tenantId);
      const PlanUsageCollection = await getPlanUsageCollection(tenantId)
      const tenantPLanUsage = await PlanUsageCollection.findOneAndUpdate(
        {
          tenantId: tenantId,
        },
        { $inc: { 'websiteCount': 1 } },
      );
      res.ok({ data: data });
    } catch (error) {
      res.failureResponse(error);
    }
  },
  async submitFileTask(req, res) {
    try {
      console.log("query", req.query)
      const { tenantId } = req.query
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, 'public');
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + '-' + file.originalname);
        },
      });
      const upload = multer({ storage: storage }).single('file');

      upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json(err);
        } else if (err) {
          return res.status(500).json(err);
        }

        const { file } = req;
        const reader = fs.createReadStream(file.path);
        const promise = fs.promises.readFile(file.path);

        Promise.resolve(promise)
          .then(async function (buffer) {
            // Write the buffer to the file system.
            fs.writeFile(file.filename, buffer, (err) => {
              if (!err) console.log('Data written');
            });
            file.buffer = buffer;
            const data = await MQFactory.sendFileTask(file, tenantId);
            const PlanUsageCollection = await getPlanUsageCollection(tenantId)
            const tenantPLanUsage = await PlanUsageCollection.findOneAndUpdate(
              {
                tenantId: tenantId,
              },
              { $inc: { 'fileCount': 1 } },
            );
            res.ok()
          })
      });
    } catch (error) {
      console.log(error)
      res.failureResponse(error)
    }
  },
  async trainOnInput(req, res) {
    try {
      const { tenantId } = req.query
      const data = await MQFactory.sendInputTask(req.body, tenantId);
      res.ok();
    } catch (error) {
      res.failureResponse(error);
      console.log(error);
    }
  },
  async trainOnAtlassian(req, res) {
    try {
      const { tenantId } = req.query
      const data = await MQFactory.sendConfluenceTask(req.body, tenantId);
      const PlanUsageCollection = await getPlanUsageCollection(tenantId)
      const tenantPLanUsage = await PlanUsageCollection.findOneAndUpdate(
        {
          tenantId: tenantId,
        },
        { $inc: { 'atlassianCount': 1 } },
      );
      res.ok();
    } catch (error) {
      res.failureResponse(error);
      console.log(error);
    }
  },
  async trainOnGithub(req, res) {
    try {
      const { tenantId } = req.query
      const data = await MQFactory.sendGithubTask(req.body, tenantId);
      const PlanUsageCollection = await getPlanUsageCollection(tenantId)
      const tenantPLanUsage = await PlanUsageCollection.findOneAndUpdate(
        {
          tenantId: tenantId,
        },
        { $inc: { 'githubCount': 1 } },
      );
      res.ok();
    } catch (error) {
      res.failureResponse(error);
      console.log(error);
    }
  },
};

module.exports = mqController;
