import React, { useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';

export interface WorkSiteProps {
  id: string;
  name: string;
  status: 'todo' | 'inprogress' | 'done';
  comment?: string;
  photos?: { url: string }[];
  assignedTo?: string;
}

interface WorkSitesProps {
  sites: WorkSiteProps[];
  onAdd: (name: string) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSelect: (site: WorkSiteProps) => void;
  selectedSite: WorkSiteProps | null;
}

const WorkSites: React.FC<WorkSitesProps> = ({ 
  sites, 
  onAdd, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectedSite 
}) => {
  const [newSiteName, setNewSiteName] = useState('');
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAdd = () => {
    if (newSiteName.trim()) {
      onAdd(newSiteName);
      setNewSiteName('');
    }
  };

  const startEdit = (site: WorkSiteProps) => {
    setEditingSiteId(site.id);
    setEditingName(site.name);
  };

  const cancelEdit = () => {
    setEditingSiteId(null);
  };

  const saveEdit = (id: string) => {
    if (editingName.trim()) {
      onEdit(id, editingName);
      setEditingSiteId(null);
    }
  };

  return (
    <div className="mb-10 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Work Sites</h2>
        <div className="flex">
          <input
            type="text"
            value={newSiteName}
            onChange={(e) => setNewSiteName(e.target.value)}
            placeholder="New work site name"
            className="rounded-l-lg border-r-0 bg-background border-border/60 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-grow"
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <button
            onClick={handleAdd}
            className="rounded-r-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sites.map((site) => (
          <div 
            key={site.id}
            className={`glass-card p-3 ${selectedSite?.id === site.id ? 'ring-2 ring-primary/30 bg-white' : ''}`}
          >
            {editingSiteId === site.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="rounded-md border-border/60 py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 flex-grow"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') saveEdit(site.id);
                  }}
                />
                <button onClick={() => saveEdit(site.id)} className="text-primary hover:text-primary/80">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div
                  className={`flex items-center space-x-2 cursor-pointer flex-grow py-1`}
                  onClick={() => onSelect(site)}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    site.status === 'todo' ? 'bg-todo' :
                    site.status === 'inprogress' ? 'bg-inprogress' : 
                    'bg-done'
                  }`} />
                  <span>{site.name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(site)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-secondary/80 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(site.id)}
                    className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-secondary/80 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
            {/* New Assignment Dropdown */}
            <div className="mt-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Assign Task
              </label>
              <select className="w-full rounded-md bg-background border border-border/60 py-1 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select an employee</option>
                <option value="employee1">Employee 1</option>
                <option value="employee2">Employee 2</option>
                <option value="employee3">Employee 3</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkSites;
