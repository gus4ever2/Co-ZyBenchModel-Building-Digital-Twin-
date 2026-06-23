from threading import Thread
from flask import Flask, Response, json, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import random
import time
from werkzeug.utils import secure_filename
import os
import subprocess
import sys
from pathlib import Path
from yplantqmc.calc_o2.run_co2_sweep import run_co2_sweep
#from changeIDF.create_plant import get_component_form_temp
from yplantqmc.calc_o2.run_co2_sweep import getWorkdir, get_percentage, get_result_dir
from create_obj.convert_to_obj import convert
import gridfs

# Add Co-zyBench folder to path
current_dir = os.path.dirname(os.path.abspath(__file__))
cozybench_dir = os.path.join(current_dir, 'Co-zyBench')
sys.path.append(cozybench_dir)

# Import Co-zyBench modules directly
sys.path.insert(0, cozybench_dir)  # Ensure the directory is at the front of path
import occupants
import result_collector
import sim_ep
import strategies
from eppy.modeleditor import IDF
from changeIDF.config_idf.ConfigIDF import ConfigIDF

# Create aliases for easier reference
Participant = occupants.Participant
Result = result_collector.Result
CoSimulation = sim_ep.CoSimulation
SensationAggregator = strategies.SensationAggregator
generate_set_point = strategies.generate_set_point

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MongoDB Configuration
client = MongoClient("mongodb://localhost:27017/")
db = client.test
simulations_collection = db.simulations
plants_collection = db.plant


class SimulationStatus:
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"
    STARTED = "STARTED"
    PENDING = "PENDING"
    CANCELED = "CANCELED"


