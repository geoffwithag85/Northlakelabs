"""
Data loading utilities for multi-modal gait analysis data.
Handles CSV parsing for Kinetics, EMG, and Kinematics data.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Tuple, Optional
import warnings

class GaitDataLoader:
    """Load and parse multi-modal gait analysis CSV files."""
    
    def __init__(self, data_dir: str = "data"):
        """Initialize with data directory path."""
        self.data_dir = Path(data_dir)
        
    def load_kinetics(self, trial_id: str) -> pd.DataFrame:
        """
        Load kinetics (force plate) data for specified trial.
        
        Args:
            trial_id: Trial identifier (e.g., "T5")
            
        Returns:
            DataFrame with columns: Frame, Sub Frame, force plate data
        """
        filepath = self.data_dir / "kinetics" / f"Sub1_Kinetics_{trial_id}.csv"
        
        # Read CSV, skipping header rows
        df = pd.read_csv(filepath, skiprows=4)
        
        # Clean column names - remove units row artifacts
        df.columns = df.columns.str.strip()
        
        # Convert Frame to time in seconds (1000 Hz sampling)
        df['time'] = df['Frame'] / 1000.0
        
        return df
    
    def load_emg(self, trial_id: str) -> pd.DataFrame:
        """
        Load EMG data for specified trial.
        
        Args:
            trial_id: Trial identifier (e.g., "T5")
            
        Returns:
            DataFrame with EMG channels
        """
        filepath = self.data_dir / "emg" / f"Sub1_EMG_{trial_id}.csv"
        
        # Read CSV, skipping header rows
        df = pd.read_csv(filepath, skiprows=4)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Convert Frame to time in seconds (2000 Hz sampling)
        df['time'] = df['Frame'] / 2000.0
        
        return df
    
    def load_kinematics(self, trial_id: str) -> pd.DataFrame:
        """
        Load kinematics (motion capture) data for specified trial.
        
        Args:
            trial_id: Trial identifier (e.g., "T5")
            
        Returns:
            DataFrame with marker positions
        """
        filepath = self.data_dir / "kinematics" / f"Sub1_Kinematics_{trial_id}.csv"
        
        # Read CSV, skipping header rows
        df = pd.read_csv(filepath, skiprows=4)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Convert Frame to time in seconds (100 Hz sampling)
        df['time'] = df['Frame'] / 100.0
        
        return df
    
    def load_all_modalities(self, trial_id: str) -> Dict[str, pd.DataFrame]:
        """
        Load all data modalities for a trial.
        
        Args:
            trial_id: Trial identifier (e.g., "T5")
            
        Returns:
            Dictionary with keys: 'kinetics', 'emg', 'kinematics'
        """
        return {
            'kinetics': self.load_kinetics(trial_id),
            'emg': self.load_emg(trial_id),
            'kinematics': self.load_kinematics(trial_id)
        }
    
    def get_trial_duration(self, trial_id: str) -> float:
        """Get trial duration in seconds."""
        kinetics = self.load_kinetics(trial_id)
        return kinetics['time'].max()
    
    def get_sampling_rates(self) -> Dict[str, int]:
        """Get sampling rates for each modality."""
        return {
            'kinetics': 1000,  # Hz
            'emg': 2000,       # Hz
            'kinematics': 100  # Hz
        }

def extract_key_kinematic_markers(kinematics_df: pd.DataFrame) -> Dict[str, pd.DataFrame]:
    """
    Extract key markers for gait event detection.
    
    Args:
        kinematics_df: Full kinematics DataFrame
        
    Returns:
        Dictionary with key marker data (toe, heel positions)
    """
    markers = {}
    
    # Key markers for gait events
    marker_sets = {
        'right_toe': ['S12:RTOE'],
        'right_heel': ['S12:RCAL'], 
        'left_toe': ['S12:LTOE'],
        'left_heel': ['S12:LCAL']
    }
    
    for marker_name, columns in marker_sets.items():
        marker_data = pd.DataFrame()
        marker_data['time'] = kinematics_df['time']
        
        # Extract X, Y, Z coordinates for each marker
        for col in columns:
            if f'{col}.1' in kinematics_df.columns:  # Z coordinate (vertical)
                marker_data['z'] = kinematics_df[f'{col}.1']
            elif f'{col}' in kinematics_df.columns:
                # Handle different column naming conventions
                marker_data['x'] = kinematics_df[f'{col}']
                if f'{col}.1' in kinematics_df.columns:
                    marker_data['y'] = kinematics_df[f'{col}.1']
                if f'{col}.2' in kinematics_df.columns:
                    marker_data['z'] = kinematics_df[f'{col}.2']
        
        markers[marker_name] = marker_data
    
    return markers

def extract_force_plate_signals(kinetics_df: pd.DataFrame) -> Dict[str, pd.Series]:
    """
    Extract key force plate signals for gait event detection.
    
    Args:
        kinetics_df: Kinetics DataFrame
        
    Returns:
        Dictionary with force signals for left/right plates
    """
    signals = {}
    
    # Extract vertical forces (Fz) for both plates
    # Force Plate #1 (left) and #2 (right) based on typical setup
    if 'Fz' in kinetics_df.columns:
        signals['left_fz'] = kinetics_df['Fz']
    if 'Fz.1' in kinetics_df.columns:
        signals['right_fz'] = kinetics_df['Fz.1']
    
    # Add time reference
    signals['time'] = kinetics_df['time']
    
    return signals