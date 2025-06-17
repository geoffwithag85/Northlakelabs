#!/bin/bash

# run_octave_conversion.sh
# Run the MATLAB to CSV conversion using GNU Octave

echo "Multi-Sensor Fusion Demo - Data Conversion Script"
echo "================================================="

# Check if Octave is installed
if ! command -v octave &> /dev/null; then
    echo "ERROR: GNU Octave is not installed."
    echo ""
    echo "Please install Octave:"
    echo "  Ubuntu/Debian: sudo apt-get install octave"
    echo "  macOS:         brew install octave"
    echo "  Windows:       Download from https://octave.org/download"
    echo ""
    exit 1
fi

echo "GNU Octave found: $(octave --version | head -n1)"
echo ""

# Change to scripts directory
cd "$(dirname "$0")"

# Run the Octave conversion script
echo "Running MATLAB to CSV conversion..."
octave --no-gui --quiet convert_mat_to_csv.m

# Check if conversion was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Conversion completed successfully!"
    echo ""
    echo "CSV files should now be available in:"
    echo "  src/components/interactive/MultiSensorFusionDemo/data/"
    echo ""
    echo "You can now run the Python demo data processor:"
    echo "  python scripts/process_csv_data.py"
else
    echo ""
    echo "❌ Conversion failed. Check the error messages above."
    echo ""
    echo "Common issues:"
    echo "  - MATLAB files not found in data/levelground/"
    echo "  - Octave cannot read the specific MATLAB file format"
    echo "  - Permission issues creating output directories"
fi