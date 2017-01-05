const program = require('commander')
const meta = require('../../package.json')

module.exports = program
  .version(meta.version)
  .option('deploys')
  .option('builds')
  .option('stages')
