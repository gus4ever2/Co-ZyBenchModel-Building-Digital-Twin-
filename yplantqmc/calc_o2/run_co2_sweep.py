import os

os.environ["R_HOME"] = r"C:\Program Files\R\R-4.3.0"
os.environ["PATH"] = r"C:\Program Files\R\R-4.3.0\bin\x64;" + os.environ["PATH"]


import json
from pathlib import Path
from typing import List, Dict, Any

import numpy as np
import pandas as pd

from rpy2 import robjects as ro
from rpy2.robjects import pandas2ri, default_converter
from rpy2.robjects.conversion import localconverter


def _normalize_path_for_r(path: Path) -> str:
    # R on Windows needs forward slashes
    return str(path).replace('\\', '/')


def setup_r_environment(project_root: Path) -> None:
    ro.r('library(YplantQMC)')
    # Use the same working directory as run.R
    #workdir = _normalize_path_for_r(project_root / 'test' / 'my_try')
    workdir = getWorkdir()
    ro.r(f'setwd("{workdir}")')

    # Construct plant and set location (Tartu)
    ro.r('sugarmaple <- constructplant("plant.P", "spathiphyllum.l")')
    ro.r('tartu <- setLocation(lat = 58.3776, long = 26.7290)')

    # Temperate plant physiology parameters using Photosyn model (CO2-dependent)
    #ro.r('clidlrc <- setPhy("Photosyn", leafpars = list('
         #'Vcmax = 80, Jmax = 140, Rd = 1))')

    ro.r("""
    clidlrc <- setPhy("Farquhar", leafpars = list(
      Vcmax = 80,
      Jmax = 140,
      Rd0 = 1,
      G1 = 8
    ))
    """)

'''
def run_single_simulation(co2_ppm: int, nsteps: int = 24, par_day: int = 40) -> (pd.DataFrame, pd.DataFrame):
    # Set meteorology for Aug 21 in Tartu with given Ca (CO2, ppm)
    ro.r(f'sunnyday <- setMet(tartu, month = 8, day = 21, nsteps = {nsteps}, '
         f'Tmin = 24, Tmax = 27, PARday = {par_day}, Ca = {co2_ppm})')

    # Run Yplant day and extract per-step results
    ro.r('maplerun <- YplantDay(sugarmaple, met = sunnyday, phy = clidlrc, hemi = smallgap)')
    r_df = ro.r('psrdata(maplerun)')
    r_met = ro.r('as.data.frame(sunnyday$dat)')
    with localconverter(default_converter + pandas2ri.converter):
        py_df = ro.conversion.rpy2py(r_df)
        py_met = ro.conversion.rpy2py(r_met)  
    return py_df, py_met
'''

def run_single_simulation(co2_ppm: int, nsteps: int = 24, par_day: int = 40) -> tuple[pd.DataFrame, pd.DataFrame]:

    # Set meteorology for Aug 21 in Tartu with given Ca (CO2, ppm)
    ro.r(f"""
    sunnyday <- setMet(
      tartu,
      month = 8,
      day = 21,
      nsteps = {nsteps},
      Tmin = 24,
      Tmax = 27,
      PARday = {par_day},
      Ca = {co2_ppm}
    )
    """)

    # Run Yplant day
    ro.r("""
    maplerun <- YplantDay(
      sugarmaple,
      met = sunnyday,
      phy = clidlrc,
      hemi = smallgap
    )
    """)

    # IMPORTANT: in Flask, get the R objects and convert them inside localconverter
    with localconverter(default_converter + pandas2ri.converter):
        py_df = ro.conversion.rpy2py(ro.r("psrdata(maplerun)"))
        py_met = ro.conversion.rpy2py(ro.r("as.data.frame(sunnyday$dat)"))

    return py_df, py_met


