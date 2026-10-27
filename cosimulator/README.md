# CozyBench co-simulator — Windows local setup

Follow these steps in order to install the required software and run the Python service locally on 64-bit Windows 10/11. Commands in `cmd` blocks are for **Command Prompt (CMD)**. Open a new terminal after using `setx` so Windows loads the saved environment variables.

## Part A — Install the required software

### 1. Install EnergyPlus 26.1.0

1. Download the **Windows 64-bit EnergyPlus 26.1.0** installer from the [official EnergyPlus downloads page](https://energyplus.net/downloads), then run it.
2. Keep the default install folder, `C:\EnergyPlusV26-1-0`, if possible. The co-simulator's input model and bundled EnergyPlus object library require version **26.1**.
3. Save the installation path as a Windows environment variable. Open **Command Prompt as your normal user** and run:

   ```cmd
   setx ENERGYPLUS_HOME "C:\EnergyPlusV26-1-0"
   ```

   If you installed EnergyPlus in another folder, replace the path with that folder. `ENERGYPLUS_HOME` must be the folder containing `Energy+.idd` and `energyplus.exe`.
4. Check the file exists:

   ```cmd
   dir C:\EnergyPlusV26-1-0\Energy+.idd
   ```

   If you used a different folder, use that path in this check too.

### 2. Install R 4.6.1

This setup uses R 4.6.1, the latest stable release as of 2026-10-27, together with rpy2 3.6.9. rpy2 3.6.7 and newer require R 4.5.0 or newer and support R 4.6.

1. Download the **R-4.6.1 for Windows** installer from [CRAN's official archive](https://cloud.r-project.org/bin/windows/base/old/4.6.1/R-4.6.1-win.exe).
2. Run the installer. Keep the default 64-bit installation folder, normally `C:\Program Files\R\R-4.6.1`.
3. Save the R location and the rpy2 Windows mode as user environment variables. In Command Prompt, run:

   ```cmd
   setx R_HOME "C:\Program Files\R\R-4.6.1"
   setx RPY2_CFFI_MODE "API"
   ```

   If you chose a different R installation folder, use it for `R_HOME`.
4. Check that R is installed at the path you saved:

   ```cmd
   dir "%R_HOME%\bin\x64\R.exe"
   ```

   `setx` changes are visible only in **new** terminal windows. Close this Command Prompt and open another before continuing.

The application sets `R_LIBS_USER` itself to the repository's `data\r-library`; do not install or copy `plantecophys` separately.

### 3. Install Miniforge (Conda)

1. Download the **Windows x86_64** installer from the [Miniforge download page](https://conda-forge.org/download/).
2. Run it for your Windows user and keep the default installation options and shortcuts.
3. From the Start menu, open **Miniforge Prompt** and check Conda:

   ```cmd
   conda --version
   ```

4. You can run all remaining commands in Miniforge Prompt. To use regular Command Prompt instead, initialize it once in Miniforge Prompt:

   ```cmd
   conda init cmd.exe
   ```

   Close all Command Prompt windows and open a new one. Conda commands will then work there. The `setx` commands saved `ENERGYPLUS_HOME`, `R_HOME`, and `RPY2_CFFI_MODE` as Windows user variables; they are not stored inside Conda. A newly opened Miniforge Prompt inherits them from Windows, and `conda activate cozybench-cosimulator` keeps them available to Python. Do not register these three variables again with `conda env config vars`.

### 4. Install and start MongoDB

1. Follow the [official MongoDB Community Server Windows installation guide](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/).
2. Install **MongoDB Community Server 7.0** as a Windows service. Keep the default port `27017`.
3. Start the local MongoDB server. Open **Command Prompt as Administrator** and run:

   ```cmd
   net start MongoDB
   ```

   If Windows reports that the service is already started, it is ready. Otherwise, the command should report that the service started successfully.
4. Confirm the Windows service is running:

   ```cmd
   sc query MongoDB
   ```

   Look for `STATE ... RUNNING`. MongoDB must listen locally on port `27017` so the co-simulator can connect to `mongodb://localhost:27017/`. You can also start it from the Windows **Services** app by finding **MongoDB Server** and choosing **Start**.

The application uses database `cozybench` and creates collections as needed. Leave the MongoDB service running while using the co-simulator. To stop it later, use `net stop MongoDB` in an elevated Command Prompt or stop **MongoDB Server** from the Services app.

## Part B — Prepare the co-simulator (one-time setup)

Complete these steps once for this checkout. You do not recreate the Conda environment each time you run the service.

### 5. Download the repository and create the Conda environment

1. Download or clone the co-simulator **`master` branch** into `%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cosimulator`. The `pyproject.toml`, `environment.yml`, and `src` folder must be directly inside `cosimulator`.
2. Open **Miniforge Prompt** and go to the repository folder:

   ```cmd
   cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cosimulator"
   ```

3. Create the Conda environment once:

   ```cmd
   conda env create --file environment.yml
   ```

   This creates `cozybench-cosimulator` with Python 3.11, CARIBU, rpy2 3.6.9, and the project's Python packages. R 4.6.1 was installed separately in Part A. Package downloads may take several minutes.

If you later change `environment.yml`, update the existing environment from the repository folder with:

```cmd
conda env update --file environment.yml --prune
```

### 6. Install this checkout into Conda (once per checkout)

In the same Miniforge Prompt, activate the environment and install the project in editable mode:

```cmd
conda activate cozybench-cosimulator
python --version
where python
python -m pip install --no-deps --editable .
```

`python --version` should print **3.11.x**, and the first path from `where python` should be inside `cozybench-cosimulator`. The editable install is needed once for this checkout; repeat it only after pulling changes to project packaging or dependencies.

Install plantecophys into the local library used by this checkout. Run these commands from the cosimulator folder in the activated environment:

~~~cmd
if not exist data\r-library mkdir data\r-library
"%R_HOME%\bin\x64\Rscript.exe" -e "install.packages('plantecophys', lib='data/r-library', repos='https://cloud.r-project.org')"
~~~

This downloads the R package into data\r-library; you do this once per checkout, not each time you run the service.

### 7. Verify the initial setup

The Windows user variables from Part A are inherited by this new Miniforge Prompt and by Python after Conda activation. Check them once:

```cmd
echo %ENERGYPLUS_HOME%
echo %R_HOME%
echo %RPY2_CFFI_MODE%
dir "%ENERGYPLUS_HOME%\Energy+.idd"
dir "%R_HOME%\bin\x64\R.exe"
```

The paths should point to the EnergyPlus installation and R 4.6.1. Check the R bridge, bundled R package, and CARIBU imports:

```cmd
python -c "import rpy2.robjects as ro; print(ro.r('R.version.string')[0]); ro.r('library(plantecophys)'); print('plantecophys OK')"
python -c "from openalea.caribu.caribu import raycasting; from openalea.caribu.light import turtle; print('CARIBU OK')"
```

Each command should finish without an error. If a `setx` value is blank, close Miniforge Prompt, open it again, and repeat this check. You do not need to register these variables inside Conda.

## Part C — Run the co-simulator

Repeat these steps each time you open a new terminal to run the service. You do not repeat Part B.

### 8. Start and stop the co-simulator

1. Make sure the MongoDB Windows service is running. If it is stopped, open an elevated Command Prompt and start it:

   ```cmd
   net start MongoDB
   ```

2. Open a **new Miniforge Prompt**, go to the repository folder, and activate the existing environment:

   ```cmd
   cd /d "%USERPROFILE%\Desktop\thesis\Web Co-ZyBench final\cosimulator"
   conda activate cozybench-cosimulator
   ```

   The `ENERGYPLUS_HOME`, `R_HOME`, and `RPY2_CFFI_MODE` values are already saved in Windows and are inherited automatically. The app defaults to MongoDB at `mongodb://localhost:27017/` and database `cozybench`. If you need different MongoDB settings for this terminal only, set them now:

   ```cmd
   set "COSIMULATOR_MONGO_URI=mongodb://localhost:27017/"
   set "COSIMULATOR_MONGO_DATABASE=cozybench"
   ```

3. Start the API with Uvicorn:

   ```cmd
   python -m uvicorn cosimulator.main:app --app-dir src --host 127.0.0.1 --port 5000
   ```

   Keep this terminal open while the service is running. Open the API at [http://localhost:5000](http://localhost:5000) or its interactive documentation at [http://localhost:5000/docs](http://localhost:5000/docs).
4. To stop the Python service, focus its terminal and press **Ctrl+C**. Then deactivate the environment:

   ```cmd
   conda deactivate
   ```

Stopping the Python service does not stop MongoDB.

### 9. Run the complete CozyBench application

Keep MongoDB running and start each application process in its own terminal window:

1. **Co-simulator:** follow step 8 in a Miniforge Prompt.
2. **Spring backend:** follow the backend README. By default, it listens at `http://localhost:8080` and calls the co-simulator at `http://localhost:5000`.
3. **Frontend:** follow the frontend README and open `http://localhost:3000` in a browser.

Leave the application terminals open while using CozyBench. Stop each service with **Ctrl+C** in its terminal. Run `conda deactivate` in the co-simulator terminal after stopping it.

### 10. Run the Python tests (optional)

After activating `cozybench-cosimulator` and going to the repository folder, run:

```cmd
python -m pytest
```

Tests that invoke EnergyPlus require `ENERGYPLUS_HOME` to point to the EnergyPlus 26.1.0 installation. A few tests skip when an optional local EnergyPlus executable is absent.

## Environment variables at a glance

| Variable | Set by | Value |
| --- | --- | --- |
| `ENERGYPLUS_HOME` | Step 1 (`setx`) | EnergyPlus 26.1 installation folder containing `Energy+.idd` |
| `R_HOME` | Step 2 (`setx`) | R 4.6.1 installation folder |
| `RPY2_CFFI_MODE` | Step 2 (`setx`) | `API` |
| `COSIMULATOR_MONGO_URI` | Optional, per terminal | Defaults to `mongodb://localhost:27017/` |
| `COSIMULATOR_MONGO_DATABASE` | Optional, per terminal | Defaults to `cozybench` |
| `COSIMULATOR_HOST` | Optional | Defaults to `127.0.0.1` |
| `COSIMULATOR_PORT` | Optional | Defaults to `5000` |
| `COSIMULATOR_CORS_ORIGINS` | Optional | Local frontend origins on port `3000` |
| `COSIMULATOR_DEBUG` | Optional | Defaults to `false` |
| `COSIMULATOR_LOG_LEVEL` | Optional | Defaults to `INFO` |
| `COSIMULATOR_SSE_TIMEOUT_SECONDS` | Optional | Defaults to `15` |

The remaining `COSIMULATOR_` variables only override the API name, version, or description. The local defaults normally do not need changes.

## Troubleshooting

- **`conda` is not recognized:** use Miniforge Prompt, or run `conda init cmd.exe` there, close all Command Prompt windows, and open a new one.
- **Environment creation fails while downloading packages:** confirm Internet access and rerun `conda env create --file environment.yml` from the repository folder.
- **`ENERGYPLUS_HOME` is blank or `Energy+.idd` is not found:** rerun `setx ENERGYPLUS_HOME "C:\EnergyPlusV26-1-0"` with the correct installation folder, then open a new terminal.
- **R or `plantecophys` error:** confirm R 4.6.1 is installed, `R_HOME` points to its installation folder, and `data\r-library\plantecophys\DESCRIPTION` exists.
- **CARIBU import error:** confirm the Conda environment was created from `environment.yml` in this repository.
- **MongoDB connection error:** start the MongoDB Windows service and confirm it listens on port `27017`.
- **Port `5000` is already occupied:** stop the other local service using that port before starting the co-simulator.



