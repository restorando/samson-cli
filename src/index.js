const chalk = require('chalk')
require('console.table')
const moment = require('moment')
const config = require('../samsonrc.json')
const program = require('./program')
const data = require('./data')(config.url, config.auth)

program.parse(process.argv)

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

const getProjectId = projectName => data.getProjects().then(projects => projects.find(p => p.permalink === config.project).id)

if (program.deploys) {
  getProjectId()
    .then(data.getDeploys)
    .then(showDeploys)
    .catch(fail)
} else if (program.stages) {
  getProjectId()
    .then(data.getStages)
    .then(showStages)
    .catch(fail)
} else if (program.builds) {
  getProjectId()
    .then(data.getBuilds)
    .then(showBuilds)
    .catch(fail)
} else {
  console.error('unknown command')
}
