from pathlib import Path
from eppy.modeleditor import IDF

idd_file_path = Path(r"C:/Users/spili/Desktop/EnergyPlusV22-2-0/Energy+.idd")
idf_file_path = Path(r"C:/Users/spili/Desktop/Web-cozybench/read_IDF/in.idf")

def get_idf_objects():
    if not idd_file_path.exists():
        raise FileNotFoundError(f"IDD file not found: {idd_file_path}")

    if not idf_file_path.exists():
        raise FileNotFoundError(f"IDF file not found: {idf_file_path}")

    IDF.setiddname(str(idd_file_path))
    idf_file = IDF(idf_file_path)

    return idf_file.idfobjects