const express = require('express');
const router = express.Router();
const c_site = require('./controllers/c_site.js');

router.post('/', c_site.generateSites);
router.get('/sites', c_site.renderSite);

module.exports = router;