import subprocess

def run_r_script(r_script_path):
    try:
        result = subprocess.run(
            [r"C:\Program Files\R\R-4.3.0\bin\Rscript.exe", r_script_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        print("=== R script output ===")
        print(result.stdout)
        
        if result.stderr:
            # print("errors/")
            print(result.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"Error running R script: {e}")
        # print("errors/")
        print(e.stderr)

if __name__ == "__main__":
    run_r_script("./test.R")