def run_cozybench_simulation(simulation_id, userEmail, constructionSet, algorithm="majority", city="paris"):
    """Run the actual Co-zyBench simulation in a separate thread."""
    try:
        # Update simulation status
        simulations_collection.update_one(
            {"_id": ObjectId(simulation_id)},
            {"$set": {
                "status": SimulationStatus.RUNNING,
                "progress": 0.0
            }}
        )

        # Default paths and settings from Co-zyBench
        #path_ep_model = os.path.join(cozybench_dir, "models/synthetic_large/10floors_V2.idf")
        path_ep_model = os.path.join(cozybench_dir, "models/office/CZ4/in.idf")
        #path_trajectories = os.path.join(cozybench_dir, "models/synthetic_large/trajectories")
        path_trajectories = os.path.join(cozybench_dir, "models/office/trajectories")
        #path_profile = 1200
        path_profile = 18

        hvac_controller = ["preference_estimation"]
        epw_file_path = os.path.join(cozybench_dir, f"models/weathers/{city}.epw")
        weather_file_mapping = {
            "mumbai": os.path.join(cozybench_dir, "models/weathers/mumbai"), 
            "la": os.path.join(cozybench_dir, "models/weathers/la"),
            "paris": os.path.join(cozybench_dir, "models/weathers/paris"), 
            "scranton": os.path.join(cozybench_dir, "models/weathers/scranton")
        }

        # Initialize EnergyPlus
        idd_file = Path(r"C:\Users\spili\Desktop\EnergyPlusV22-2-0\Energy+.idd")
        IDF.setiddname(idd_file)
        idf_origin = IDF(path_ep_model)

        ddy_file_path = weather_file_mapping[city]+".ddy"
        ddy_idf = IDF(ddy_file_path)

        design_day_classes = ['SizingPeriod:DesignDay']
        for cls in design_day_classes:
            idf_origin.removeallidfobjects(cls)

        design_days = ddy_idf.idfobjects["SizingPeriod:DesignDay".upper()]
        design_days = design_days[0]
        idf_origin.copyidfobject(design_days)

        # Create temp directory if it doesn't exist
        temp_dir = os.path.join(cozybench_dir, "models/temp")
        os.makedirs(temp_dir, exist_ok=True)

        temp_file = os.path.join(temp_dir, "temp.idf")
        
        idf_origin.save(temp_file)
        idf = IDF(temp_file)

        #constructionSet1 = "idf_constructions"
        # Config IDF
        config_idf = ConfigIDF(
            idd_file,
            Path(temp_file),
            Path(temp_file),
            userEmail,
            constructionSet
        )

        # Replace Construction Set
        config_idf.replace_idf_construction_set()
        
        


        # Get thermal zones
        thermal_zones = []
        for zone in idf.idfobjects['ZONEHVAC:EQUIPMENTCONNECTIONS']:
            thermal_zones.append(zone.Zone_Name)
        space_num = len(thermal_zones)

        # Create occupants
        occupants = Participant(space_num, path_profile, [30, 40, 30], "s1_100",
                                path_trajectories, "prior_knowledge")
        occupants.clean()

        # Initialize result collector with MongoDB storage
        result = Result(occupants, city, simulation_id)

        # Configure simulation parameters
        input_param = {}
        output_param = {}
        for index, zone in enumerate(thermal_zones):
            input_param['sch_clg_'+str(index+1)] = ["Zone Temperature Control", "Cooling Setpoint", zone, 50]
            input_param['sch_htg_'+str(index+1)] = ["Zone Temperature Control", "Heating Setpoint", zone, 0]
            output_param['temp'+str(index+1)] = ["Zone Air Temperature", zone]

        # Add energy consumption parameters
        for index, zone in enumerate(thermal_zones):
            output_param["ec_clg_tz" + str(index + 1)] = ["Zone Air System Sensible Cooling Energy", zone]
            output_param["ec_htg_tz" + str(index + 1)] = ["Zone Air System Sensible Heating Energy", zone]
        
        output_param.update({
            'ec_clg_coil': ["Cooling Coil Electricity Energy", "COIL COOLING DX TWO SPEED 1"],
            'ec_htg_coil': ["Heating Coil Electricity Energy", "1 SPD DX HTG COIL"],
            'temp_out': ["Site Outdoor Air Drybulb Temperature", "Environment"]
        })

        idf_fans = idf.idfobjects["Fan:OnOff"]
        for fan in idf_fans:
            output_param["ec_fan_" + fan.Name] = ["Fan Electricity Energy", fan.Name]

        # Set simulation dates
        start_date = datetime.strptime("2010-01-01", "%Y-%m-%d")
        end_date = datetime.strptime("2010-01-24", "%Y-%m-%d")  # Shorter period for testing

        # Run simulation
        hvac_control_strategy = hvac_controller[0]
        turn_off_when_empty = True

        co_sim = CoSimulation(
            temp_file,
            start_date, 
            end_date, 
            input_param, 
            output_param, 
            occupants.vote,
            SensationAggregator(algorithm, occupants), 
            generate_set_point, 
            result,
            occupants.update_loss, 
            epw_file_path, 
            turn_off_when_empty, 
            weather_file_mapping[city]+".epw", 
            hvac_control_strategy
        )
        
        co_sim.run()
        
        # Simulation completed
        simulations_collection.update_one(
            {"_id": ObjectId(simulation_id)},
            {"$set": {
                "status": SimulationStatus.COMPLETED,
                "progress": 100.0,
                "end_time": datetime.now()
            }}
        )

    except Exception as e:
        # Update status to error if simulation fails
        simulations_collection.update_one(
            {"_id": ObjectId(simulation_id)},
            {"$set": {
                "status": SimulationStatus.ERROR,
                "error_message": str(e)
            }}
        )
        print(f"Error in simulation: {str(e)}")


