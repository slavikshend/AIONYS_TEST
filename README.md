This document provides instructions on how to run the application using Docker Compose and test with Cypress.

**Prerequisites**

Ensure the following software is installed on your local machine:

- Docker (version 20.10.0 or higher)
- Docker Compose (version 2.0.0 or higher)
- Node.js (for running Cypress locally)

**Initializing the Environment**

To build the images and start all services in detached mode, execute the following command in the root directory:

`docker-compose up -d --build`

Once the containers are initialized and the health checks are passed, the services will be available via your web browser. The Angular application is mapped to port 80.

**Stopping and Cleaning the Environment**

To stop the running containers and remove all associated volumes (including the database state), use the following command:

`docker-compose down -v`

**End-to-End Testing with Cypress**

Before running tests, navigate to the directory containing the Cypress configuration and install the required dependencies:

`cd client`
`npm install`

To open the Cypress Test Runner (GUI):

`npx cypress open`

To execute tests within the Cypress GUI, choose your preferred browser, and then click on the **todo.cy.js** spec file from the list to begin the automated run. The browser will open a new window where you can monitor each command and assertion in real-time as the test progresses.

To execute all tests in the terminal without a GUI:

`npx cypress run`
