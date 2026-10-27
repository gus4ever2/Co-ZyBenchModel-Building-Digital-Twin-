# CozyBench frontend — local Windows setup

This repository contains the SolidJS/Vite browser application. These instructions describe local development on the `master` branch. Docker deployment has separate instructions.

## Part A — Install the required software (once)

### 1. Install Node.js

Install **Node.js 22.12 or newer**; Node.js 22 LTS is recommended. The installer from [nodejs.org](https://nodejs.org/) includes npm.

Open a **new Command Prompt** and verify both commands work:

```cmd
node --version
npm --version
```

If either command is not recognized, finish installing Node.js and open a new Command Prompt.

### 2. Put the projects in known folders

For example:

```text
%USERPROFILE%\source\cozybench\
  cozybench-frontend\
  cozybench-backend\
  cosimulator\
```

The frontend can start on its own, but the backend must be running for API features, and the co-simulator must also be running for simulation features.

## Part B — Prepare the frontend (once per checkout)

### 3. Open Command Prompt in the frontend folder

```cmd
cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cozybench-frontend"
```

If you chose a different location, replace the path with the actual frontend folder path.

### 4. Install the locked npm dependencies

Run this once after cloning or downloading the project, and again only when the dependency lockfile changes:

```cmd
npm ci
```

This installs the versions recorded in `package-lock.json`. You do not need to run it every time you start the frontend.

## Part C — Run and stop the frontend

Do these steps each time you want to run the frontend.

### 5. Start the backend services first

For API functionality, start the CozyBench backend and confirm it is available at `http://localhost:8080`. For simulations and plant operations, also start the co-simulator at `http://localhost:5000`.

Follow each project's own README to start those services. Keep their terminal windows open while using the frontend.

### 6. Start the frontend

Open a **new Command Prompt** and run:

```cmd
cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cozybench-frontend"
npm run dev
```

If your checkout is elsewhere, replace the path. Leave this Command Prompt open while using the application. Vite uses port **3000** and stops with an error if that port is already occupied.

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Stop the frontend

Click the Command Prompt window running Vite and press **Ctrl+C**. Close the window after the process stops. The backend and co-simulator have their own terminal windows and must be stopped separately.

## How local API requests work

No frontend environment file is needed for the usual local setup. The frontend sends requests to `/api` on its own origin; Vite forwards them to the backend at `http://localhost:8080`. The backend connects to the co-simulator at `http://localhost:5000`.

The following optional overrides are normally unnecessary. If you need them, set them in the same Command Prompt **before** `npm run dev`:

```cmd
set "VITE_API_BASE_URL=/api"
set "VITE_BUILDING_DT_API_BASE_URL=/api/building-dt/components"
```

## Build a production bundle (optional)

From the frontend folder:

```cmd
npm run build
```

The production files are created in `dist`. To preview that bundle locally:

```cmd
npm run preview
```

The preview server uses a different port from the development server. Live API use may require adjusting the backend CORS origin for that preview address.

## Troubleshooting

- **`node` or `npm` is not recognized:** finish the Node.js installation, open a new Command Prompt, and run the version checks again.
- **`npm ci` fails:** confirm that `package-lock.json` is present and that the current folder is the frontend repository.
- **Port 3000 is already in use:** stop the other process using it, then run `npm run dev` again.
- **API calls fail:** confirm the backend is listening at `http://localhost:8080`; check that its CORS origin includes `http://localhost:3000`.
- **Simulation features fail:** confirm the co-simulator is running at `http://localhost:5000`.

