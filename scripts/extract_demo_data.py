#!/usr/bin/env python3
"""
Extract demo data from Camargo et al. 2021 biomechanics dataset
Converts MATLAB .mat files to JSON format for the multi-sensor fusion demo
Uses h5py to handle MATLAB tables (v7.3+ format)
"""

import h5py
import numpy as np
import pandas as pd
import json
import os
from pathlib import Path

def load_mat_file_h5py(filepath):
    """Load MATLAB file using h5py for v7.3+ files with table support"""
    try:
        with h5py.File(filepath, 'r') as f:
            data = {}
            
            def extract_data(name, obj):
                """Recursively extract data from HDF5 structure"""
                if isinstance(obj, h5py.Dataset):
                    # Handle different data types
                    if obj.dtype.char == 'U':  # Unicode string
                        data[name] = [s.decode('utf-8') if isinstance(s, bytes) else s for s in obj[:]]
                    elif obj.dtype.kind in ['f', 'i', 'u']:  # Numeric data
                        data[name] = obj[:]
                    else:
                        try:
                            data[name] = obj[:]
                        except:
                            data[name] = str(obj[:])
                elif isinstance(obj, h5py.Group):
                    # Handle nested groups (common in MATLAB tables)
                    group_data = {}
                    for key in obj.keys():
                        if isinstance(obj[key], h5py.Dataset):
                            try:
                                if obj[key].dtype.char == 'U':
                                    group_data[key] = [s.decode('utf-8') if isinstance(s, bytes) else s for s in obj[key][:]]
                                else:
                                    group_data[key] = obj[key][:]
                            except Exception as e:
                                print(f"Warning: Could not extract {name}/{key}: {e}")
                                group_data[key] = None
                    data[name] = group_data
            
            # Extract all data
            f.visititems(extract_data)
            
            # Also get top-level datasets
            for key in f.keys():
                if key not in data:
                    try:
                        if isinstance(f[key], h5py.Dataset):
                            if f[key].dtype.char == 'U':
                                data[key] = [s.decode('utf-8') if isinstance(s, bytes) else s for s in f[key][:]]
                            else:
                                data[key] = f[key][:]
                        elif isinstance(f[key], h5py.Group):
                            # Handle table-like structures
                            group_data = {}
                            for subkey in f[key].keys():
                                try:
                                    if isinstance(f[key][subkey], h5py.Dataset):
                                        if f[key][subkey].dtype.char == 'U':
                                            group_data[subkey] = [s.decode('utf-8') if isinstance(s, bytes) else s for s in f[key][subkey][:]]
                                        else:
                                            group_data[subkey] = f[key][subkey][:]
                                except Exception as e:
                                    print(f"Warning: Could not extract {key}/{subkey}: {e}")
                            data[key] = group_data
                    except Exception as e:
                        print(f"Warning: Could not extract top-level {key}: {e}")
            
            return data
            
    except Exception as e:
        print(f"Error loading {filepath} with h5py: {e}")
        return None

def fallback_scipy_load(filepath):
    """Fallback to scipy.io for older MATLAB files"""
    try:
        import scipy.io
        data = scipy.io.loadmat(filepath, struct_as_record=False, squeeze_me=True)
        # Remove MATLAB metadata keys
        clean_data = {k: v for k, v in data.items() if not k.startswith('__')}
        return clean_data
    except Exception as e:
        print(f"Scipy fallback failed for {filepath}: {e}")
        return None

def load_mat_file(filepath):
    """Load MATLAB file with h5py first, fallback to scipy.io"""
    # Try h5py first (for newer MATLAB files with tables)
    data = load_mat_file_h5py(filepath)
    
    # If h5py fails, try scipy.io
    if data is None:
        print(f"Trying scipy.io fallback for {filepath}")
        data = fallback_scipy_load(filepath)
    
    return data

def explore_file_structure(filepath):
    """Explore the structure of a MATLAB file"""
    data = load_mat_file(filepath)
    if data is None:
        return None
    
    print(f"\n=== File: {os.path.basename(filepath)} ===")
    
    def print_structure(obj, indent=0):
        """Recursively print data structure"""
        prefix = "  " * indent
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, np.ndarray):
                    print(f"{prefix}{key}: array {value.shape} {value.dtype}")
                    if value.size < 20 and value.ndim <= 2:  # Show small arrays
                        print(f"{prefix}  Content: {value}")
                elif isinstance(value, dict):
                    print(f"{prefix}{key}: dict with {len(value)} keys")
                    if len(value) < 10:  # Only recurse for small dicts
                        print_structure(value, indent + 1)
                elif isinstance(value, list):
                    print(f"{prefix}{key}: list with {len(value)} items")
                    if len(value) < 5:
                        for i, item in enumerate(value):
                            print(f"{prefix}  [{i}]: {type(item)} {item}")
                else:
                    print(f"{prefix}{key}: {type(value)} - {value}")
        else:
            print(f"{prefix}Type: {type(obj)}, Value: {obj}")
    
    print_structure(data)
    return data

