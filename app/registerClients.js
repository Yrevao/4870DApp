require('dotenv').config();
const c_glue = require('./lib/controllers/c_glue');
clientList = JSON.parse(process.env.REGISTEREDADDRESSES); // this is a JSON array of string addresses

clientList.forEach(async (addr) => {
    await c_glue.register(addr);
});