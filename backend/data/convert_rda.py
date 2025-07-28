import os
import pyreadr
import pandas as pd

# List all .rda files in the current directory
rda_files = [f for f in os.listdir(".") if f.endswith(".rda")]

# Loop through the list of .rda files, load each, and convert to CSV
for file in rda_files:
    # Load the .rda file
    result = pyreadr.read_r(file)

    # Convert each object in the .rda file to a CSV file
    for key, value in result.items():
        # Create a CSV file name based on the .rda file name and the key
        csv_file_name = f"{os.path.splitext(file)[0]}_{key}.csv"

        # Save the DataFrame to a CSV file
        value.to_csv(csv_file_name, index=False)

# Indicate completion
print("Conversion completed for all .rda files in the current directory.")
