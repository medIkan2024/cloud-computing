# Cloud Computing Path
Building RESTful APIs with NodeJS (Express.js) for Backend Web Service and utilizing Google App Engine to deploy them to the Google Cloud Platform in order to establish a connection between an Android application and a database. Using Flask for machine learning model deployment with Google Cloud Run. Using Cloud Storage to store user photos and histories also Cloud SQL with Sequelize to create the database server.

## Architecture
![archtectures](https://storage.googleapis.com/bucket-ml-medikan/architecture.png) <br />
This web services has two service available which is:
- Backend <br />
  Base URL: https://web-service-dot-medikan.et.r.appspot.com
- Deployed Model <br />
  Base URL: https://predict-fhl2f6pupa-et.a.run.app/predict

## ERD
![erd](https://storage.googleapis.com/bucket-ml-medikan/erd.png)
  
## Backend Web Service
Endpoints available:
- User <br />
  <pre>POST /users/register (Register a new user)</pre>
  <pre>POST /users/login (User login)</pre>
  <pre>GET /users (Fetch user account data)</pre>
  <pre>PUT /users/edit-account (Edit user's profile)</pre>
  <pre>PUT /users/edit-profile-picture (Edit user's profile picture)</pre>
  <pre>POST /users/history (Add new history)</pre>
  <pre>GET /users/history/:userId (Get history by user ID)</pre>
- Disease <br />
  <pre>GET /disease (Fetch all diseases data)</pre>
  <pre>GET /disease/:diseaseId (Fetch disease data by ID)</pre>