@app.route('/start-simulation', methods=['POST'])
def start_simulation():
    """Start a simulation and return the simulation ID."""
    # Extract form data
    building = request.form.get('building', 'default')
    constructionSet = request.form.get('constructionSet', 'default')
    userEmail = request.form.get('userEmail', None)
    environment = request.form.get('environment', 'paris')
    hvac_system = request.form.get('hvacSystem', 'preference_estimation')
    scenario_id = request.form.get('scenarioId', 'default_scenario')
    
    # Print request parameters
    print(f"LOG: start-simulation called with parameters: building={building}, constructionSet={constructionSet} environment={environment}, hvacSystem={hvac_system}, scenarioId={scenario_id}")
    
    # Map input parameters to Co-zyBench parameters
    algorithm = "majority"  # Default algorithm
    city = "paris"  # Default city
    
    # Map environment to city if possible
    if environment in ["paris", "mumbai", "la", "scranton"]:
        city = environment
    
    # Handle the uploaded Python file if present
    if 'pythonFile' in request.files:
        python_file = request.files['pythonFile']
        filename = secure_filename(python_file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        python_file.save(file_path)

        try:
            result = subprocess.run(
                ['python', file_path],
                capture_output=True,
                text=True,
                check=True
            )
            # If the script successfully ran, it might modify parameters
            output = result.stdout
        except subprocess.CalledProcessError as e:
            return jsonify({"error": "Failed to execute Python script", "details": e.stderr}), 500
    else:
        output = "No Python file uploaded. Using default parameters."

    simulation_data = {
        "scenario_id": scenario_id,
        "status": SimulationStatus.PENDING,
        "start_time": datetime.now(),
        "end_time": None,
        "estimated_completion_time": datetime.now() + timedelta(minutes=10),
        "progress": 0.0,
        "results": [],  # Will be populated by the simulation
        "building": building,
        "environment": environment,
        "hvac_system": hvac_system,
        "algorithm": algorithm,
        "city": city
    }

    # Insert into MongoDB and get the generated ID
    result = simulations_collection.insert_one(simulation_data)
    simulation_id = str(result.inserted_id)

    # Start simulation in a separate thread
    simulation_thread = Thread(target=run_cozybench_simulation, args=(simulation_id, userEmail, constructionSet, algorithm, city))
    simulation_thread.daemon = True
    simulation_thread.start()

    return jsonify({
        "simulation_id": simulation_id,
        "status": simulation_data["status"],
        "estimated_completion_time": simulation_data["estimated_completion_time"].isoformat(),
        "output of the python script": output
    }), 201


@app.route('/real-time-data/<simulation_id>', methods=['GET'])
def real_time_data(simulation_id):
    """Stream real-time data blocks during the simulation."""
    print(f"LOG: real-time-data called with simulation_id: {simulation_id}")

    def generate():
        # Check if simulation exists
        simulation_data = simulations_collection.find_one({"_id": ObjectId(simulation_id)})
        
        if not simulation_data:
            yield f"data: {json.dumps({'error': 'Simulation not found'})}\n\n"
            return

        # Initial status report
        yield f"data: {json.dumps({'status': simulation_data['status'], 'progress': simulation_data['progress']})}\n\n"
        
        # Continue polling for updates until simulation is complete
        last_result_count = 0
        while True:
            simulation_data = simulations_collection.find_one({"_id": ObjectId(simulation_id)})
            
            if not simulation_data:
                yield f"data: {json.dumps({'error': 'Simulation data lost'})}\n\n"
                break
                
            # Check if new results are available
            current_results = simulation_data.get('results', [])
            if len(current_results) > last_result_count:
                # Send new results, which are already in the correct format {date: {...}}
                for i in range(last_result_count, len(current_results)):
                    yield f"data: {json.dumps(current_results[i])}\n\n"
                last_result_count = len(current_results)
            
            # Check if simulation has ended
            if simulation_data['status'] in [SimulationStatus.COMPLETED, SimulationStatus.ERROR]:
                yield f"data: {json.dumps({'status': simulation_data['status'], 'progress': simulation_data['progress']})}\n\n"
                break
                
            # Send updated status
            yield f"data: {json.dumps({'status': simulation_data['status'], 'progress': simulation_data['progress']})}\n\n"
            
            time.sleep(2)  # Poll for updates every 2 seconds

    return Response(generate(), content_type='text/event-stream')


@app.route('/simulation-status/<simulation_id>', methods=['GET'])
def simulation_status(simulation_id):
    print(f"LOG: simulation-status called with simulation_id: {simulation_id}")
    simulation = simulations_collection.find_one({"_id": ObjectId(simulation_id)})
    if not simulation:
        return jsonify({"error": "Simulation not found"}), 404

    return jsonify({
        "status": simulation["status"],
        "progress": simulation["progress"]
    })


@app.route('/simulation-results/<simulation_id>', methods=['GET'])
def simulation_results(simulation_id):
    print(f"LOG: simulation-results called with simulation_id: {simulation_id}")
    simulation = simulations_collection.find_one({"_id": ObjectId(simulation_id)})
    if not simulation:
        return jsonify({"error": "Simulation not found"}), 404

    if simulation["status"] != SimulationStatus.COMPLETED:
        return jsonify({
            "simulation_id": simulation_id,
            "status": simulation["status"],
            "progress": simulation["progress"],
            "message": "Simulation is still in progress. Results are not yet available."
        }), 200

    # Return results directly, which are already in the correct format {date: {...}}
    return jsonify(simulation.get("results", []))

class ResponseComponentDescriptorDTO:
    def __init__(self, id, type, name):
        self.id = id
        self.type = type
        self.name = name

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name
        }


