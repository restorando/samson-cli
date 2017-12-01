const moment = require('moment')
const chalk = require('chalk')
const h = require('./helpers')
const ora = require('ora')
const EventSource = require('eventsource')
const cheerio = require('cheerio')

const showDeploys = deploys => {
  console.table(deploys.map(deploy => ({
    'When': moment(deploy.updated_at).from(),
    'Who': `${deploy.summary} by ${chalk.bold(deploy.user.name)}`,
    'Status': h.formatStatus(deploy.status)
  })))
}

module.exports.show = (api, config) => () => {
  api.getProjects()
  .then(h.getProjectId(config.project))
  .then(api.getDeploys)
  .then(showDeploys)
  .catch(h.fail)
}

const Spinners = (tasks) => {
  var spinners, current

  return {
    start: () => {
      spinners = tasks.map(t => ora(t))
      current = spinners.shift()
      current.start()
    },
    succeedAndNext: () => {
      current.succeed()
      current = spinners.shift()
      current && current.start()
    },
    failAndNext: () => {
      current.fail()
      current = spinners.shift()
      current && current.start()
    },
    fail: error => {
      if (error) {
        current.text = error
      }
      current.fail()
    },
    succeed: text => {
      if (text) {
        current.text = text
      }
      current.succeed()
    },
    text: () => current.text
  }
}

module.exports.deploy = (api, config) => (stage, reference, options) => {
  const spinners = Spinners([
    'Fetching project metadata...',
    'Authenticating...',
    'Starting deploy...'
  ])

  spinners.start()

  api.getProjects()
  .then(h.getProjectId(config.project))
  .then(projectId => api
    .getAuthenticityToken(projectId, 'staging')
    .then(token => {
      spinners.succeedAndNext()
      return { projectId, token }
    }))
    .catch(() => spinners.fail())
  .then(params => {
    spinners.succeedAndNext()
    return api
    .deploy(
      params.projectId,
      stage || config.defaults.stage,
      params.token,
      reference || config.defaults.reference)
    .then(deploy => ({
      deploy: deploy.deploy,
      eventSource: deploy.eventSource,
      projectId: params.projectId
    }))
  })
  .then(params => {
    spinners.succeed(`Deploy started`)
    params.eventSource.on('append', message => {
      const payload = JSON.parse(message.data).msg
      const $ = cheerio.load(payload)
      console.log(chalk.white($('span').text().trim()))
    })
    params.eventSource.on('error', console.error)

    var id = setInterval(() => {
      api
      .getDeploys(params.projectId)
      .then(deploys => {
        const deploy = deploys.find(d => d.id === params.deploy.id)
        if (h.isFinished(deploy.status)) {
          clearInterval(id)
          params.eventSource.close()
          if (h.isFailed(deploy.status)) {
            spinners.fail(`Deploy failed: ${deploy.summary}`)
          } else {
            spinners.succeed(`Deploy succeeded: ${deploy.summary}`)
          }
        }
      })
      .catch(error => {
        clearInterval(id)
        params.eventSource.close()
        spinners.fail(error)
      })
    }, 1000)
  })
  .catch(err => {
    spinners.fail(err)
  })
}
