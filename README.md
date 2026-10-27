# CozyBench — project guide

This folder contains the three projects in one Git repository:

- cozybench-backend — Spring Boot API
- cozybench-frontend — SolidJS/Vite web application
- cosimulator — Python simulation service

## Branches

- master: local setup. Each project folder contains its own detailed README.
- docker-deployment: Dockerfiles, Compose setup, and this central README for Docker and server deployment. The local project READMEs are not present on this branch.

Use one branch for the whole repository. This folder is the Git root; do not switch branches from inside an individual project.

## Run locally on Windows

Start the services in this order:

1. Follow cosimulator/README.md to install EnergyPlus, R, Miniforge/Conda and MongoDB, create the Conda environment, then start the Python service.
2. Follow cozybench-backend/README.md to start the Spring API.
3. Follow cozybench-frontend/README.md to start the web application.

Default local addresses:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Co-simulator: http://localhost:5000
- MongoDB: mongodb://localhost:27017/cozybench

Each project README separates one-time setup from the commands to repeat when starting the service.

## Docker and server deployment

Switch to docker-deployment and read this file there. It contains Compose, SSH and server deployment instructions.

Never commit secrets such as .env files, JWT keys, SSH private keys, or server credentials.
