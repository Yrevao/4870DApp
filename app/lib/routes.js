const express = require('express');
const router = express.Router();
const c_site = require('./controllers/c_site.js');
const c_glue = require('./controllers/c_glue.js');

// c_site
router.get('/sites', c_site.renderSite);
router.post('/', c_site.generateSites);

// c_glue
/*
router.post('/receive', c_glue.receive);
router.post('/send', c_glue.send);
router.post('/confirm', c_glue.confirm);
*/

module.exports = router;