def generate_plant(plant_id):
    try:
        # Update simulation status
        plants_collection.update_one(
            {"_id": ObjectId(plant_id)},
            {"$set": {
                "status": "RUNNING"
            }}
        )

        json_file_name = "tartu_aug21_co2_absorption.json"
        run_co2_sweep(400, 2500, 100, Path(json_file_name), 24)
    
        plant_json_path = os.path.join(get_result_dir(), json_file_name)

        with open(plant_json_path, "r", encoding="utf-8") as f:
            plant_json = json.load(f)

        plants_collection.update_one(
            {"_id": ObjectId(plant_id)},
            {
                "$set": {
                    "status": "COMPLETED",
                    "end_time": datetime.now(),
                    "plant": plant_json
                }
            }
        )

    except Exception as e:
        # Update status to error if simulation fails
        plants_collection.update_one(
            {"_id": ObjectId(plant_id)},
            {"$set": {
                "status": "ERROR",
                "error_message": str(e)
            }}
        )
        print(f"Error in plant creation: {str(e)}")

def generate_3d_plant(plant_id):

    try:
        workdir = getWorkdir()

        plant_path = os.path.join(workdir, "plant.P")
        spathiphyllum_path = os.path.join(workdir, "spathiphyllum.l")

        # Folder where OBJ/MTL will be created
        obj_dir = os.path.join(workdir, "create_obj")
        os.makedirs(obj_dir, exist_ok=True)

        obj_path = os.path.join(obj_dir, "plant_model.obj")
        mtl_path = os.path.join(obj_dir, "plant_model.mtl")

        # Create OBJ and MTL
        convert(plant_path, spathiphyllum_path, obj_path)

        # OBJ is text, not JSON
        with open(obj_path, "r", encoding="utf-8") as f:
            obj_text = f.read()

        # MTL is text, not JSON
        with open(mtl_path, "r", encoding="utf-8") as f:
            mtl_text = f.read()

        save_obj_to_gridfs(plant_id, "obj", obj_text)
        save_obj_to_gridfs(plant_id, "mtl", mtl_text)

        '''
        plants_collection.update_one(
            {"_id": ObjectId(plant_id)},
            {
                "$set": {
                    "obj": obj_text,
                    "mtl": mtl_text,
                }
            }
        )
        '''

    except Exception as e:
        # Update status to error if simulation fails
        plants_collection.update_one(
            {"_id": ObjectId(plant_id)},
            {"$set": {
                "objPath": "ERROR",
                "error_message": str(e)
            }}
        )
        print(f"Error in plant creation: {str(e)}")




plant_creation_threads = {}
@app.route('/createPlant', methods=['POST'])
def createPlant():

    #userEmail = "jdfjjjd@gmail.com"

    #print(get_component_form_temp(userEmail, plantId))

    #out = run_co2_sweep(400, 2500, 100, Path("tartu_aug21_co2_absorption.json"), 24)

    #print(out)

    #response = ResponseComponentDescriptorDTO("test", "test", "test")
    user_email = request.form.get("userEmail")
    plant_name = request.form.get("plantName")
    plant_file = request.files.get("plant")
    spathiphyllum_file = request.files.get("spathiphyllum")

    if plant_file is None:
        return jsonify({"error": "plantFile is missing"}), 400

    if spathiphyllum_file is None:
        return jsonify({"error": "spathiphyllumFile is missing"}), 400

    # save files
    workdir = getWorkdir()
    os.makedirs(workdir, exist_ok=True)

    plant_path = os.path.join(workdir, "plant.P")
    spathiphyllum_path = os.path.join(workdir, "spathiphyllum.l")

    plant_file.save(plant_path)
    spathiphyllum_file.save(spathiphyllum_path)

    #run_co2_sweep(400, 2500, 100, Path("tartu_aug21_co2_absorption.json"), 24)

    

    
   
    plant_data = {
        "userEmail": user_email,
        "name": plant_name,
        "status": "PENDING",
        "start_time": datetime.now(),
        "end_time": None,
        "obj": None,
        "mtl": None,
        "plant": None,
    }
    

    # Insert into MongoDB and get the generated ID
    result = plants_collection.insert_one(plant_data)
    plant_id = str(result.inserted_id)


    # Start simulation in a separate thread
    plant_creation_threads[plant_id] = Thread(target=generate_plant, args=(plant_id,))
    plant_creation_threads[plant_id].daemon = True
    plant_creation_threads[plant_id].start()

    # Start simulation in a separate thread
    plant_creation_threads["model" + plant_id] = Thread(target=generate_3d_plant, args=(plant_id,))
    plant_creation_threads["model" + plant_id].daemon = True
    plant_creation_threads["model" + plant_id].start()
    

    return jsonify({
        "id": plant_id,
    }), 201

    #return jsonify(response.to_dict()), 201



