const pug = require('pug');
const fs = require('fs');
const viewDir = './app/lib/views/';

module.exports.mainMenu = pug.compileFile(viewDir + 'mainMenu.pug');