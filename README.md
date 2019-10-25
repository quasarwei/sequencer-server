# Sequencer API

## Authentication 
| Method    | Endpoint           | Usage                 | Returns      |
| ------    | --------           | -----                 | -------      |
| POST      | /api/auth/login    | Authenticate a user   | JWT          | 

### `/api/auth/login`
#### POST
Endpoint for authenticating a user
##### Request Body
| Type | Fields | Description |
| ---  | ---    | ---         |
| JSON | user_name, password | JSON containing a username and password string |

##### Responses

| Code | Description |
| --- | --- |
| 200 | Receive JWT with authenticated user_name and id inside payload | 
| 400 | Missing '{user_name OR password}' in request body | 
| 400 | Incorrect user_name or password | 




## User Registration 
| Method    | Endpoint        | Usage                 | Returns         |
| ------    | --------        | -----                 | -------         |
| POST      | /api/users      | Register new user     | User Object     | 

### `/api/users`
#### POST
Endpoint for registering new users

##### Request Body
| Type | Fields | Description |
| ---  | ---    | ---         |
| JSON | user_name, email, password | JSON containing username, email, password strings |

##### Responses

| Code | Description |
| --- | --- |
| 201 | Respond with object containing user data | 
| 400 | Missing '{user_name OR email OR password}' in request body | 
| 400 | Error response object containing a number of validation error messages | 


## Projects

| Method    | Endpoint                         | Usage                       | Returns            |
| ------    | --------                         | -----                       | -------            |
| POST      | /api/projects                    | Create new project          | Project Object     | 
| GET       | /api/projects/{projectid}        | Get a project               | Project Object     | 
| DELETE    | /api/projects/{projectid}        | Delete a project            | Empty Response     | 
| PATCH     | /api/projects/{projectid}        | Edit a     project          | Empty Response     | 
| GET       | /api/projects/user/{userid}      | Get all projects for a user | Array of Projects  | 

**Authorization required for all endpoints**

### `/api/projects`
#### POST
Create new project

##### Request Body
| Type | Fields | Description |
| ---  | ---    | ---         |
| JSON | title, project_data | project_data should be an object containing fields for 'bpm' and 'notes', an array of notes where notes are represented as a pair of time and key strings inside an array, like so: ['1:0:0', 'C4'] |

##### Responses
| Code | Description |
| --- | --- |
| 201 | Respond with project object and append project id to location header | 
| 400 | Missing '{title OR project_data}' in request body | 
| 401 | Unauthorized Request | 

### `/api/projects/:projectid`

##### Path parameters
| Path parameter   | Value            |      
| ---              | ---              | 
| projectid        | Unique project id|

#### GET
Returns an object containing all project data

##### Responses
| Code | Description |
| --- | --- |
| 200 | Respond with project object | 
| 404 | Project doesn't exist | 
| 401 | Unauthorized Request | 

#### DELETE
Delete an existing project

##### Responses
| Code | Description |
| --- | --- |
| 204 | No response| 
| 404 | Project doesn't exist | 
| 401 | Unauthorized Request | 

#### PATCH
Edit an existing project

##### Request Body
| Type | Fields | Description |
| ---  | ---    | ---         |
| JSON | title OR project_data | project_data should be an object containing fields for 'bpm' and/or 'notes', an array of notes where notes are represented as a pair of time and key strings inside an array, like so: ['1:0:0', 'C4'] |

##### Responses
| Code | Description |
| --- | --- |
| 204 | No response | 
| 404 | Project doesn't exist | 
| 401 | Unauthorized Request | 
### `/api/projects/user/:userid`
#### GET
Returns an array of objects containing all of the 
projects beloning to user with id of `:userid`

##### Path parameters
| Path parameter   | Value            |      
| ---              | ---              | 
| userid           | Unique user id   |

##### Responses
| Code | Description |
| --- | --- |
| 200 | Respond with array of objects | 
| 401 | Unauthorized Request | 