const program = require('commander')
const meta = require('../../package.json')
const chalk = require('chalk')
require('console.table')
const moment = require('moment')
// TODO: This will be relative to the client's project folder
const config = require('../../samsonrc.json')
const api = require('../api')(config.url, config.auth, !config.samson.production)

const getProjectId = projectName => api
  .getProjects()
  .then(projects => projects.find(p => p.permalink === config.project).id)

program
  .version(meta.version)

const showDeploys = deploys => {
  console.table(deploys.map(deploy => ({
    'When': moment(deploy.updated_at).from(),
    'Who': `${deploy.summary} by ${chalk.bold(deploy.user.name)}`,
    'Status': formatStatus(deploy.status)
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
    'Status': formatStatus(build.docker_status)
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

const isFinished = status => status === 'errored'
const formatStatus = status => status === 'succeeded'
  ? chalk.green(status)
  : chalk.red(chalk.bold(status))

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
    reference || config.defaults.reference).then(deploy => ({
      deploy,
      projectId: params.projectId
    })))
  .then(params => {
    console.log(`Deploy started with ID ${chalk.bold(params.deploy.id)}`)
    var id = setInterval(() => {
      api
      .getDeploys(params.projectId)
      .then(deploys => {
        const deploy = deploys.find(d => d.id === params.deploy.id)
        console.log(`Status: ${formatStatus(deploy.status)}`)
        console.log(deploy.summary)
        if (isFinished(deploy.status)) {
          clearInterval(id)
        }
      })
    }, 1000)
  })
  .catch(fail)
})

program.parse(process.argv)
module.exports = program
