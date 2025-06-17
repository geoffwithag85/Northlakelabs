% extract_raw_data.m
% Try different methods to extract data from MATLAB table files

function extract_raw_data()
    fprintf('Raw Data Extraction from MATLAB Tables\n');
    fprintf('======================================\n\n');
    
    % Files to process
    sensors = {'fp', 'imu', 'gcLeft', 'gcRight'};
    trial_name = 'levelground_ccw_normal_01_01.mat';
    base_path = 'data/levelground/';
    output_path = 'src/components/interactive/MultiSensorFusionDemo/data/';
    
    % Create output directory
    if ~exist(output_path, 'dir')
        mkdir(output_path);
    end
    
    for i = 1:length(sensors)
        sensor = sensors{i};
        file_path = [base_path sensor '/' trial_name];
        
        fprintf('Processing %s...\n', sensor);
        
        if exist(file_path, 'file')
            try
                % Load the file
                file_data = load(file_path);
                
                if isfield(file_data, 'data')
                    data_struct = file_data.data;
                    
                    % Try different approaches to access table data
                    % Method 1: Try to access through struct2cell
                    try
                        fprintf('  Method 1: struct2cell approach\n');
                        cell_data = struct2cell(data_struct);
                        
                        for j = 1:length(cell_data)
                            cell_content = cell_data{j};
                            fprintf('    Cell %d: %s, size %s\n', j, class(cell_content), mat2str(size(cell_content)));
                            
                            if isnumeric(cell_content) && numel(cell_content) > 10
                                output_file = [output_path sensor '_method1_' num2str(j) '.csv'];
                                csvwrite(output_file, cell_content);
                                fprintf('    Saved to: %s\n', output_file);
                            end
                        end
                    catch err
                        fprintf('    Method 1 failed: %s\n', err.message);
                    end
                    
                    % Method 2: Try fieldnames and getfield with different syntax
                    try
                        fprintf('  Method 2: getfield approach\n');
                        field_names = fieldnames(data_struct);
                        
                        for j = 1:length(field_names)
                            field_name = field_names{j};
                            fprintf('    Trying field: %s\n', field_name);
                            
                            % Try subsref instead of direct access
                            try
                                S.type = '.';
                                S.subs = field_name;
                                field_data = subsref(data_struct, S);
                                
                                fprintf('      Success with subsref: %s, size %s\n', class(field_data), mat2str(size(field_data)));
                                
                                if isnumeric(field_data) && numel(field_data) > 10
                                    output_file = [output_path sensor '_' field_name '_subsref.csv'];
                                    csvwrite(output_file, field_data);
                                    fprintf('      Saved to: %s\n', output_file);
                                elseif isstruct(field_data)
                                    % Recursively examine nested structure
                                    extract_nested_data(field_data, [output_path sensor '_' field_name '_']);
                                end
                                
                            catch subsref_err
                                fprintf('      subsref failed: %s\n', subsref_err.message);
                            end
                        end
                    catch err
                        fprintf('    Method 2 failed: %s\n', err.message);
                    end
                    
                    % Method 3: Try to convert entire struct to array
                    try
                        fprintf('  Method 3: struct array conversion\n');
                        
                        % Sometimes the data is stored as a struct array
                        if length(data_struct) > 1
                            for j = 1:min(3, length(data_struct))
                                struct_element = data_struct(j);
                                fprintf('    Struct element %d\n', j);
                                extract_nested_data(struct_element, [output_path sensor '_element' num2str(j) '_']);
                            end
                        end
                        
                    catch err
                        fprintf('    Method 3 failed: %s\n', err.message);
                    end
                end
                
            catch main_err
                fprintf('  Error loading file: %s\n', main_err.message);
            end
        else
            fprintf('  File not found: %s\n', file_path);
        end
        
        fprintf('\n');
    end
end

function extract_nested_data(struct_data, prefix)
    % Helper function to extract data from nested structures
    try
        if isstruct(struct_data)
            field_names = fieldnames(struct_data);
            
            for i = 1:length(field_names)
                field_name = field_names{i};
                
                try
                    field_content = struct_data.(field_name);
                    
                    if isnumeric(field_content) && numel(field_content) > 10
                        output_file = [prefix field_name '.csv'];
                        csvwrite(output_file, field_content);
                        fprintf('      Saved nested data to: %s\n', output_file);
                    elseif iscell(field_content)
                        % Try to extract from cell array
                        for j = 1:min(3, numel(field_content))
                            cell_data = field_content{j};
                            if isnumeric(cell_data) && numel(cell_data) > 10
                                output_file = [prefix field_name '_cell' num2str(j) '.csv'];
                                csvwrite(output_file, cell_data);
                                fprintf('      Saved cell data to: %s\n', output_file);
                            end
                        end
                    end
                    
                catch field_err
                    % Silent failure for inaccessible fields
                end
            end
        end
    catch
        % Silent failure
    end
end

% Run the extraction
extract_raw_data();