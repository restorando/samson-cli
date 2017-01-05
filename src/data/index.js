const axios = require('axios')

var projects

module.exports = (url, auth) => {
  const instance = axios
    .create({
      baseURL: url,
      headers: {
        'Accept': 'application/json',
        'Cookie': `_samson_session_staging=${auth}`
      }
    })

  return {
    getProjects: () => {
      return new Promise((resolve, reject) => {
        if (!projects) {
          instance
            .get(`/api/projects.json`)
            .then(response => {
              projects = response.data.projects
              resolve(projects)
            })
            .catch(reject)
        } else {
          resolve(projects)
        }
      })
    },

    getDeploys: project => instance
      .get(`/api/projects/${project}/deploys.json`)
      .then(response => response.data.deploys),

    getStages: project => instance
      .get(`/api/projects/${project}/stages.json`)
      .then(response => response.data.stages),

    getBuilds: project => instance
      .get(`/projects/${project}/builds.json`)
      .then(response => response.data.builds)
  }
}
