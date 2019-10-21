const express = require('express');
const path = require('path');
const ProjectsService = require('./projects-service');

const projectsRouter = express.Router();
const jsonBodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

projectsRouter
  .route('/')
  .get(requireAuth, (req, res, next) => {
    ProjectsService.getAllProjects(req.app.get('db'))
      .then(projects => {
        res.json(ProjectsService.serializeProjects(projects));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    const { title, project_data } = req.body;
    const newProject = { title, project_data }

    //check for missing fields
    for (const field of ['title', 'project_data'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        });

    newProject.user_id = req.user.id;
    newProject.date_created = new Date().toLocaleString('en', {timezone: 'UTC'});

    ProjectsService.insertProject(
      req.app.get('db'),
      newProject
    )
      .then(project => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${project.id}`))
          .json(ProjectsService.serializeProject(project));
      })
      .catch(next);
  })

projectsRouter
  .route('/:project_id')
  .all(requireAuth)
  .all(checkProjectExists)
  .get((req, res) => {
    res.json(ProjectsService.serializeProject(res.project))
  })
  .delete((req, res, next) => {
    ProjectsService.removeProject(
      req.app.get('db'),
      req.params.project_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, (req, res, next) => {
    const { title, project_data } = req.body;
    const projectToUpdate = { title, project_data };

    const numberOfValues = Object.values(projectToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) 
      return res.status(400).json( {
        error : 'Request body must contain either \'title\' or \'project_data\''
      });

    projectToUpdate.date_modified = new Date().toLocaleString('en', {timezone: 'UTC' });

    ProjectsService.updateProject(
      req.app.get('db'),
      req.params.project_id,
      projectToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });


projectsRouter
  .route('/users/:user_id')
  .get(requireAuth, (req, res, next) => {
    const currentUserId = req.user.id;

    // if id of current user doesn't match request id
    // send 401 unauthorized
    if(currentUserId != req.params.user_id){
      return res.status(401)
        .json( {
          error: 'Unauthorized request'
        })
    }

    ProjectsService.getProjectsByUser(
      req.app.get('db'),
      currentUserId
    )
      .then(projects => {
        res.json(ProjectsService.serializeProjects(projects));
      })
      .catch(next);
  });

async function checkProjectExists(req, res, next) {
  try {
    
    const project = await ProjectsService.getProjectById(
      req.app.get('db'),
      req.params.project_id
    )

    if(!project)
    return res.status(404).json({
      error: 'Project doesn\'t exist'
    })

    // check project belongs to user
    if (req.user.id != project.user_id) {
      return res.status(401)
      .json({
        error: 'Unauthorized request'
      })
    }

    res.project = project;
    next();
  } catch(err) {
    next(err);
  }
}

module.exports = projectsRouter;