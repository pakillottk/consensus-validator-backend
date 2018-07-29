const env = require('../../env');
const DBQuery = require('./Engine/Drivers/DriverRegistry')[env.QUERY_DRIVER];
module.exports = DBQuery;