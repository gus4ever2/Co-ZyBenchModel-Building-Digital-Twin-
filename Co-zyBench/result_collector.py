import pandas as pd
from datetime import datetime
import pytz
import numpy as np
import os
from bson.objectid import ObjectId
from pymongo import MongoClient

# MongoDB Configuration
client = MongoClient("mongodb://localhost:27017/")
db = client.test
simulations_collection = db.simulations


def _get_itc_increment(votes: dict, atc):
    itc = 0
    for p_id, v in votes.items():
        itc += abs(v - atc)
    return itc


class Result:

    his_ec = {}
    pointer_ec = 0
    his_itc = {}
    pointer_itc = 0
    his_tce = {}
    pointer_tce = 0

    carbon_file_mapping = {"mumbai": "./Co-zyBench/models/carbon_intensity/IN-WE_2023_hourly.csv",
                           "la": "./Co-zyBench/models/carbon_intensity/US-CAL-CISO_2023_hourly.csv",
                           "paris": "./Co-zyBench/models/carbon_intensity/FR_2023_hourly.csv",
                           "scranton": "./Co-zyBench/models/carbon_intensity/US-MIDA-PJM_2023_hourly.csv"}

    time_zone = {"mumbai": "Asia/Kolkata",
                           "la": "America/Los_Angeles",
                           "paris": "Europe/Paris",
                           "scranton": "America/New_York"}

    def __init__(self, occupants, city, simulation_id=None):
        # TODO user define region from input
        self.ec_clg = 0
        self.ec_htg = 0
        self.ec_fan = 0
        self.current_ec_clg = 0
        self.current_ec_htg = 0
        self.current_ec_fan = 0
        self.itc = 0
        self.tce = 0
        self.carbon_emission = 0
        self.occupants = occupants
        self.simulation_id = simulation_id
        self.current_date = None
        self.daily_data = {}
        self.current_progress = 0
        
        # Track the previous update time to calculate progress
        self.last_update_time = datetime.now()
        self.simulation_start_time = datetime.now()

        self.local_time_zone = pytz.timezone(self.time_zone[city])
        self.path_intensity_file = self.carbon_file_mapping[city]

        self.carbon_intensity = pd.read_csv(self.path_intensity_file)
        self.carbon_intensity['Datetime (UTC)'] = pd.to_datetime(self.carbon_intensity['Datetime (UTC)'])

    def add_consumption(self, consumption_clg, consumption_htg, consumption_fan, demand):
        # Store current values for MongoDB
        if self.current_date:
            date_str = self.current_date.strftime("%Y-%m-%d")
            
            # Initialize daily data if not already done
            if date_str not in self.daily_data:
                self.daily_data[date_str] = {
                    "cooling_consumption": 0,
                    "heating_consumption": 0,
                    "fan_consumption": 0,
                    "total_consumption": 0,
                    "itc": {},
                    "total_itc": 0,
                    "equality": {}
                }
            
            # Update consumption values
            if demand == "clg":
                self.daily_data[date_str]["cooling_consumption"] += consumption_clg / 3600000
                self.ec_clg += consumption_clg
            else:
                self.daily_data[date_str]["heating_consumption"] += consumption_htg / 3600000
                self.ec_htg += consumption_htg
            
            self.daily_data[date_str]["fan_consumption"] += consumption_fan / 3600000
            self.ec_fan += consumption_fan
            self.daily_data[date_str]["total_consumption"] = (
                self.daily_data[date_str]["cooling_consumption"] + 
                self.daily_data[date_str]["heating_consumption"] + 
                self.daily_data[date_str]["fan_consumption"]
            )
            self.daily_data[date_str]["current_clg"] = consumption_clg / 3600000
            self.daily_data[date_str]["current_htg"] = consumption_htg / 3600000
            self.daily_data[date_str]["current_fan"] = consumption_fan / 3600000
            
            # Save to MongoDB every hour
            elapsed_time = (datetime.now() - self.last_update_time).total_seconds()
            if elapsed_time > 3600:  # Every hour
                self._save_to_mongodb()
                self.last_update_time = datetime.now()

    def update_itc(self, votes: dict, atc: dict):
        date_str = None
        if self.current_date:
            date_str = self.current_date.strftime("%Y-%m-%d")
        
        # Process ITC data for each space
        for space_id, votes_space in votes.items():
            if atc[space_id] == 4 or len(votes_space) == 0:
                continue
            
            space_itc = _get_itc_increment(votes_space, atc[space_id])
            self.itc += space_itc
            
            # Update MongoDB data if we have a date
            if date_str and date_str in self.daily_data:
                # Initialize if needed
                if "itc" not in self.daily_data[date_str]:
                    self.daily_data[date_str]["itc"] = {}
                if "total_itc" not in self.daily_data[date_str]:
                    self.daily_data[date_str]["total_itc"] = 0
                
                # Update space ITC
                if str(space_id) not in self.daily_data[date_str]["itc"]:
                    self.daily_data[date_str]["itc"][str(space_id)] = 0
                
                self.daily_data[date_str]["itc"][str(space_id)] += space_itc
                self.daily_data[date_str]["total_itc"] += space_itc
        
        # Update equality using occupant loss
        if date_str and date_str in self.daily_data:
            for occupant_id, loss in self.occupants.loss.items():
                self.daily_data[date_str]["equality"][str(occupant_id)] = loss

    def update_co2_emission(self, energy_consumption, date):
        # Store current date for data organization
        self.current_date = date
        
        # Calculate progress
        if date:
            # Assume Jan 1 to Jan 24 is our simulation period
            start_date = datetime(2010, 1, 1)
            end_date = datetime(2010, 1, 24)
            total_days = (end_date - start_date).days
            current_day = (date - start_date).days
            self.current_progress = min(100, (current_day / total_days) * 100)
            
            # Update progress in MongoDB
            if self.simulation_id:
                simulations_collection.update_one(
                    {"_id": ObjectId(self.simulation_id)},
                    {"$set": {"progress": self.current_progress}}
                )
        
        # Original CO2 emission calculation
        local_dt = self.local_time_zone.localize(date)
        utc_dt = local_dt.astimezone(pytz.utc)
        utc_dt = np.datetime64(utc_dt)
        row = self.carbon_intensity.loc[self.carbon_intensity['Datetime (UTC)'] == utc_dt]
        if not row.empty:
            self.carbon_emission += row['Carbon Intensity gCO₂eq/kWh (direct)'].values[0] * energy_consumption
        else:
            data_sorted = self.carbon_intensity.sort_values(by='Datetime (UTC)')
            # find the nearest one before
            nearest_before = data_sorted[data_sorted['Datetime (UTC)'] <= utc_dt]
            nearest_before = nearest_before.iloc[-1] if not nearest_before.empty else None

            # find the nearest one after
            nearest_after = data_sorted[data_sorted['Datetime (UTC)'] > utc_dt]
            nearest_after = nearest_after.iloc[0] if not nearest_after.empty else None

            if nearest_before is not None and nearest_after is not None:
                avg_intensity = (nearest_before['Carbon Intensity gCO₂eq/kWh (direct)'] + nearest_after[
                    'Carbon Intensity gCO₂eq/kWh (direct)']) / 2
                self.carbon_emission += avg_intensity * energy_consumption
            elif nearest_before is not None:
                self.carbon_emission += nearest_before['Carbon Intensity gCO₂eq/kWh (direct)'] * energy_consumption
            elif nearest_after is not None:
                self.carbon_emission += nearest_after['Carbon Intensity gCO₂eq/kWh (direct)'] * energy_consumption
            else:
                raise Exception("Cannot find carbon intensity data")

    def reset(self):
        self.ec_clg = 0
        self.itc = 0
        self.daily_data = {}

    def _save_to_mongodb(self):
        """Save current simulation results to MongoDB."""
        if not self.simulation_id:
            return
        
        # Convert daily_data to format expected by web app
        formatted_results = []
        for date, data in self.daily_data.items():
            # Format data according to the expected format: {date: {...data...}}
            result_obj = {
                date: {
                    "cooling_consumption": data["current_clg"],
                    "heating_consumption": data["current_htg"],
                    "fan_consumption": data["current_fan"],
                    "total_consumption": data["total_consumption"],
                    "itc": data["itc"],
                    "total_itc": data["total_itc"],
                    "equality": data["equality"]
                }
            }
            formatted_results.append(result_obj)
        
        # # Store in MongoDB
        # simulations_collection.update_one(
        #     {"_id": ObjectId(self.simulation_id)},
        #     {
        #         "$set": {
        #             "progress": self.current_progress,
        #             "status": "RUNNING"
        #         }
        #     }
        # )

    def save_result(self, timestamp, identify, total_itc_count):
        """
        Modified to save final results to MongoDB
        """
        if not self.simulation_id:
            return
        
        # Save any pending daily data
        self._save_to_mongodb()
        
        # Save summary data in the correct format
        summary_date = timestamp
        summary = {
            summary_date: {
                "cooling_consumption": self.ec_clg / 3600000,
                "heating_consumption": self.ec_htg / 3600000,
                "co2_emission": self.carbon_emission,
                "total_itc": self.itc,
                "itc": self.itc / total_itc_count if total_itc_count > 0 else 0,
                "equality": float(np.std(list(self.occupants.loss.values())))
            }
        }
        
        simulations_collection.update_one(
            {"_id": ObjectId(self.simulation_id)},
            {"$push": {"results": summary}}
        )

        # if timestamp == "2020-12-31":
        #     # Mark the simulation as completed
        #     simulations_collection.update_one(
        #         {"_id": ObjectId(self.simulation_id)},
        #         {"$set": {
        #             "status": "COMPLETED",
        #             "end_time": datetime.now(),
        #             "estimated_completion_time": None
        #         }}
        #     )




