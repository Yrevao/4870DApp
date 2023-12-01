const fs = require('fs');
const { sprightly } = require('sprightly');
const viewDir = './app/lib/views/';

module.exports.mainMenu = () => {
    return sprightly(`${viewDir}mainMenu.html`, {  })
}