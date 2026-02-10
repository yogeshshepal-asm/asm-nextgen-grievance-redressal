import React, { useState } from 'react';
import { WorkflowRule, RuleCondition, RuleAction, GrievanceCategory, User, UserRole } from '../types.ts';

interface WorkflowRulesProps {
  rules: WorkflowRule[];
  members: User[];
  onAddRule: (rule: WorkflowRule) => void;
  onUpdateRule: (rule: WorkflowRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
}

const WorkflowRules: React.FC<WorkflowRulesProps> = ({
  rules,
  members,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onToggleRule
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [formData, setFormData] = useState<Partial<WorkflowRule>>({
    name: '',
    description: '',
    priority: 1,
    enabled: true,
    conditions: [],
    actions: []
  });
  const [newCondition, setNewCondition] = useState<Partial<RuleCondition>>({
    field: 'category',
    operator: 'equals'
  });
  const [newAction, setNewAction] = useState<Partial<RuleAction>>({
    type: 'assign'
  });

  const handleAddCondition = () => {
    if (newCondition.field && newCondition.value) {
      setFormData(prev => ({
        ...prev,
        conditions: [...(prev.conditions || []), newCondition as RuleCondition]
      }));
      setNewCondition({ field: 'category', operator: 'equals' });
    }
  };

  const handleRemoveCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleAddAction = () => {
    if (newAction.type && (newAction.targetUserId || newAction.targetRole || newAction.value)) {
      setFormData(prev => ({
        ...prev,
        actions: [...(prev.actions || []), newAction as RuleAction]
      }));
      setNewAction({ type: 'assign' });
    }
  };

  const handleRemoveAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSaveRule = () => {
    if (!formData.name || !formData.conditions?.length || !formData.actions?.length) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingRule) {
      onUpdateRule({
        ...editingRule,
        ...formData,
        updatedAt: new Date().toISOString()
      } as WorkflowRule);
    } else {
      const newRule: WorkflowRule = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name!,
        description: formData.description,
        priority: formData.priority || 1,
        enabled: formData.enabled ?? true,
        conditions: formData.conditions || [],
        actions: formData.actions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onAddRule(newRule);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      priority: 1,
      enabled: true,
      conditions: [],
      actions: []
    });
    setNewCondition({ field: 'category', operator: 'equals' });
    setNewAction({ type: 'assign' });
  };

  const handleEditRule = (rule: WorkflowRule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowForm(true);
  };

  const getConditionDisplay = (condition: RuleCondition): string => {
    const value = Array.isArray(condition.value) ? condition.value.join(', ') : condition.value;
    return `${condition.field} ${condition.operator} ${value}`;
  };

