const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");

router.get("/:key", urlController.url_get);

router.get("/clicks/:key", urlController.clicks_get);

router.post("/url", urlController.url_post);

module.exports = router;
