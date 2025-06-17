% diagnose_mat_files.m
% Detailed examination of MATLAB file structure

function diagnose_mat_files()
    fprintf('MATLAB File Structure Diagnostic\n');
    fprintf('================================\n\n');
    
    % Load one file for detailed examination
    file_path = 'data/levelground/fp/levelground_ccw_normal_01_01.mat';
    
    if exist(file_path, 'file')
        fprintf('Examining: %s\n\n', file_path);
        
        % Load with -v7.3 flag if needed
        data_struct = load(file_path);
        
        % Get all variables
        var_names = fieldnames(data_struct);
        
        for i = 1:length(var_names)
            var_name = var_names{i};
            var_data = data_struct.(var_name);
            
            fprintf('Variable: %s\n', var_name);
            fprintf('  Class: %s\n', class(var_data));
            fprintf('  Size: %s\n', mat2str(size(var_data)));
            
            if isstruct(var_data)
                struct_fields = fieldnames(var_data);
                fprintf('  Fields: %s\n', strjoin(struct_fields, ', '));
                
                % Try to examine each field
                for j = 1:length(struct_fields)
                    field_name = struct_fields{j};
                    fprintf('    %s: ', field_name);
                    
                    try
                        % Different ways to access the field
                        field_data = getfield(var_data, field_name);
                        fprintf('class=%s, size=%s', class(field_data), mat2str(size(field_data)));
                        
                        if isnumeric(field_data) && numel(field_data) < 20
                            fprintf(', data=%s', mat2str(field_data));
                        elseif iscell(field_data) && numel(field_data) < 5
                            fprintf(', cells=%d', numel(field_data));
                            for k = 1:min(2, numel(field_data))
                                cell_content = field_data{k};
                                fprintf(' [%d]=%s', k, class(cell_content));
                            end
                        elseif ischar(field_data)
                            fprintf(', string="%s"', field_data);
                        end
                        
                    catch err
                        fprintf('ERROR: %s', err.message);
                    end
                    fprintf('\n');
                end
                
            elseif iscell(var_data)
                fprintf('  Cell array with %d elements\n', numel(var_data));
                for j = 1:min(3, numel(var_data))
                    cell_content = var_data{j};
                    fprintf('    [%d]: %s, size=%s\n', j, class(cell_content), mat2str(size(cell_content)));
                end
                
            elseif isnumeric(var_data)
                fprintf('  Numeric data\n');
                if numel(var_data) < 20
                    fprintf('  Values: %s\n', mat2str(var_data));
                else
                    fprintf('  Range: %g to %g\n', min(var_data(:)), max(var_data(:)));
                end
                
            elseif ischar(var_data)
                fprintf('  String: "%s"\n', var_data);
            end
            
            fprintf('\n');
        end
        
        % Try to use whos to get more info
        fprintf('Using whos command:\n');
        try
            info = whos('-file', file_path);
            for k = 1:length(info)
                fprintf('  %s: %s %s\n', info(k).name, mat2str(info(k).size), info(k).class);
            end
        catch
            fprintf('  whos command failed\n');
        end
        
    else
        fprintf('File not found: %s\n', file_path);
    end
end

% Run the diagnostic
diagnose_mat_files();