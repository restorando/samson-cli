const axios = require('axios')
const cheerio = require('cheerio')

var projects, stages

module.exports = (url, auth) => {
  const samsonAPI = axios
    .create({
      baseURL: url,
      headers: {
        'Accept': 'application/json',
        // TODO: Refactor. Also, in production the cookie name is _samson_session_production
        'Cookie': `_samson_session_staging=${auth}`
      }
    })

  return {
    getProjects: () => new Promise((resolve, reject) => {
      if (!projects) {
        samsonAPI
          .get(`/api/projects.json`)
          .then(response => {
            projects = response.data.projects
            resolve(projects)
          })
          .catch(reject)
      } else {
        resolve(projects)
      }
    }),

    getDeploys: project => samsonAPI
      .get(`/api/projects/${project}/deploys.json`)
      .then(response => response.data.deploys),

    getStages: projectId => new Promise((resolve, reject) => {
      if (!stages) {
        samsonAPI
          .get(`/api/projects/${projectId}/stages.json`)
          .then(response => {
            stages = response.data.stages
            resolve(stages)
          })
          .catch(reject)
      } else {
        resolve(stages)
      }
    }),

    getBuilds: project => samsonAPI
      .get(`/projects/${project}/builds.json`)
      .then(response => response.data.builds),

    getAuthenticityToken: (project, stage) => axios
      .get(`${url}/projects/${project}/stages/${stage}/deploys/new`, {
        headers: {
          'Cookie': `_samson_session_staging=${auth}`
        }
      })
      .then(response => {
        const html = cheerio.load(response.data)
        return html('head > meta[name="csrf-token"]').attr('content')
      }),

    deploy: (projectId, stageId, token, reference) => samsonAPI
      .post(`/projects/${projectId}/stages/${stageId}/deploys`, {
        utf8: '✓',
        authenticity_token: token,
        deploy: {
          reference
        }
      })
      .then(response => response.data)
  }
}
