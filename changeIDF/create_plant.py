from dataclasses import dataclass
from pathlib import Path
from changeIDF.database.ConstructionSetDAO import ConstructionSetDAO
from changeIDF.config_idf.change_idf_construction_set import change_idf_construction_set
from eppy.modeleditor import IDF

def get_component_form_temp(userEmail:str, id:str):
    
    return ConstructionSetDAO().select_with_id(userEmail, id)
    idf_file_new = change_idf_construction_set(self.get_idf_file(), constructionSetDTO.__dict__)