def compute_co2_grams_per_step(result_df: pd.DataFrame, met_df: pd.DataFrame, nsteps: int) -> List[Dict[str, Any]]:
    # Expect columns: timeofday, ALEAF (umol m-2 s-1), LAplant (m2), timestep (s)
    timeofday = result_df['timeofday'].to_numpy(dtype=float)
    #aleaf = result_df['ALEAF'].to_numpy(dtype=float)
    aleaf = result_df['A'].to_numpy(dtype=float)
    la_plant = result_df['LAplant'].to_numpy(dtype=float)

    if 'timestep' in result_df.columns:
        timestep_s = result_df['timestep'].to_numpy(dtype=float)
    else:
        # Fallback: get daylength from the last constructed met object
        daylength_hours = float(ro.r('as.numeric(sunnyday$daylength)')[0])
        timestep_s = np.full(shape=len(result_df), fill_value=(daylength_hours * 3600.0) / nsteps)

    # Convert umol to grams of CO2
    # umol CO2 per step = ALEAF * LAplant * timestep
    umol = aleaf * la_plant * timestep_s
    grams = umol * 1e-6 * 44.01

    # Pull met variables
    # met_df columns typically include: timeofday, altitude, azimuth, PAR, fbeam, Tair, VPD, Ca, Patm
    t_air = met_df['Tair'].to_numpy(dtype=float) if 'Tair' in met_df.columns else np.full(len(result_df), np.nan)
    vpd = met_df['VPD'].to_numpy(dtype=float) if 'VPD' in met_df.columns else np.full(len(result_df), np.nan)
    par0 = met_df['PAR'].to_numpy(dtype=float) if 'PAR' in met_df.columns else (result_df['PAR0'].to_numpy(dtype=float) if 'PAR0' in result_df.columns else np.full(len(result_df), np.nan))
    fbeam = met_df['fbeam'].to_numpy(dtype=float) if 'fbeam' in met_df.columns else (np.full(len(result_df), np.nan))
    altitude = met_df['altitude'].to_numpy(dtype=float) if 'altitude' in met_df.columns else np.full(len(result_df), np.nan)
    azimuth = met_df['azimuth'].to_numpy(dtype=float) if 'azimuth' in met_df.columns else np.full(len(result_df), np.nan)

    # Result radiation terms from psrdata
    par_inc = result_df['PARinc'].to_numpy(dtype=float) if 'PARinc' in result_df.columns else np.full(len(result_df), np.nan)
    par_leaf = result_df['PARleaf'].to_numpy(dtype=float) if 'PARleaf' in result_df.columns else np.full(len(result_df), np.nan)

    per_step = []
    for idx, (t, dt, g) in enumerate(zip(timeofday, timestep_s, grams)):
        g_per_hour = float(g) * 3600.0 / float(dt) if float(dt) > 0 else np.nan
        per_step.append({
            'timeofday_h': round(float(t), 4),
            'duration_s': round(float(dt), 3),
            'co2_absorbed_g_per_hour': round(g_per_hour, 6) if not np.isnan(g_per_hour) else None,
            'co2_absorbed_g_per_step': round(float(g), 6),
            'air_temp_C': round(float(t_air[idx]), 3) if not np.isnan(t_air[idx]) else None,
            'vpd_kpa': round(float(vpd[idx]), 3) if not np.isnan(vpd[idx]) else None,
            'par0_umol_m2_s': round(float(par0[idx]), 3) if not np.isnan(par0[idx]) else None,
            'fbeam': round(float(fbeam[idx]), 4) if not np.isnan(fbeam[idx]) else None,
            'par_incident_on_leaf_umol_m2_s': round(float(par_inc[idx]), 3) if not np.isnan(par_inc[idx]) else None,
            'par_at_leaf_umol_m2_s': round(float(par_leaf[idx]), 3) if not np.isnan(par_leaf[idx]) else None,
            'solar_altitude_deg': round(float(altitude[idx]), 3) if not np.isnan(altitude[idx]) else None,
            'solar_azimuth_deg': round(float(azimuth[idx]), 3) if not np.isnan(azimuth[idx]) else None,
        })
    return per_step

percentage = 0.0 # for percentage
def run_co2_sweep(co2_start: int, co2_end: int, step: int, output_path: Path, nsteps: int = 24) -> Dict[str, Any]:
    global percentage # for percentage
    project_root = Path(__file__).resolve().parents[1]
    setup_r_environment(project_root)

    par_days: List[int] = [0, 10, 20, 30, 40]
    # par_days: List[int] = [26]

    out: Dict[str, Any] = {
        'location': 'Tartu, Estonia',
        'date': 'Aug 21',
        'nsteps': nsteps,
        'unit_timeofday': 'hour (local time)',
        'unit_duration': 'seconds',
        'unit_value': 'grams CO2 per hour',
        'unit_PARday': 'MJ m-2 d-1',
        'par_days': par_days,
        'notes': 'Includes both per-step and per-hour CO2; per-hour = (per-step) * 3600 / duration.'
    }

    results: Dict[str, Any] = {}
    steps = (co2_end - co2_start) / step # for percentage
    outer_percentage=0.0
    for i, par in enumerate(par_days):
        par_key = str(par)
        results[par_key] = {}
        p=0 # for percentage
        for ca in range(co2_start, co2_end + 1, step):
            inner_percentage = (1/len(par_days)) * (p / steps) * 100 # for percentage
            percentage = outer_percentage + inner_percentage # for percentage
            print("Percentage: "  + get_percentage() + " %") # for percentage
            df, met_df = run_single_simulation(ca, nsteps=nsteps, par_day=par)
            per_step = compute_co2_grams_per_step(df, met_df, nsteps=nsteps)
            results[par_key][str(ca)] = per_step
            p+=1 # for percentage
        outer_percentage = (1 / (len(par_days) - i)) * 100 # for percentage

    out['results'] = results

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open('w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    return out

def get_percentage():
    return f"{percentage:.2f}"

def getWorkdir():
    project_root = Path(__file__).resolve().parents[1]
    return _normalize_path_for_r(project_root / 'test' / 'my_try')

def get_result_dir():
    return getWorkdir()

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Run YplantQMC R simulation over a range of CO2 concentrations and export hourly CO2 absorption (grams) to JSON.')
    parser.add_argument('--start', type=int, default=400, help='Start CO2 ppm (inclusive).')
    parser.add_argument('--end', type=int, default=2500, help='End CO2 ppm (inclusive).')
    parser.add_argument('--step', type=int, default=100, help='CO2 step size (ppm).')
    parser.add_argument('--nsteps', type=int, default=24, help='Number of steps within daylight (default 24).')
    parser.add_argument('--output', type=str, default=str(Path(__file__).parent / 'tartu_aug21_co2_absorption.json'), help='Output JSON file path.')


    args = parser.parse_args()
    run_co2_sweep(args.start, args.end, args.step, Path(args.output), nsteps=args.nsteps)
