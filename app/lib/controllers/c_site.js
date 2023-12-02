const s_site = require('../schemas/s_site');
const render = require('../render');

module.exports = {
    generateSites: (req, res) => {
        res.send(render.mainMenu( { sites: JSON.parse(req.query.sites) }));
    }
}