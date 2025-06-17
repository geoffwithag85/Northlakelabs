% convert_mat_to_csv.m
% Convert MATLAB table files to CSV format for Python processing
% Uses GNU Octave to handle MATLAB tables

function convert_mat_to_csv()
    fprintf('Multi-Sensor Fusion Demo - MATLAB to CSV Converter\n');
    fprintf('Using GNU Octave to process MATLAB table files\n\n');
    
    % Define the trial to extract
    trial_name = 'levelground_ccw_normal_01_01.mat';
    base_path = 'data/levelground/';
    output_path = 'src/components/interactive/MultiSensorFusionDemo/data/';
    
    % Create output directory if it doesn't exist
    if ~exist(output_path, 'dir')
        mkdir(output_path);
    end
    
    % Files to process
    sensors = {'fp', 'imu', 'gcLeft', 'gcRight', 'conditions'};
    
    for i = 1:length(sensors)
        sensor = sensors{i};
        input_file = [base_path sensor '/' trial_name];
        
        fprintf('Processing %s...\n', sensor);
        
        if exist(input_file, 'file')
            try
                % Load the .mat file
                data_struct = load(input_file);
                
                % Display what variables are loaded
                var_names = fieldnames(data_struct);
                fprintf('  Variables in file: %s\n', strjoin(var_names, ', '));
                
                % Look for table data
                for j = 1:length(var_names)
                    var_name = var_names{j};
                    var_data = data_struct.(var_name);
                    
                    fprintf('  %s: %s\n', var_name, class(var_data));
                    
                    % Handle different data types
                    % Note: Octave doesn't have istable, so we'll treat everything as struct or numeric
                    if isstruct(var_data)
                        % Structure - examine fields
                        struct_fields = fieldnames(var_data);
                        fprintf('    Structure fields: %s\n', strjoin(struct_fields, ', '));
                        
                        % Try to find data arrays in the structure
                        for k = 1:length(struct_fields)
                            field_name = struct_fields{k};
                            
                            try
                                field_data = var_data.(field_name);
                                
                                if isnumeric(field_data) && numel(field_data) > 1
                                    output_file = [output_path sensor '_' field_name '.csv'];
                                    csvwrite(output_file, field_data);
                                    fprintf('    Saved numeric data to: %s\n', output_file);
                                elseif isstruct(field_data)
                                    % Nested structure - look deeper
                                    nested_fields = fieldnames(field_data);
                                    fprintf('    Nested structure %s has fields: %s\n', field_name, strjoin(nested_fields, ', '));
                                    
                                    % Try to access deeper data
                                    for m = 1:length(nested_fields)
                                        nested_field = nested_fields{m};
                                        try
                                            nested_data = field_data.(nested_field);
                                            if isnumeric(nested_data) && numel(nested_data) > 10
                                                output_file = [output_path sensor '_' field_name '_' nested_field '.csv'];
                                                csvwrite(output_file, nested_data);
                                                fprintf('    Saved nested data to: %s\n', output_file);
                                            elseif iscell(nested_data)
                                                % Cell array - might contain actual data
                                                fprintf('    Found cell array %s with %d elements\n', nested_field, numel(nested_data));
                                                for n = 1:min(5, numel(nested_data))  % Check first few cells
                                                    cell_data = nested_data{n};
                                                    if isnumeric(cell_data) && numel(cell_data) > 10
                                                        output_file = [output_path sensor '_' field_name '_' nested_field '_' num2str(n) '.csv'];
                                                        csvwrite(output_file, cell_data);
                                                        fprintf('    Saved cell data to: %s\n', output_file);
                                                    end
                                                end
                                            end
                                        catch nested_err
                                            fprintf('    Could not access nested field %s: %s\n', nested_field, nested_err.message);
                                        end
                                    end
                                elseif iscell(field_data)
                                    % Cell array at top level
                                    fprintf('    Found cell array %s with %d elements\n', field_name, numel(field_data));
                                    for n = 1:min(3, numel(field_data))  % Check first few cells
                                        cell_data = field_data{n};
                                        if isnumeric(cell_data) && numel(cell_data) > 10
                                            output_file = [output_path sensor '_' field_name '_' num2str(n) '.csv'];
                                            csvwrite(output_file, cell_data);
                                            fprintf('    Saved cell data to: %s\n', output_file);
                                        end
                                    end
                                end
                                
                            catch field_err
                                fprintf('    Error accessing field %s: %s\n', field_name, field_err.message);
                            end
                        end
                        
                    elseif isnumeric(var_data) && numel(var_data) > 1
                        % Numeric array
                        output_file = [output_path sensor '_' var_name '.csv'];
                        csvwrite(output_file, var_data);
                        fprintf('    Saved numeric array to: %s\n', output_file);
                        
                    else
                        fprintf('    Skipping %s (type: %s, size: %s)\n', ...
                            var_name, class(var_data), mat2str(size(var_data)));
                    end
                end
                
            catch err
                fprintf('  Error processing %s: %s\n', sensor, err.message);
            end
            
        else
            fprintf('  File not found: %s\n', input_file);
        end
        
        fprintf('\n');
    end
    
    fprintf('Conversion complete!\n');
    fprintf('CSV files saved to: %s\n', output_path);
end

% Run the conversion
convert_mat_to_csv();