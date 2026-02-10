# Workflow Automation Rules Guide

## Default Rules Overview

The system comes with 7 pre-configured workflow rules designed for educational institutions. These are loaded automatically on first startup and can be customized through the **Workflow Rules** admin panel.

### 📋 Pre-configured Rules

#### 1. **Academic Cases - Auto Assign to Faculty** (Priority 1)
- **Trigger**: Any grievance with category = "Academic"
- **Action**: Sends notification to assigned academic staff
- **Use Case**: Routes all academic issues to the right team
- **Customization**: After adding dedicated academic cell leads, modify to auto-assign to specific users

#### 2. **Infrastructure Cases - Priority Assignment** (Priority 2)
- **Trigger**: Infrastructure category AND High priority
- **Actions**:
  - Marks as high priority
  - Adds tag: `urgent-infrastructure`
  - Sends notification
- **Use Case**: Fast-tracks urgent infrastructure/facility issues
- **Customization**: Add assignment to infrastructure lead after they're added to the system

#### 3. **Hostel Cases - Support Team Assignment** (Priority 3)
- **Trigger**: Category = "Hostel"
- **Actions**:
  - Tags case as `hostel-support`
  - Notifies support team
- **Use Case**: Routes residential issues to student support
- **Customization**: Assign to hostel warden/administrator after adding to system

#### 4. **Financial Cases - Escalate to Admin** (Priority 4)
- **Trigger**: Category = "Financial"
- **Actions**:
  - Escalates to DEPT_ADMIN role
  - Sends notification
- **Use Case**: Financial matters go to department administrators
- **Customization**: Already configured; modify if your admin structure changes

#### 5. **Escalate Stalled Cases** (Priority 5)
- **Trigger**: Grievance unresolved for 3+ days
- **Actions**:
  - Escalates to HOD role
  - Adds tag: `escalated-stalled`
  - Notifies HOD
- **Use Case**: Ensures no case gets stuck; triggers escalation after 3 days
- **Customization**: Change days from 3 to 5/7/10 based on your SLA

#### 6. **High Priority Cases - Fast Track** (Priority 6)
- **Trigger**: Any case marked as High priority
- **Action**: Tags as `priority-fast-track`
- **Use Case**: Marks all urgent cases for immediate attention
- **Customization**: Add assignment to dedicated priority response team

#### 7. **Administrative Cases - Tracking** (Priority 7)
- **Trigger**: Category = "Administrative"
- **Actions**:
  - Tags as `admin-case`
  - Sends notification
- **Use Case**: Ensures administrative issues are tracked
- **Customization**: Assign to specific administrative officer

---

## How to Customize Rules

### Step 1: Login as Admin
- Use credentials: `admin@asmedu.org` / `asm@123`

### Step 2: Navigate to Workflow Rules
- Click "**Workflow Rules**" in the left sidebar (admin only)

### Step 3: Edit Default Rules
1. Click the **Edit** button on any rule
2. Modify conditions or actions
3. After adding team members, update assignments:
   - **Find**: The rule with action "Notify"
   - **Change to**: Action "Assign to User" → Select your team leader
4. Click **Update Rule**

### Step 4: Common Customizations

#### Example: Assign Academic Cases to Dr. Sharma
1. Edit "Academic Cases - Auto Assign to Faculty"
2. Current action: `Notify`
3. Change to: `Assign to User` → Select "Dr. Sharma (Faculty)"
4. Update Rule ✅

#### Example: Change Escalation Time from 3 to 5 Days
1. Edit "Escalate Stalled Cases"
2. Change condition: `Days Unresolved > 3` → `Days Unresolved > 5`
3. Update Rule ✅

#### Example: Add New Rule for Department-Specific Cases
1. Click **"+ New Rule"**
2. **Name**: "Engineering Infrastructure Issues"
3. **Add Conditions**:
   - Department = "Engineering"
   - Category = "Infrastructure"
4. **Add Actions**:
   - Assign to [Engineering HOD]
   - Add Tag: "engineering-infrastructure"
5. **Create Rule** ✅

---

## Rule Priority System

Rules execute in **priority order** (lower number = higher priority):

