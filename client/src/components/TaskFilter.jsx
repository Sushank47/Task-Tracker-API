import React from 'react';
import { Search, Filter, ArrowUpDown, Trash2, CheckCircle2 } from 'lucide-react';

export const TaskFilter = ({ 
  search, setSearch, 
  statusFilter, setStatusFilter, 
  priorityFilter, setPriorityFilter, 
  categoryFilter, setCategoryFilter,
  categories = [],
  sortBy, setSortBy,
  selectedCount, onBulkDelete, onBulkComplete, onSelectAll, isAllSelected
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
      <div className="toolbar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tasks by title or description..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <Filter size={16} />
            <span>Filters:</span>
          </div>

          <select 
            className="select-custom" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <select 
            className="select-custom" 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {categories.length > 0 && (
            <select 
              className="select-custom" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
            <ArrowUpDown size={16} />
            <span>Sort:</span>
          </div>

          <select 
            className="select-custom" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <div className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 500 }}>
            <input type="checkbox" checked={isAllSelected} onChange={onSelectAll} style={{ accentColor: 'var(--accent-primary)' }} />
            <span>Select All Visible</span>
          </label>
          {selectedCount > 0 && (
            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>({selectedCount} selected)</span>
          )}
        </div>

        {selectedCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={onBulkComplete}>
              <CheckCircle2 size={14} color="#34d399" /> Mark Completed
            </button>
            <button className="btn btn-danger" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={onBulkDelete}>
              <Trash2 size={14} /> Bulk Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