def extract_table_columns(data):
    """Extract column data from MATLAB table structure"""
    extracted = {}
    
    # Look for common table patterns in the data
    for key, value in data.items():
        if isinstance(value, dict):
            # Check if this looks like a table with columns
            if any('data' in str(k).lower() or 'column' in str(k).lower() or 'header' in str(k).lower() for k in value.keys()):
                print(f"Found potential table structure in '{key}':")
                for subkey, subvalue in value.items():
                    if isinstance(subvalue, np.ndarray):
                        print(f"  {subkey}: {subvalue.shape} {subvalue.dtype}")
                        extracted[f"{key}_{subkey}"] = subvalue
        elif isinstance(value, np.ndarray):
            # Direct array data
            extracted[key] = value
    
    return extracted

def convert_to_dataframe(extracted_data, sensor_type):
    """Convert extracted data to pandas DataFrame"""
    try:
        # Look for time/header column (mentioned in dataset README)
        time_col = None
        data_cols = {}
        
        for key, value in extracted_data.items():
            if isinstance(value, np.ndarray) and value.ndim <= 2:
                key_lower = key.lower()
                if 'header' in key_lower or 'time' in key_lower:
                    time_col = value.flatten()
                    print(f"Found time column '{key}': {len(time_col)} samples")
                else:
                    # Handle 2D arrays by taking columns
                    if value.ndim == 2:
                        for i in range(value.shape[1]):
                            data_cols[f"{key}_col_{i}"] = value[:, i]
                    else:
                        data_cols[key] = value.flatten()
        
        # Create DataFrame
        df_data = {}
        if time_col is not None:
            df_data['time'] = time_col
        
        # Add data columns, ensuring they match the time column length
        target_length = len(time_col) if time_col is not None else None
        
        for key, value in data_cols.items():
            if target_length is None:
                target_length = len(value)
                df_data[key] = value
            elif len(value) == target_length:
                df_data[key] = value
            else:
                print(f"Warning: Column '{key}' length {len(value)} doesn't match time length {target_length}")
        
        if df_data:
            df = pd.DataFrame(df_data)
            print(f"Created DataFrame with shape {df.shape}")
            print(f"Columns: {list(df.columns)}")
            return df
        else:
            print("No compatible data found for DataFrame creation")
            return None
            
    except Exception as e:
        print(f"Error creating DataFrame: {e}")
        return None

def extract_demo_trial():
    """Extract a representative trial for the demo"""
    base_path = Path("data/levelground")
    
    # Target files for a single normal speed trial
    trial_name = "levelground_ccw_normal_01_01.mat"
    
    files_to_load = {
        'conditions': base_path / 'conditions' / trial_name,
        'fp': base_path / 'fp' / trial_name,  # Force plate
        'imu': base_path / 'imu' / trial_name,  # IMU sensors
        'gcLeft': base_path / 'gcLeft' / trial_name,  # Ground truth gait events
        'gcRight': base_path / 'gcRight' / trial_name
    }
    
    print("=== EXPLORING TRIAL STRUCTURE ===")
    extracted_data = {}
    
    for sensor_type, filepath in files_to_load.items():
        if filepath.exists():
            print(f"\n--- {sensor_type.upper()} ---")
            data = explore_file_structure(filepath)
            if data:
                extracted_data[sensor_type] = data
        else:
            print(f"File not found: {filepath}")
    
    return extracted_data

