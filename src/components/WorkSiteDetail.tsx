import React, { useState, useEffect } from "react";
import { WorkSiteProps } from "./WorkSite";
import { Save } from "lucide-react";

interface WorkSiteDetailProps {
  site: WorkSiteProps;
  onUpdateStatus: (id: string, status: "todo" | "in-progress" | "done") => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdateAssignment: (id: string, assignedTo: string) => void;
  onChooseFile?: () => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
}

const WorkSiteDetail: React.FC<WorkSiteDetailProps> = ({
  site,
  onUpdateStatus,
  onUpdateDescription,
  onUpdateAssignment,
  onChooseFile,
  onFileChange,
  fileInputRef,
}) => {
  const [description, setDescription] = useState(site.comment || "");
  // New state for assignment; using the site's assignedTo value if available
  const [assignment, setAssignment] = useState(site.assignedTo || "");

  useEffect(() => {
    setDescription(site.comment || "");
    setAssignment(site.assignedTo || "");
  }, [site]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(site.id, e.target.value as "todo" | "in-progress" | "done");
  };

  const handleSaveDescription = () => {
    onUpdateDescription(site.id, description);
  };

  // When an employee is selected, update the assignment and immediately save it
  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssignment = e.target.value;
    setAssignment(newAssignment);
    onUpdateAssignment(site.id, newAssignment);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Selected Work Site: {site.name}
        </h2>
      </div>

      <div className="glass-card p-6 mb-6">
        {/* Status Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Status
          </label>
          <select
            value={site.status}
            onChange={handleStatusChange}
            className="w-full bg-background border border-border/60 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Assignment Dropdown Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Assign Task
          </label>
          <select
            value={assignment}
            onChange={handleAssignmentChange}
            className="w-full bg-background border border-border/60 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select an employee</option>
            <option value="employee1@example.com">Employee 1</option>
            <option value="employee2@example.com">Employee 2</option>
            <option value="employee3@example.com">Employee 3</option>
          </select>
        </div>

        {/* Description Section */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Job Requirements / Task Details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter job requirements or task details for this job"
            className="w-full h-32 bg-background border border-border/60 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 mb-3"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveDescription}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Save className="h-3.5 w-3.5" /> Save Description
            </button>
          </div>
        </div>
      </div>

      {/* Photo Upload & Preview Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-medium mb-2">Photos</h3>
        {onChooseFile && (
          <>
            <button
              onClick={onChooseFile}
              className="inline-flex items-center gap-1 py-1.5 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Choose Photos
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
          </>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {site.photos && site.photos.length > 0 ? (
            site.photos.map((photo, index) => (
              <img
                key={index}
                src={typeof photo === "string" ? photo : photo.url}
                alt={`Photo ${index + 1}`}
                className="w-32 h-32 object-cover rounded-md"
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No photos uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkSiteDetail;
