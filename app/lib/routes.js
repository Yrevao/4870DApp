const express = require('express');
const router = express.Router();
const c_site = require('./controllers/c_site.js');

// site setup
router.get('/sites', c_site.renderSite);
router.post('/', c_site.generateSites);

// client smart contract actions
router.get('/update', c_site.updateSite);

module.exports = router;