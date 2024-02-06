const express = require("express");
const router = express.Router();
const isLoggedIn = require("../utils/isLoggedIn");

const urlController = require("../controllers/urlController");

router.get("/clicks/:key", isLoggedIn, urlController.clicks_get);

router.get("/:key", urlController.url_get);

router.delete("/:key", isLoggedIn, urlController.zipLink_delete);

router.post("/url", urlController.url_post);

router.get("/user/ziplinks", isLoggedIn, urlController.zipLinks_get);

module.exports = router;
