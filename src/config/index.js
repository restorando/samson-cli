const path = require('path')
const configFile = path.resolve(process.cwd(), 'samsonrc.json')
module.exports = require(configFile)
