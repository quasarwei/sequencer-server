# Sequencer API

## Authentication 
### `/api/login`

#### POST 
Endpoint for authenticating requests

## User Registration 
### `/api/users`
#### POST
Endpoint for registering new users

## Projects
### `/api/projects`
#### POST
Inserts a new project and returns an object containing project information and the posted project data for the sequence 

### `/api/projects/:projectid`
#### GET
Returns an object containing all project information

#### DELETE
Delete an existing project
Empty response if successful

#### PATCH
Edit an existing project
Empty response if successful

### `/api/projects/user/:userid`
#### GET
Returns an array of objects containing all of the 
projects beloning to user with id of `:userid`