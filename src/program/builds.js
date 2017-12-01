const helpers = require('./helpers')
const moment = require('moment')

const showBuilds = builds => {
  console.table(builds.map(build => ({
    'Label': build.label,
    'Created': moment(build.created_at).from(),
    'Git ref': build.git_ref === build.git_sha ? build.git_ref : `${build.git_ref} (${build.git_sha})`,
    'Status': helpers.formatStatus(build.docker_status)
  })))
}

module.exports = (api, config) => (options) => {
  api.getProjects()
  .then(helpers.getProjectId(config.project))
  .then(api.getBuilds)
  .then(showBuilds)
  .catch(helpers.fail)
}