```
🔴 Priority 1 → Evaluated first
🟡 Priority 2
🟠 Priority 3
🟡 Priority 4
🔵 Priority 5 → Evaluated last
```

**Example**: If a grievance matches both:
- Rule #1 (Academic, Priority 1): Assign to Dr. Sharma
- Rule #5 (High Priority, Priority 6): Assign to Escalation Team

→ **Result**: Dr. Sharma gets it (Priority 1 wins)

---

## Common Scenarios

### Scenario 1: First Week - Getting Started
✅ Keep all default rules enabled  
✅ Use "Notify" actions (no specific users yet)  
✅ Monitor the patterns in Dashboard  
❌ Don't disable rules prematurely

### Scenario 2: After Adding 5 Team Members
✅ Edit rules to assign to specific users  
✅ Remove generic "Notify" actions  
✅ Add department-specific rules  
❌ Don't create duplicate rules

### Scenario 3: Optimizing After 1 Month
✅ Adjust escalation times based on real data  
✅ Disable ineffective rules  
✅ Create specialized rules for common patterns  
❌ Don't change too many rules at once

---

## Rule Lifecycle

```
📝 Create → ✅ Enable → 📊 Monitor → 🔧 Adjust → 🗑️ Delete (if needed)
```

### Monitoring Rules
1. Go to **Dashboard** → Check "Cases by Category"
2. Look for patterns in assignment and escalation
3. Use tags to filter cases handled by specific rules

### Disabling vs Deleting
- **Disable**: Keeps rule history, can re-enable later
- **Delete**: Permanently removes rule (use sparingly)

---

## Tags & Organization

Rules automatically add tags to grievances for easy filtering:

| Tag | Meaning | Rule |
|-----|---------|------|
| `urgent-infrastructure` | High-priority infrastructure | Rule 2 |
| `priority-fast-track` | High-priority issues | Rule 6 |
| `escalated-stalled` | Auto-escalated after 3+ days | Rule 5 |
| `hostel-support` | Residential cases | Rule 3 |
| `admin-case` | Administrative matters | Rule 7 |

**Use tags to**:
- Filter grievances in GrievanceList
- Create dashboards by category
- Audit rule effectiveness

---

## Best Practices

### ✅ DO:
- Start simple with category-based rules
- Add assignment rules only after organizing teams
- Test new rules with "Notify" first
- Review rules monthly with supervisors
- Keep documentation of rule changes
- Use descriptive names and descriptions

### ❌ DON'T:
- Create overlapping rules (confuses routing)
- Assign to too many people (dilutes responsibility)
- Change escalation times too frequently
- Disable core rules without replacement
- Create rules for one-off situations
- Forget to update rules after staff changes

---

## Troubleshooting

### Problem: Grievances not being assigned
**Check**: Is the rule enabled? (Green "Active" badge)  
**Solution**: Click "Enable" on the rule

### Problem: Wrong person getting assignments
**Check**: Rule priority - a higher priority rule might be matching first  
**Solution**: Adjust rule priority or conditions

### Problem: Too many escalations
**Check**: Are multiple rules triggering?  
**Solution**: Disable lower-priority escalation rules if already assigned

### Problem: Case not matching any rule
**Check**: All conditions must match (AND logic)  
**Solution**: Edit rule to be less restrictive or add new rule

---

## API/Technical Details

### Storage
- **Offline**: `localStorage` key: `asm_workflow_rules`
- **Cloud**: Firebase collection: `workflowRules`
- **Auto-sync**: Rules sync when system loads

### Rule Execution
1. All enabled rules evaluated against incoming grievance
2. Rules processed by priority (1 = first)
3. All matching rule actions executed sequentially
4. If no rules match: load balancing to least busy team member

### Performance
- Default rules: ~7 rules (minimal overhead)
- Response time: <50ms per grievance
- No performance impact on system

---

## Support

For questions or advanced customization:
1. Check the **Workflow Rules** UI for descriptions
2. Review rule conditions and actions by hovering
3. Test changes in demo mode before applying to production
4. Contact your system administrator for complex scenarios

Happy automating! 🚀
