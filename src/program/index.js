require('console.table')
const program = require('commander')
const meta = require('../../package.json')
const deploys = require('./deploys')
const stages = require('./stages')
const builds = require('./builds')

const config = () => program.config ? JSON.parse(program.config) : require('../config')
const api = (config) => require('../api')(config.url, config.auth, !config.samson.production)
const withApiAndConfig = (fn) => (...args) => {
  const conf = config()
  return fn(api(conf), conf)(...args)
}

program
  .version(meta.version)

program
.command('status')
.action(() => {
  console.log('TODO: Show current project, etc')
})

program
.command('deploys')
.action(withApiAndConfig(deploys.show))

program
.command('builds')
.action(withApiAndConfig(builds))

program
.command('stages')
.action(withApiAndConfig(stages))

program
.command('deploy [stage] [reference]')
.action(withApiAndConfig(deploys.deploy))

program
.option('-c --config [config]', 'Use specific config, json format')  
.parse(process.argv)

module.exports = program
