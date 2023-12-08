const s_site = require('../schemas/s_site');
const s_transfer = require('../schemas/s_transfer');
const c_glue = require('./c_glue');
const render = require('../render');

module.exports = {
    // generate site objects from config menu query and update database
    generateSites: async (req, res) => {
        const sites = JSON.parse(req.query.sites);

        // ensure that mongo only has the current sites
        await s_site.deleteMany({});
        await s_site.insertMany(sites);

        const sitesDb = await s_site.find({});

        // redirect user to the site selection menu
        res.send(render.mainMenu({ sites: sitesDb }));
    },
    // render a single site in html based on the site object from mongo
    renderSite: async (req, res) => {
        const site = await s_site.findById(req.query.id);
        const transfer = await s_transfer.findOne({ receiverId: req.query.id });

        if(transfer)
            res.send(render.site({ site: site, addr: transfer.transferAddress }));
        else
            res.send(render.site({ site: site, addr: '' }));
    },
    // send client updated html after preforming smart contract operations
    updateSite: async(req, res) => {
        operations = {
            'receive': c_glue.receive,
            'send': c_glue.send,
            'confirm': c_glue.confirm
        };

        try {
            // do smart contract operation
            const args = JSON.parse(req.query.args);
            await operations[req.query.op](args);

            // delete transfer if the operation is successful (no error thrown)
            if(req.query.op == 'confirm')
                await s_transfer.deleteOne({transferAddress: args.transferAddress});
        }
        catch(err) {
            // do nothing
        }

        res.sendStatus(200);
    }
}