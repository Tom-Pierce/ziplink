const express = require("express");
const router = express.Router();

const urlController = require("../controllers/urlController");

router.post("/url", urlController.url_post);

module.exports = router;
