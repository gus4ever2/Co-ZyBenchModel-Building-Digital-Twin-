
import json

fileName = "construction_set_json/189_1_2009_CZ1_Office.json"

def get_construction_set_dict(json_file_path):

    try:
        with open(json_file_path, 'r') as file:
            data = json.load(file)

        return data

    except FileNotFoundError:
        print("Error: The file 'data.json' was not found.")
    except json.JSONDecodeError:
        print("Error: Failed to decode JSON from the file.")

