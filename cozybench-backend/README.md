# CozyBench backend — local Windows setup

This repository contains the Spring Boot API. These instructions are for the local setup on the `master` branch. Docker deployment has separate instructions.

## Part A — Install the required software (once)

### 1. Install Java

Install a 64-bit **JDK 25** (not only a JRE), for example [Eclipse Temurin 25](https://adoptium.net/temurin/releases/).

Open a **new Command Prompt** and verify Java:

```cmd
java --version
```

The output should identify Java version 25. If Windows says that `java` is not recognized, finish the JDK installation, ensure its `bin` directory is on `PATH`, and open a new Command Prompt.

### 2. Install and start MongoDB

Install **MongoDB Community Server 7.0** using the [official Windows installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/). During setup, configure MongoDB as a Windows service.

Start it from an Administrator Command Prompt if the service is stopped:

```cmd
net start MongoDB
```

If the service has a different name on your installation, start it from Windows **Services** instead. The application expects MongoDB at `localhost:27017`.

### 3. Put the three projects in known folders

For example:

```text
%USERPROFILE%\source\cozybench\
  cozybench-backend\
  cozybench-frontend\
  cosimulator\
```

The backend can start without the frontend. The co-simulator must be running for simulation and plant-library operations.

## Part B — Prepare the backend (once per checkout)

### 4. Open Command Prompt in the backend folder

Open **Command Prompt** and run:

```cmd
cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cozybench-backend"
```

If you chose a different location, replace the path with the actual backend folder path.

### 5. Configure local environment variables

Set these values in the Command Prompt window where you will run Spring. They apply only to that window, so set them again in each new window used to start the backend.

```cmd
set "MONGODB_URI=mongodb://localhost:27017/cozybench"
set "CORS_ALLOWED_ORIGINS=http://localhost:3000"
set "COZYBENCH_COSIMULATOR_BASE_URL=http://localhost:5000"
```

Generate a unique JWT secret. Open a **separate PowerShell** window and run:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Copy the printed value. Return to the backend Command Prompt and set it (replace the placeholder):

```cmd
set "JWT_SECRET=PASTE_THE_GENERATED_VALUE_HERE"
```

Do not share or commit this secret. If you close this Command Prompt, set the variables again in the new window.

### 6. Know what starts automatically

The repository includes the Maven Wrapper, so you do **not** need to install Maven separately. The first start downloads the pinned Maven version and project dependencies; internet access is needed for that first download. MongoDB must already be running as a Windows service. The co-simulator is a separate program and must be started separately when you need its features.

## Part C — Run and stop the backend

Do these steps each time you want to run the backend.

### 7. Start MongoDB if it is not already running

In an **Administrator Command Prompt**, run:

```cmd
net start MongoDB
```

If it is already running, Windows will say so. You do not need to start it again.

### 8. Open a Command Prompt, go to the backend folder, and set the variables

```cmd
cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cozybench-backend"
set "MONGODB_URI=mongodb://localhost:27017/cozybench"
set "JWT_SECRET=PASTE_THE_GENERATED_VALUE_HERE"
set "CORS_ALLOWED_ORIGINS=http://localhost:3000"
set "COZYBENCH_COSIMULATOR_BASE_URL=http://localhost:5000"
```

Replace the JWT placeholder with the secret you generated in Part B. If your repositories are elsewhere, update the `cd` path.

### 9. Start Spring Boot

In the same Command Prompt:

```cmd
mvnw.cmd spring-boot:run
```

Wait for Spring Boot to report that it has started. It listens at `http://localhost:8080`. API documentation is available at [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).

On startup, the backend initializes building-library data and indexes in MongoDB and imports bundled plant-library data when needed.

### 10. Stop the backend

Click the Command Prompt window running Spring Boot and press **Ctrl+C**. Close the window after the process stops.

## Environment variable reference

| Variable | Purpose | Local value |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/cozybench` |
| `JWT_SECRET` | Signs and verifies authentication tokens | A unique random value generated in Part B |
| `CORS_ALLOWED_ORIGINS` | Browser origin allowed to call the API | `http://localhost:3000` |
| `COZYBENCH_COSIMULATOR_BASE_URL` | Python co-simulator base URL | `http://localhost:5000` |

## Run backend tests (optional)

From the backend folder:

```cmd
mvnw.cmd test
```

## Troubleshooting

- **Java has the wrong version or is not recognized:** install JDK 25, open a new Command Prompt, and run `java --version`.
- **MongoDB connection refused:** start the MongoDB service and check that it listens on port 27017.
- **Browser reports a CORS error:** make sure the frontend uses `http://localhost:3000` and the backend variable has that exact origin.
- **Simulation or plant operations fail:** start the co-simulator and check that it is listening on `http://localhost:5000`.
- **First start cannot download dependencies:** allow Maven to reach Maven Central, then repeat `mvnw.cmd spring-boot:run`.

