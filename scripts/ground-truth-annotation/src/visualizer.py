"""
Visualization utilities for multi-modal gait data annotation.
Creates interactive plots for manual gait event annotation.
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import seaborn as sns

# Set style for clean plots
plt.style.use('default')
sns.set_palette("husl")

class GaitDataVisualizer:
    """Create interactive visualizations for gait event annotation."""
    
    def __init__(self, figsize=(15, 10)):
        """Initialize visualizer with figure settings."""
        self.figsize = figsize
        self.events = []  # Store annotated events
        
    def create_annotation_plot(self, synchronized_data: Dict[str, pd.DataFrame],
                              emg_envelopes: pd.DataFrame = None,
                              time_range: Tuple[float, float] = None) -> plt.Figure:
        """
        Create multi-panel plot for gait event annotation.
        
        Args:
            synchronized_data: Dict with 'kinetics', 'emg', 'kinematics' DataFrames
            emg_envelopes: EMG envelope data (optional)
            time_range: (start_time, end_time) for display range
            
        Returns:
            matplotlib Figure object
        """
        fig, axes = plt.subplots(4, 1, figsize=self.figsize, sharex=True)
        fig.suptitle('Multi-Modal Gait Analysis - Click to Annotate Events', fontsize=16)
        
        # Extract data
        kinetics = synchronized_data['kinetics']
        kinematics = synchronized_data['kinematics']
        emg = synchronized_data.get('emg', None)
        
        # Apply time range filter if specified
        if time_range:
            start_time, end_time = time_range
            mask = (kinetics['time'] >= start_time) & (kinetics['time'] <= end_time)
            kinetics = kinetics[mask]
            kinematics = kinematics[mask]
            if emg is not None:
                emg = emg[mask]
            if emg_envelopes is not None:
                emg_envelopes = emg_envelopes[mask]
        
        # Plot 1: Force Plates
        self._plot_force_plates(axes[0], kinetics)
        
        # Plot 2: Key Kinematic Markers (Vertical positions)
        self._plot_kinematic_markers(axes[1], kinematics)
        
        # Plot 3: EMG Envelopes
        if emg_envelopes is not None:
            self._plot_emg_envelopes(axes[2], emg_envelopes)
        else:
            axes[2].text(0.5, 0.5, 'EMG data not available', 
                        transform=axes[2].transAxes, ha='center', va='center')
            axes[2].set_ylabel('EMG')
        
        # Plot 4: Combined Overview
        self._plot_overview(axes[3], kinetics, kinematics)
        
        # Configure shared x-axis
        axes[-1].set_xlabel('Time (seconds)')
        
        # Add click event handler for annotation
        self._setup_click_annotation(fig, axes)
        
        plt.tight_layout()
        return fig
    
    def _plot_force_plates(self, ax, kinetics_data):
        """Plot force plate vertical forces."""
        time = kinetics_data['time']
        
        # Plot both force plates if available
        if 'Fz' in kinetics_data.columns:
            ax.plot(time, kinetics_data['Fz'], label='Left Force Plate (Fz)', 
                   color='blue', alpha=0.7)
        
        if 'Fz.1' in kinetics_data.columns:
            ax.plot(time, kinetics_data['Fz.1'], label='Right Force Plate (Fz)', 
                   color='red', alpha=0.7)
        
        ax.set_ylabel('Vertical Force (N)')
        ax.set_title('Force Plates')
        ax.legend()
        ax.grid(True, alpha=0.3)
        
        # Add zero line
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
    
    def _plot_kinematic_markers(self, ax, kinematics_data):
        """Plot key kinematic markers for gait events."""
        time = kinematics_data['time']
        
        # Plot toe and heel markers (vertical positions)
        marker_mapping = {
            'S12:RTOE': ('Right Toe', 'red'),
            'S12:RCAL': ('Right Heel', 'darkred'),
            'S12:LTOE': ('Left Toe', 'blue'),
            'S12:LCAL': ('Left Heel', 'darkblue')
        }
        
        for marker_col, (label, color) in marker_mapping.items():
            if marker_col in kinematics_data.columns:
                ax.plot(time, kinematics_data[marker_col], 
                       label=label, color=color, alpha=0.7)
        
        ax.set_ylabel('Vertical Position (mm)')
        ax.set_title('Key Kinematic Markers')
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    def _plot_emg_envelopes(self, ax, emg_envelopes):
        """Plot EMG signal envelopes."""
        time = emg_envelopes['time']
        
        # Plot key EMG channels (first 4 envelopes)
        envelope_cols = [col for col in emg_envelopes.columns if 'envelope' in col]
        
        colors = plt.cm.tab10(np.linspace(0, 1, len(envelope_cols)))
        
        for i, col in enumerate(envelope_cols[:4]):  # Limit to 4 channels for clarity
            ax.plot(time, emg_envelopes[col], 
                   label=col.replace('_envelope', ''), 
                   color=colors[i], alpha=0.7)
        
        ax.set_ylabel('EMG Amplitude (V)')
        ax.set_title('EMG Envelopes')
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    def _plot_overview(self, ax, kinetics_data, kinematics_data):
        """Plot combined overview for context."""
        time = kinetics_data['time']
        
        # Normalize and plot force plates
        if 'Fz' in kinetics_data.columns:
            fz_norm = kinetics_data['Fz'] / kinetics_data['Fz'].abs().max()
            ax.plot(time, fz_norm, label='Left Force (norm)', 
                   color='blue', alpha=0.6, linewidth=1)
        
        if 'Fz.1' in kinetics_data.columns:
            fz_norm = kinetics_data['Fz.1'] / kinetics_data['Fz.1'].abs().max()
            ax.plot(time, fz_norm, label='Right Force (norm)', 
                   color='red', alpha=0.6, linewidth=1)
        
        ax.set_ylabel('Normalized Signals')
        ax.set_title('Overview')
        ax.legend()
        ax.grid(True, alpha=0.3)
        ax.axhline(y=0, color='black', linestyle='-', alpha=0.3)
    
    def _setup_click_annotation(self, fig, axes):
        """Setup interactive click annotation."""
        def on_click(event):
            if event.inaxes is not None and event.dblclick:
                # Get click position
                click_time = event.xdata
                
                if click_time is not None:
                    # Prompt for event type
                    event_type = self._get_event_type_input()
                    
                    if event_type:
                        # Add event marker
                        self._add_event_marker(axes, click_time, event_type)
                        
                        # Store event
                        self.events.append({
                            'time': click_time,
                            'type': event_type,
                            'timestamp': pd.Timestamp.now()
                        })
                        
                        # Refresh display
                        fig.canvas.draw()
                        
                        print(f"Added {event_type} at {click_time:.3f}s")
        
        fig.canvas.mpl_connect('button_press_event', on_click)
    
    def _get_event_type_input(self) -> Optional[str]:
        """Get event type from user input."""
        print("\\nEvent types:")
        print("1: Left Heel Strike")
        print("2: Left Toe Off") 
        print("3: Right Heel Strike")
        print("4: Right Toe Off")
        print("0: Cancel")
        
        try:
            choice = input("Select event type (1-4, 0 to cancel): ").strip()
            
            event_map = {
                '1': 'left_heel_strike',
                '2': 'left_toe_off',
                '3': 'right_heel_strike', 
                '4': 'right_toe_off'
            }
            
            return event_map.get(choice)
            
        except (EOFError, KeyboardInterrupt):
            return None
    
    def _add_event_marker(self, axes, time_point, event_type):
        """Add visual event marker to all subplots."""
        # Color mapping for event types
        colors = {
            'left_heel_strike': 'blue',
            'left_toe_off': 'lightblue',
            'right_heel_strike': 'red',
            'right_toe_off': 'lightcoral'
        }
        
        color = colors.get(event_type, 'black')
        
        # Add vertical line to each subplot
        for ax in axes:
            ax.axvline(x=time_point, color=color, linestyle='--', 
                      alpha=0.8, linewidth=2, label=event_type)
    
    def export_events(self, filepath: str = "output/ground_truth_events.json"):
        """Export annotated events to JSON file."""
        import json
        
        # Convert to serializable format
        events_data = {
            'trial_info': {
                'annotation_date': pd.Timestamp.now().isoformat(),
                'total_events': len(self.events)
            },
            'events': self.events
        }
        
        with open(filepath, 'w') as f:
            json.dump(events_data, f, indent=2, default=str)
        
        print(f"Exported {len(self.events)} events to {filepath}")
    
    def get_annotated_events(self) -> pd.DataFrame:
        """Get annotated events as DataFrame."""
        return pd.DataFrame(self.events)

def create_constrained_gait_plot(synchronized_data: Dict[str, pd.DataFrame],
                                time_window: float = 20.0) -> plt.Figure:
    """
    Create specialized plot for constrained gait analysis.
    Focuses on asymmetry patterns from left leg constraint.
    
    Args:
        synchronized_data: Synchronized multi-modal data
        time_window: Time window to display (seconds)
        
    Returns:
        matplotlib Figure
    """
    fig, axes = plt.subplots(3, 1, figsize=(15, 10))
    fig.suptitle('Constrained Gait Analysis - Left Leg Locked in Extension', fontsize=16)
    
    kinetics = synchronized_data['kinetics']
    kinematics = synchronized_data['kinematics']
    
    # Filter to time window
    mask = kinetics['time'] <= time_window
    kinetics = kinetics[mask]
    kinematics = kinematics[mask]
    
    time = kinetics['time']
    
    # Plot 1: Force asymmetry
    if 'Fz' in kinetics.columns and 'Fz.1' in kinetics.columns:
        axes[0].plot(time, kinetics['Fz'], label='Left Force Plate', color='blue', linewidth=2)
        axes[0].plot(time, kinetics['Fz.1'], label='Right Force Plate', color='red', linewidth=2)
        axes[0].fill_between(time, kinetics['Fz'], alpha=0.3, color='blue')
        axes[0].fill_between(time, kinetics['Fz.1'], alpha=0.3, color='red')
        axes[0].set_ylabel('Vertical Force (N)')
        axes[0].set_title('Force Asymmetry Pattern')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
    
    # Plot 2: Compensatory movement patterns
    if 'S12:RTOE' in kinematics.columns and 'S12:LTOE' in kinematics.columns:
        axes[1].plot(time, kinematics['S12:LTOE'], label='Left Toe (Constrained)', 
                    color='blue', linewidth=2)
        axes[1].plot(time, kinematics['S12:RTOE'], label='Right Toe (Compensating)', 
                    color='red', linewidth=2)
        axes[1].set_ylabel('Vertical Position (mm)')
        axes[1].set_title('Compensatory Movement Patterns')
        axes[1].legend()
        axes[1].grid(True, alpha=0.3)
    
    # Plot 3: Asymmetry index over time
    if 'Fz' in kinetics.columns and 'Fz.1' in kinetics.columns:
        left_force = np.abs(kinetics['Fz'])
        right_force = np.abs(kinetics['Fz.1'])
        
        # Calculate asymmetry index (avoiding division by zero)
        total_force = left_force + right_force
        asymmetry = np.where(total_force > 10, 
                           (right_force - left_force) / total_force, 0)
        
        axes[2].plot(time, asymmetry * 100, color='purple', linewidth=2)
        axes[2].axhline(y=0, color='black', linestyle='-', alpha=0.5)
        axes[2].fill_between(time, asymmetry * 100, alpha=0.3, color='purple')
        axes[2].set_ylabel('Asymmetry Index (%)')
        axes[2].set_xlabel('Time (seconds)')
        axes[2].set_title('Loading Asymmetry Index (Positive = Right Bias)')
        axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig