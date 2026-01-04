const axios = require('axios');
function filterAddress(address) {
        return address.split(/[,;\s]/).map(id => id.trim()).filter(id => id);
}
// this is handler will run when listen has error (api.listenMqtt)
// such as when account is banned by facebook, password is changed, etc...
module.exports = async function ({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, error }) {
        const { config, botID } = global.GoatBot;
        const { log } = global.utils;
        // YOUR CODE HERE
};
