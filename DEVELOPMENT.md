# Development Guide - Smart Data Processing

## Quick Start Commands

### Fast Development (Recommended)
```bash
npm run dev-fast          # Start dev server instantly (uses cached data)
npm run build-fast         # Build instantly (uses cached data)
```

### Full Development (When data changes)
```bash
npm run dev               # Process data + start dev server
npm run build             # Process data + build
```

### Data Processing Commands
```bash
npm run process-data      # Smart caching - only processes if needed
npm run process-data-force # Force reprocess from CSV sources
```

## Smart Caching System

The data processing pipeline now includes intelligent caching to dramatically speed up development:

### How It Works
1. **Cache Check**: Compares timestamps of source CSV files vs generated JSON files
2. **Smart Skip**: If JSON files are newer than CSV sources, skips processing entirely
3. **Auto-Process**: Only processes when source data has actually changed
4. **Force Override**: Use `--force` flag to bypass cache when needed

### Performance Improvement
- **First run**: ~2-3 minutes (processes ~300MB of CSV data)
- **Subsequent runs**: ~5-10 seconds (cache hit)
- **Dev server startup**: ~500ms vs ~3 minutes

### Cache Validation
The system checks:
- ✅ Do T5-demo.json and T5-metadata.json exist?
- ✅ Are output files newer than all source CSV files?
- ✅ Are all source CSV files present?

### File Structure
```
data/Sub1/                          # Source data (CSV files)
├── Kinetics/Sub1_Kinetics_T5.csv   # 1000Hz force plate data
├── EMG/Sub1_EMG_T5.csv            # 2000Hz muscle activation
└── Kinematics/Sub1_Kinematics_T5.csv # 100Hz motion capture

public/demo-data/                   # Processed cache (JSON files)  
├── T5-demo.json                    # Optimized demo data
└── T5-metadata.json               # Trial metadata
```

## Development Workflow

### Daily Development (Fast)
```bash
npm run dev-fast    # Instant startup using cached data
```

### When Data Changes
```bash
npm run process-data-force  # Force reprocess source data
npm run dev                # Normal dev with fresh processing
```

### Production Build
```bash
npm run build       # Always ensures data is current
```

## Troubleshooting

### "Demo data not found" error
```bash
npm run process-data-force  # Regenerate demo data
```

### Force refresh demo data
```bash
npm run process-data -- --force T5  # Force reprocess T5 trial
```

### Check cache status
The process-data command will tell you:
- ✅ "Demo data cache is valid" = using cached data
- 🔄 "Cache invalid or missing" = processing from source
- 📅 "Source file newer than cache" = auto-refresh needed

## Benefits

1. **Development Speed**: 10-20x faster startup after first run
2. **Data Freshness**: Automatically detects when source data changes  
3. **Flexibility**: Easy to force refresh when needed
4. **Compatibility**: Existing workflows still work unchanged
5. **Reliability**: Validates cache integrity before use

The caching system makes development much more pleasant while ensuring data accuracy! 🚀