fs = gridfs.GridFS(db)

def save_obj_to_gridfs(_id: str, field_name:str, obj_text: str):
    file_id = fs.put(
        obj_text.encode("utf-8"),
        filename=f"{_id}.obj",
        contentType="text/plain"
    )

    plants_collection.update_one(
        {"_id": ObjectId(_id)},
        {
            "$set": {
                field_name: file_id
            }
        }
    )

def read_obj_from_gridfs(obj_file_id):
    file = fs.get(ObjectId(obj_file_id))
    return file.read().decode("utf-8")


@app.route('/real_time_create_plant/<plant_id>', methods=['GET'])
def real_time_create_plant(plant_id):
    """Stream real-time data blocks during the plant creation."""
    print(f"LOG: real-time-data called with plant_id: {plant_id}")

    def generate():
        # Check if simulation exists
        plant_data = plants_collection.find_one({"_id": ObjectId(plant_id)})
        
        if not plant_data:
            yield f"data: {json.dumps({'error': 'Plant not found'})}\n\n"
            return

        # Initial status report
        yield f"data: {json.dumps({'status': plant_data['status'], 'progress': get_percentage()})}\n\n"

        thread = plant_creation_threads.get(plant_id)

        if thread is None:
            plants_collection.update_one(
                {"_id": ObjectId(plant_id)},
                {
                    "$set": {
                        "status": "ERROR",
                        "message": "Plant creation thread was not found",
                        "end_time": datetime.now()
                    }
                }
            )

        elif not thread.is_alive():
            plants_collection.update_one(
                {"_id": ObjectId(plant_id)},
                {
                    "$set": {
                        "status": "ERROR",
                        "message": "Plant creation thread stopped",
                        "end_time": datetime.now()
                    }
                }
            )
        
        # Continue polling for updates until simulation is complete
        last_result_count = 0
        while True:
            plant_data = plants_collection.find_one({"_id": ObjectId(plant_id)})

            
            
            if not plant_data:
                yield f"data: {json.dumps({'error': 'Plant data lost'})}\n\n"
                break
                
            # Check if new results are available
            current_results = plant_data.get('results', [])
            if len(current_results) > last_result_count:
                # Send new results, which are already in the correct format {date: {...}}
                for i in range(last_result_count, len(current_results)):
                    yield f"data: {json.dumps(current_results[i])}\n\n"
                last_result_count = len(current_results)
            
            # Check if simulation has ended
            if plant_data['status'] in [SimulationStatus.COMPLETED, SimulationStatus.ERROR]:
                yield f"data: {json.dumps({'status': plant_data['status'], 'progress': get_percentage()})}\n\n"
                break
                
            # Send updated status
            yield f"data: {json.dumps({'status': plant_data['status'], 'progress': get_percentage()})}\n\n"
            
            time.sleep(2)  # Poll for updates every 2 seconds

    return Response(generate(), content_type='text/event-stream')

@app.route("/plant_obj/<plant_id>", methods=["GET"])
def get_plant_obj(plant_id):
    plant = plants_collection.find_one({"_id": ObjectId(plant_id)})

    if not plant or "obj" not in plant:
        return jsonify({"error": "OBJ not found"}), 404

    return Response(
        read_obj_from_gridfs(plant["obj"]),
        mimetype="text/plain"
    )


@app.route("/plant_mtl/<plant_id>", methods=["GET"])
def get_plant_mtl(plant_id):
    plant = plants_collection.find_one({"_id": ObjectId(plant_id)})

    if not plant or "mtl" not in plant:
        return jsonify({"error": "MTL not found"}), 404

    return Response(
        read_obj_from_gridfs(plant["mtl"]),
        mimetype="text/plain"
    )










if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
