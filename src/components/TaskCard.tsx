import React from 'react';
import { Clock } from 'lucide-react';

export interface TaskProps {
  id: string;
  title: string;
  startTime?: string;
  finishTime?: string;
  description?: string;
  assignedTo?: string;
}

const TaskCard: React.FC<TaskProps> = ({ 
  title, 
  startTime, 
  finishTime,
  description,
  assignedTo
}) => {
  return (
    <div className="glass-card p-4 mb-3 animate-scale-in">
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      
      {(startTime || finishTime) && (
        <div className="flex items-start gap-1 text-xs text-muted-foreground mb-2">
          <Clock className="h-3 w-3 mt-1" />
          <div className="flex flex-col">
            {startTime && <span>Started: {startTime}</span>}
            {finishTime && <span>Finished: {finishTime}</span>}
          </div>
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mb-2">
        Assigned to: {assignedTo ? assignedTo : 'Unassigned'}
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
    </div>
  );
};

export default TaskCard;
