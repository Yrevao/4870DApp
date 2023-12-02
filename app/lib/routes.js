const express = require('express');
const router = express.Router();
const c_site = require('./controllers/c_site.js');

router.post('/', c_site.generateSites);

module.exports = router;