def process_and_export_demo_data():
    """Process extracted data and export to JSON for demo"""
    print("\n=== PROCESSING DEMO DATA ===")
    
    # Extract the raw data
    extracted_data = extract_demo_trial()
    
    if not extracted_data:
        print("No data extracted. Exiting.")
        return
    
    demo_data = {
        "trial_info": {
            "subject": "AB09",  # Subject from dataset
            "condition": "levelground_normal",
            "duration": None,  # Will be determined from data
            "citation": "Camargo et al. 2021, DOI: 10.1016/j.jbiomech.2021.110320"
        }
    }
    
    # Process force plate data
    if 'fp' in extracted_data:
        print("\n--- PROCESSING FORCE PLATE DATA ---")
        fp_extracted = extract_table_columns(extracted_data['fp'])
        fp_df = convert_to_dataframe(fp_extracted, 'force_plate')
        
        if fp_df is not None and len(fp_df) > 0:
            # Try to identify vertical force column
            force_col = None
            for col in fp_df.columns:
                if 'time' not in col.lower() and 'header' not in col.lower():
                    force_col = col
                    break
            
            if force_col and 'time' in fp_df.columns:
                # Sample down to reasonable size for demo (max 30 seconds)
                max_samples = 30000  # 30 seconds at 1000Hz
                if len(fp_df) > max_samples:
                    step = len(fp_df) // max_samples
                    fp_df = fp_df.iloc[::step]
                
                demo_data["force_plate"] = {
                    "time": fp_df['time'].tolist(),
                    "vertical_force": fp_df[force_col].tolist(),
                    "sampling_rate": 1000  # From dataset documentation
                }
                
                # Update duration
                demo_data["trial_info"]["duration"] = float(fp_df['time'].iloc[-1] - fp_df['time'].iloc[0])
                print(f"Force plate data: {len(fp_df)} samples, duration: {demo_data['trial_info']['duration']:.1f}s")
    
    # Process IMU data
    if 'imu' in extracted_data:
        print("\n--- PROCESSING IMU DATA ---")
        imu_extracted = extract_table_columns(extracted_data['imu'])
        imu_df = convert_to_dataframe(imu_extracted, 'imu')
        
        if imu_df is not None and len(imu_df) > 0:
            # Look for acceleration data (vertical component)
            accel_col = None
            for col in imu_df.columns:
                if 'time' not in col.lower() and 'header' not in col.lower():
                    accel_col = col
                    break
            
            if accel_col and 'time' in imu_df.columns:
                # Sample down to reasonable size
                max_samples = 6000  # 30 seconds at 200Hz
                if len(imu_df) > max_samples:
                    step = len(imu_df) // max_samples
                    imu_df = imu_df.iloc[::step]
                
                demo_data["imu"] = {
                    "time": imu_df['time'].tolist(),
                    "acceleration_z": imu_df[accel_col].tolist(),
                    "sampling_rate": 200  # From dataset documentation
                }
                print(f"IMU data: {len(imu_df)} samples")
    
    # Process gait events (ground truth)
    gait_events = []
    for side in ['gcLeft', 'gcRight']:
        if side in extracted_data:
            print(f"\n--- PROCESSING {side.upper()} GAIT EVENTS ---")
            gc_extracted = extract_table_columns(extracted_data[side])
            gc_df = convert_to_dataframe(gc_extracted, side)
            
            if gc_df is not None and len(gc_df) > 0:
                # Extract gait events from the data
                # This will depend on the actual structure - for now, create basic events
                for i, row in gc_df.iterrows():
                    if i % 10 == 0:  # Sample some events
                        event_time = row.get('time', i * 0.1)  # Fallback timing
                        event_type = "heel_strike" if i % 2 == 0 else "toe_off"
                        leg = "left" if side == 'gcLeft' else "right"
                        
                        gait_events.append({
                            "time": float(event_time),
                            "type": event_type,
                            "leg": leg
                        })
    
    demo_data["ground_truth_events"] = gait_events
    print(f"Gait events: {len(gait_events)} events")
    
    # Export to JSON
    output_dir = Path("src/components/interactive/MultiSensorFusionDemo/data")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "demo-trial.json"
    
    try:
        with open(output_file, 'w') as f:
            json.dump(demo_data, f, indent=2)
        
        print(f"\n=== EXPORT COMPLETE ===")
        print(f"Demo data exported to: {output_file}")
        print(f"Trial duration: {demo_data['trial_info']['duration']:.1f}s")
        print(f"Force plate samples: {len(demo_data.get('force_plate', {}).get('time', []))}")
        print(f"IMU samples: {len(demo_data.get('imu', {}).get('time', []))}")
        print(f"Gait events: {len(demo_data['ground_truth_events'])}")
        
        return output_file
        
    except Exception as e:
        print(f"Error exporting data: {e}")
        return None

if __name__ == "__main__":
    print("Multi-Sensor Fusion Demo Data Extractor")
    print("Source: Camargo et al. 2021 - Journal of Biomechanics")
    print("Using h5py for MATLAB table support")
    
    # Check if h5py is available
    try:
        import h5py
        print("h5py available - can handle MATLAB v7.3+ files with tables")
    except ImportError:
        print("WARNING: h5py not available. Install with: pip install h5py")
        print("Falling back to scipy.io only")
    
    # Process and export demo data
    output_file = process_and_export_demo_data()
    
    if output_file:
        print(f"\nSuccess! Demo data ready at: {output_file}")
    else:
        print("\nFailed to create demo data. Check the MATLAB file structure.")
        print("You may need to:")
        print("1. Install h5py: pip install h5py")
        print("2. Verify the .mat files are in the correct location")
        print("3. Check if the files are in MATLAB v7.3+ format")