from dataclasses import dataclass
from pathlib import Path
from changeIDF.database.ConstructionSetDAO import ConstructionSetDAO
from changeIDF.config_idf.change_idf_construction_set import change_idf_construction_set
from eppy.modeleditor import IDF

@dataclass
class ConfigIDF:
    idd_file_path: Path
    idf_file_path: Path
    idf_temp_file_path: Path
    userEmail:str
    constructionSet:str

    def get_idf_file(self):
        if not self.idd_file_path.exists():
            raise FileNotFoundError(f"IDD file not found: {idd_file_path}")

        if not self.idf_file_path.exists():
            raise FileNotFoundError(f"IDF file not found: {idf_file_path}")

        IDF.setiddname(self.idd_file_path)

        return IDF(self.idf_file_path)

    def replace_idf_construction_set(self):
        constructionSetDTO = ConstructionSetDAO().select_construction_set(self.userEmail, self.constructionSet)
        idf_file_new = change_idf_construction_set(self.get_idf_file(), constructionSetDTO.__dict__)

        #print("Inside replace_idf_construction_set")
        #print(idf_file_new)

        idf_file_new.save(self.idf_temp_file_path)