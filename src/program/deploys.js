const moment = require('moment')
const chalk = require('chalk')
const config = require('../config')
const h = require('./helpers')

const showDeploys = deploys => {
  console.table(deploys.map(deploy => ({
    'When': moment(deploy.updated_at).from(),
    'Who': `${deploy.summary} by ${chalk.bold(deploy.user.name)}`,
    'Status': h.formatStatus(deploy.status)
  })))
}

module.exports.show = api => () => {
  api.getProjects()
  .then(h.getProjectId(config.project))
  .then(api.getDeploys)
  .then(showDeploys)
  .catch(h.fail)
}

module.exports.deploy = api => (stage, reference, options) => {
  api.getProjects()
  .then(h.getProjectId(config.project))
  .then(projectId => api
    .getAuthenticityToken(projectId, 'staging')
    .then(token => ({ projectId, token })))
  .then(params => api
    .deploy(
      params.projectId,
      stage || config.defaults.stage,
      params.token,
      reference || config.defaults.reference)
    .then(deploy => ({
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
        console.log(`Status: ${h.formatStatus(deploy.status)}`)
        console.log(deploy.summary)
        if (h.isFinished(deploy.status)) {
          clearInterval(id)
        }
      })
    }, 1000)
  })
  .catch(h.fail)
}
