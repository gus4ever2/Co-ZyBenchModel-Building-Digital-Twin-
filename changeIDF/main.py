from pathlib import Path
from eppy.modeleditor import IDF

from config_idf.ConfigIDF import ConfigIDF

idd_file_path = Path(r"C:/Users/spili/Desktop/EnergyPlusV22-2-0/Energy+.idd")
idf_file_path = Path(r"C:/Users/spili/Desktop/changeIDF/in.idf")

constructionSet = "189_1_2009_CZ1_Office"
temp_file="temp_file.txt"

# Config IDF
config_idf = ConfigIDF(
    idd_file_path,
    Path(idf_file_path),
    Path(temp_file),
    constructionSet
)

# Replace Construction Set
config_idf.replace_idf_construction_set()