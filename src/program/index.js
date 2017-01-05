const program = require('commander')
const meta = require('../../package.json')
const chalk = require('chalk')
require('console.table')
const moment = require('moment')
// TODO: This will be relative to the client's project folder
const config = require('../../samsonrc.json')
const api = require('../api')(config.url, config.auth)

const getProjectId = projectName => api
  .getProjects()
  .then(projects => projects.find(p => p.permalink === config.project).id)

program
  .version(meta.version)

const showDeploys = deploys => {
  console.table(deploys.map(deploy => ({
    'When': moment(deploy.updated_at).from(),
    'Who': `${deploy.summary} by ${chalk.bold(deploy.user.name)}`,
    'Status': deploy.status === 'succeeded'
      ? chalk.green(deploy.status)
      : chalk.red(chalk.bold(deploy.status))
  })))
}

const showStages = stages => {
  console.table(stages.map(stage => ({
    'Stage': stage.name
  })))
}

const showBuilds = builds => {
  console.table(builds.map(build => ({
    'Label': build.label,
    'Created': moment(build.created_at).from(),
    'Git ref': build.git_ref === build.git_sha ? build.git_ref : `${build.git_ref} (${build.git_sha})`,
    'Status': build.docker_status === 'succeeded'
      ? chalk.green(build.docker_status)
      : chalk.red(chalk.bold(build.docker_status))
  })))
}

const fail = error => {
  console.error(error)
  process.exit(1)
}

program
.command('status')
.action(() => {
  console.log('TODO: Show current project, etc')
})

program
.command('deploys')
.action(() => {
  getProjectId()
  .then(api.getDeploys)
  .then(showDeploys)
  .catch(fail)
})

program
.command('builds')
.action(() => {
  getProjectId()
  .then(api.getBuilds)
  .then(showBuilds)
  .catch(fail)
})

program
.command('stages')
.action(() => {
  getProjectId()
  .then(api.getStages)
  .then(showStages)
  .catch(fail)
})

program
.command('deploy [stage] [reference]')
.action((stage, reference, options) => {
  getProjectId()
  .then(projectId => api
    .getAuthenticityToken(projectId, 'staging')
    .then(token => ({ projectId, token })))
  .then(params => api.deploy(
    params.projectId,
    stage || config.defaults.stage,
    params.token,
    reference || config.defaults.reference))
  .catch(fail)
})

program.parse(process.argv)
module.exports = program
