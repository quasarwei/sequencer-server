const xss = require('xss');

const ProjectsService = {
  getProjectsByUser(db, user_id) {
    return db
      .from('sequencer_projects')
      .select('*')
      .where({ user_id });
  },
  getAllProjects(db) {
    return db
      .from('sequencer_projects')
      .select('*');
  },
  getProjectById(db, id) {
    return db('sequencer_projects')
      .select('*')
      .where({ id })
      .first();
  },
  insertProject(db, project) {
    return db
      .insert(project)
      .into('sequencer_projects')
      .returning('*')
      .then(([project]) => project);
  },
  removeProject(db, id) {
    return db
      .from('sequencer_projects')
      .where({ id })
      .delete();
  },
  updateProject(db, id, updatedProject) {
    return db('sequencer_projects')
      .where({ id })
      .update(updatedProject);
  },
  serializeProject(project) {
    return {
      id: project.id,
      title: xss(project.title),
      date_created: project.date_created,
      date_modified: project.date_modified,
      user_id: project.user_id,
      project_data: project.project_data
    };
  },
  serializeProjects(projects) {
    return projects.map(this.serializeProject);
  }

};

module.exports = ProjectsService;