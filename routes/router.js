const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");

router.get("/clicks/:key", urlController.clicks_get);

router.get("/:key", urlController.url_get);

router.delete("/:key", urlController.zipLink_delete);

router.post("/url", urlController.url_post);

router.get("/user/ziplinks", urlController.zipLinks_get);

module.exports = router;
