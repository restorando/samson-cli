const chalk = require('chalk')

module.exports.isFinished = status => status === 'errored'

module.exports.formatStatus = status => status === 'succeeded'
  ? chalk.green(status)
  : chalk.red(chalk.bold(status))

module.exports.getProjectId = projectName => projects =>
  Promise.resolve(projects.find(p => p.permalink === projectName).id)

module.exports.fail = error => {
  console.error(error)
  process.exit(1)
}
