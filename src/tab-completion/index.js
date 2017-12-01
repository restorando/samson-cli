const CMD = 'samson'
const tab = require('tabtab')({
  name: CMD,
  cache: false
})

const h = require('../program/helpers')

tab.on(CMD, (data, done) => {
  if (data.prev !== CMD) {
    return
  }

  done(null, [
    'init:Creates a new configuration file in the current directory',
    'deploy:Performs a deploy to a stage',
    'deploys:Lists the last deploys',
    'builds:List the last builds',
    'stages:List configured stages'
  ])
})

try {
  const config = require('../config')
  const api = require('../api')(config.url, config.auth, !config.samson.production)

  tab.on('deploy', (data, done) => {
    if (data.prev === 'deploy') {
      api.getProjects()
        .then(h.getProjectId(config.project))
        .then(api.getStages)
        .then(stages => done(null, stages.map(s => s.name)))
        .catch(done)
    } else {
      api.getBranches()
        .then(branches => done(null, branches))
        .catch(done)
    }
  })
} catch (err) {
  console.log('Could not setup deploy autocomplete')
}

tab.start()
