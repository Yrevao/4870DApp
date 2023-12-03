const s_site = require('../schemas/s_site');
const render = require('../render');

module.exports = {
    generateSites: async (req, res) => {
        const sites = JSON.parse(req.query.sites);

        // ensure that mongo only has the current sites
        await s_site.deleteMany({});
        await s_site.insertMany(sites);

        const sitesDb = await s_site.find({});

        // redirect user to the site selection menu
        res.send(render.mainMenu( { sites: sitesDb }));
    },
    renderSite: async (req, res) => {
        const site = await s_site.findById(req.query.id);

        
    }
}