  const getActionDisplay = (action: RuleAction): string => {
    const member = action.targetUserId ? members.find(m => m.id === action.targetUserId) : null;
    let display = `${action.type}`;
    if (member) display += ` to ${member.name}`;
    if (action.targetRole) display += ` to ${action.targetRole} role`;
    if (action.value) display += ` with ${action.value}`;
    return display;
  };

  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Workflow Rules</h2>
          <p className="text-sm text-slate-500 mt-1">
            Define automatic assignment, escalation, and notification rules for grievances
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-[#1a73b8] text-white rounded-lg hover:bg-[#1565a0] font-semibold transition-colors"
          >
            + New Rule
          </button>
        )}
      </div>

      {/* Rule Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            {editingRule ? 'Edit Rule' : 'Create New Rule'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Rule Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., High Priority Academic"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Priority (lower = higher)
              </label>
              <input
                type="number"
                min="1"
                value={formData.priority || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this rule does..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled ?? true}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="enabled" className="ml-2 text-sm font-semibold text-slate-700">
              Enable this rule
            </label>
          </div>

          {/* Conditions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-slate-900 mb-3">Conditions (All must match)</h4>
            {formData.conditions && formData.conditions.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.conditions.map((condition, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-slate-700">{getConditionDisplay(condition)}</span>
                    <button
                      onClick={() => handleRemoveCondition(idx)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Field</label>
                <select
                  value={newCondition.field || 'category'}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, field: e.target.value as any }))}
                  className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                >
                  <option value="category">Category</option>
                  <option value="priority">Priority</option>
                  <option value="department">Department</option>
                  <option value="userRole">User Role</option>
                  <option value="daysUnresolved">Days Unresolved</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Operator</label>
                <select
                  value={newCondition.operator || 'equals'}
                  onChange={(e) => setNewCondition(prev => ({ ...prev, operator: e.target.value as any }))}
                  className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="includes">Includes</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Value</label>
                {newCondition.field === 'category' ? (
                  <select
                    value={newCondition.value as string || ''}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  >
                    <option value="">Select Category</option>
                    {Object.values(GrievanceCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : newCondition.field === 'priority' ? (
                  <select
                    value={newCondition.value as string || ''}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  >
                    <option value="">Select Priority</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newCondition.value as string || ''}
                    onChange={(e) => setNewCondition(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleAddCondition}
              className="mt-2 px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-semibold"
            >
              + Add Condition
            </button>
          </div>

          {/* Actions */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-slate-900 mb-3">Actions (When rule matches)</h4>
            {formData.actions && formData.actions.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.actions.map((action, idx) => (
                  <div key={idx} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-slate-700">{getActionDisplay(action)}</span>
                    <button
                      onClick={() => handleRemoveAction(idx)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Action Type</label>
                <select
                  value={newAction.type || 'assign'}
                  onChange={(e) => setNewAction(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                >
                  <option value="assign">Assign to User</option>
                  <option value="escalate">Escalate to Role</option>
                  <option value="notify">Send Notification</option>
                  <option value="setPriority">Set Priority</option>
                  <option value="addTag">Add Tag</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target / Value</label>
                {newAction.type === 'assign' ? (
                  <select
                    value={newAction.targetUserId || ''}
                    onChange={(e) => setNewAction(prev => ({ ...prev, targetUserId: e.target.value }))}
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  >
                    <option value="">Select User</option>
                    {members.filter(m => m.role !== UserRole.STUDENT).map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                ) : newAction.type === 'escalate' ? (
                  <input
                    type="text"
                    value={newAction.targetRole || ''}
                    onChange={(e) => setNewAction(prev => ({ ...prev, targetRole: e.target.value }))}
                    placeholder="e.g., HOD, Dean"
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  />
                ) : (
                  <input
                    type="text"
                    value={newAction.value || ''}
                    onChange={(e) => setNewAction(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value"
                    className="w-full px-2 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a73b8]"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleAddAction}
              className="mt-2 px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 text-sm font-semibold"
            >
              + Add Action
            </button>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleSaveRule}
              className="px-4 py-2 bg-[#71bf44] text-white rounded-lg hover:bg-[#639a35] font-semibold transition-colors"
            >
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {sortedRules.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg">
            <p className="text-slate-500 font-semibold">No workflow rules created yet</p>
            <p className="text-sm text-slate-400">Create a rule to automate grievance routing</p>
          </div>
        ) : (
          sortedRules.map((rule) => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{rule.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded font-semibold ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded font-semibold">
                      Priority: {rule.priority}
                    </span>
                  </div>
                  {rule.description && <p className="text-sm text-slate-600 mt-1">{rule.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onToggleRule(rule.id, !rule.enabled)}
                    className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      rule.enabled
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleEditRule(rule)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm font-semibold hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Conditions:</p>
                  <ul className="space-y-1">
                    {rule.conditions.map((cond, idx) => (
                      <li key={idx} className="text-slate-600 text-xs bg-slate-50 px-2 py-1 rounded">
                        • {getConditionDisplay(cond)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-2">Actions:</p>
                  <ul className="space-y-1">
                    {rule.actions.map((action, idx) => (
                      <li key={idx} className="text-slate-600 text-xs bg-slate-50 px-2 py-1 rounded">
                        • {getActionDisplay(action)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkflowRules;
