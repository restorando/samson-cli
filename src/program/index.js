require('console.table')
const program = require('commander')
const meta = require('../../package.json')
const config = require('../config')
const api = require('../api')(config.url, config.auth, !config.samson.production)

const deploys = require('./deploys')
const stages = require('./stages')
const builds = require('./builds')

program
  .version(meta.version)

program
.command('status')
.action(() => {
  console.log('TODO: Show current project, etc')
})

program
.command('deploys')
.action(deploys.show(api))

program
.command('builds')
.action(builds(api))

program
.command('stages')
.action(stages(api))

program
.command('deploy [stage] [reference]')
.action(deploys.deploy(api))

program.parse(process.argv)
module.exports = program
