const chalk = require('chalk')

module.exports.isFinished = status => status !== 'running'

module.exports.isFailed = status => status === 'errored' || status === 'failed'

module.exports.formatStatus = status => {
  if (status === 'succeeded') {
    return chalk.green(status)
  } else if (status === 'running') {
    return chalk.yellow(status)
  } else {
    return chalk.red(chalk.bold(status))
  }
}

module.exports.getProjectId = projectName => projects =>
  Promise.resolve(projects.find(p => p.permalink === projectName).id)

module.exports.fail = error => {
  console.error(error)
  process.exit(1)
}
