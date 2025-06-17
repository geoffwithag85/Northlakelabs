# Update Documentation - Sync All Docs After Development Progress

Systematically update all project documentation to reflect current development progress and maintain consistency across all files.

## Execution Steps

### Step 1: Assess Current Development State
- `TodoRead` - Check completed vs pending tasks
- `Bash "git log --oneline -5"` - Review recent development progress
- `LS src/components/interactive` - Check implemented components
- `LS scripts` - See completed processing scripts
- `LS public/demo-data` - Check generated demo files

### Step 2: Review Documentation Files for Updates

**Core Documentation Files to Check:**
- `Read CLAUDE.md` (lines 60-90) - Interactive demo descriptions
- `Read docs/demoplan.md` (lines 355-400) - Development timeline and progress
- `Read docs/design.md` (lines 348-380) - Current development phase status
- `Read docs/demo-specifications.md` (lines 425-460) - Implementation timeline checkboxes

### Step 3: Update Progress Tracking

**Phase Progress Updates:**
- **Phase A (Days 1-3)**: Update completed checkboxes in timeline
- **Phase B (Days 4-6)**: Mark started/completed algorithm implementations
- **Phase C (Days 7-10)**: Track UI component development
- **Phase D (Days 11-13)**: Record integration and optimization progress

**Files to Update Based on Progress:**

#### demoplan.md Updates:
- **Implementation Timeline section (lines 426-442)**: Update ✅ checkboxes
- **Success Criteria section (lines 452-457)**: Mark achieved targets
- **Add new insights or challenges discovered during implementation**

#### design.md Updates:
- **Phase 3 section (lines 348-373)**: Update development phase progress
- **Interactive Demonstrations section (lines 247-255)**: Update current demo status
- **Recent Accomplishments section**: Add new completed features

#### CLAUDE.md Updates:
- **Interactive Demonstrations section (lines 62-89)**: Update technical details
- **Common Tasks section (lines 186-191)**: Add new development procedures
- **Testing Guidelines section (lines 172-179)**: Update based on implementation experience

#### demo-specifications.md Updates:
- **Acceptance Criteria section**: Mark completed implementation milestones
- **Timeline sections**: Update phase completion status
- **Technical specifications**: Refine based on actual implementation details

### Step 4: Update Based on Implementation Discoveries

**Technical Updates:**
- **Performance metrics**: Update actual vs target performance numbers
- **Algorithm accuracy**: Record real accuracy progression results
- **File sizes**: Update actual demo data file sizes
- **Processing times**: Record real CSV processing performance

**Implementation Notes:**
- **Challenges encountered**: Document technical obstacles and solutions
- **Architecture decisions**: Record important technical choices made
- **Performance optimizations**: Note successful optimization strategies
- **Data insights**: Record findings from trial analysis and processing

### Step 5: Maintain Consistency Across Files

**Cross-Reference Checks:**
- **Accuracy targets**: Ensure 60% → 75% → 92% consistent across all docs
- **Timeline references**: Verify Phase A-D descriptions match
- **Technical specifications**: Ensure component names and file paths align
- **Development priorities**: Confirm current focus areas are consistent

**Format Consistency:**
- **Checkbox formatting**: Use ✅ for completed, ❌ for failed, ⏳ for in-progress
- **Code block syntax**: Ensure consistent JavaScript/TypeScript formatting
- **File path references**: Verify all paths are current and accurate
- **Progress indicators**: Use consistent "X/Y completed" format

### Step 6: Add New Documentation Sections (If Needed)

**When Implementation Reveals New Needs:**
- **Troubleshooting sections**: Common issues and solutions
- **Performance tuning**: Optimization techniques discovered
- **Data processing notes**: CSV parsing insights and best practices
- **Algorithm tuning**: Parameter adjustments and calibration notes

### Step 7: Validation and Consistency Check

**Final Validation Steps:**
- **Read through updated sections** to ensure accuracy
- **Check for conflicting information** between files
- **Verify all links and file references** are current
- **Ensure phase progress is accurately reflected**

## Update Decision Matrix

**Always Update When:**
- ✅ Major tasks completed (mark checkboxes)
- ✅ New components implemented (add to architecture docs)
- ✅ Performance targets achieved (update metrics)
- ✅ Technical decisions made (document in specifications)
- ✅ Phase transitions (update timeline and priorities)

**Consider Updating When:**
- 🤔 Minor optimizations made (add to notes)
- 🤔 Development approach refined (update methodology)
- 🤔 New tools or libraries added (update tech stack)
- 🤔 Testing insights gained (enhance testing guidelines)

**Don't Update For:**
- ❌ Temporary experimental changes
- ❌ Work-in-progress incomplete features
- ❌ Minor code formatting or style changes
- ❌ Debugging and troubleshooting sessions

## Progress Tracking Examples

**Phase A Completion Example:**
```markdown
### Phase A: Data Pipeline (Days 1-3) - COMPLETED ✅
1. ✅ **Trial Analysis & Selection** - T05 selected as optimal demo trial
2. ✅ **CSV Processing Pipeline** - Build-time processing implemented
3. ✅ **Data Synchronization** - 1000Hz unified timeline achieved
4. ✅ **JSON Export Generation** - 487KB optimized demo file generated
```

**Phase B Progress Example:**
```markdown
### Phase B: Algorithm Implementation (Days 4-6) - IN PROGRESS ⏳
1. ✅ **Stage 1: Traditional Detection** - 58% accuracy achieved
2. ⏳ **Stage 2: Basic Fusion** - EMG integration in development
3. ❌ **Stage 3: AI Fusion** - Not started
4. ❌ **Accuracy Measurement System** - Pending algorithm completion
```

## Usage Guidelines

**Run this command when:**
- 🎯 Completing major development milestones
- 🎯 Finishing development phases or sub-phases
- 🎯 Before team handoffs or project reviews
- 🎯 After implementing significant new features
- 🎯 When documentation becomes out of sync with reality

**Command Output:**
- Summary of documentation files updated
- List of progress items marked complete
- Note any new sections or insights added
- Highlight any inconsistencies resolved

This command ensures all project stakeholders have current, accurate information about development progress and technical implementation details throughout the multi-sensor fusion demo development cycle.