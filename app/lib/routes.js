const express = require('express');
const router = express.Router();
const render = require ('./render.js');

router.get('/', (req, res) => {
    res.send(render.mainMenu());
});

module.exports = router;