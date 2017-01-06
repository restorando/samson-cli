const axios = require('axios')
const cheerio = require('cheerio')
const gitty = require('gitty')

var projects, stages

module.exports = (url, auth, staging) => {
  const cookie = `_samson_session_${staging ? 'staging' : 'production'}=${auth}`
  const samsonAPI = axios
    .create({
      baseURL: url,
      headers: {
        'Accept': 'application/json',
        'Cookie': cookie
      }
    })
  const git = gitty('.')

  return {
    getBranches: () => new Promise((resolve, reject) => {
      git.getBranches((error, branches) => {
        if (error) {
          return reject(error)
        }
        resolve(branches.others.concat(branches.current))
      })
    }),

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
          'Cookie': cookie
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
