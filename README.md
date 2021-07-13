# FSJS Project 9 - REST API

For this project, I created a REST API of Users and Courses using a SQLite database, the Sequelize ORM, and the Express web application framework.  

The server is listening on port 5000. The API uses Basic Auth authentication, requiring a user to put a username and password in the header of the API request.  Not all routes require authentication.  Note that a User can own many courses, and a course is owned by one user.

Note also that I put my custom route middleware functions in a file called **route_middleware.js** that is in the root directory.

The Routes for this API are as follows:

GET /api/users - returns the currently authenticated user (you will need to be a current user and send Basic Auth authentication (username and Password).

POST api/users - creates a user (no authentication needed).

GET api/courses - returns a list of courses and information about the user that owns the course. (no authentication needed).

GET api/courses/:id - returns the course with the id specified in the route and, and information about the user that owns the course (no authentication needed).

POST api/courses - allows an authenticated user to create a course (authentication needed).

Please note: the course created by an authenticated user will always be owned by that user.  An authenticated user cannot create a course owned by another user.  If a user sends UserId as a key in the body of a this POST request, the UserID key:value pair will be ignored.

PUT api/courses/:id - updates a course (authentication and authorization needed - a user cannot edit a course unless authorization is sent for the user who owns the course.

Please note: the course owner cannot change the owner of the course.   If a user sends UserId as a key in the body of a this PUT request, the UserID key:value pair will be ignored.

DELETE api/courses/:id - deletes a course (authentication and authorization needed - a user cannot delete a course unless authorization is sent for the user who owns the course.

There will be error messages and error status codes as appropriate.

======= Instuctions to view project locally =========

1) To run this project locally, you must have node.js and npm installed.
2) Download or clone the project from this repo.
3) The project uses the Express web application framework It also uses the SQLite database and the Sequelize ORM.  You will install these and all other dependencies by running:
**npm install**
4) run **npm run seed** to create and seed a SQLite database.
5) Run **npm start** to start the server and application. The last message you will see should be: 'Successful database connection.
5) Use Postman or any other API development tool.  Enter URI's in this format: GET localhost:5000/api/courses.

Note: you can import the file RESTAPI.postman_collection.json into Postman to get a collections of URI's that will allow you to test routes.

