const h = require('./helpers')

const showStages = stages => {
  console.table(stages.map(stage => ({
    'Stage': stage.name
  })))
}

module.exports = (api, config) => (options) => {
  api.getProjects()
  .then(h.getProjectId(config.project))
  .then(api.getStages)
  .then(showStages)
  .catch(h.fail)
}
