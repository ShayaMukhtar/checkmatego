
import React from 'react';
import DraggableKanbanBoard from './DraggableKanbanBoard';
import { TaskProps } from './TaskCard';

interface WorkSiteTaskBoardProps {
  todoTasks: TaskProps[];
  inProgressTasks: TaskProps[];
  doneTasks: TaskProps[];
  onTasksChange: (
    todoTasks: TaskProps[], 
    inProgressTasks: TaskProps[], 
    doneTasks: TaskProps[]
  ) => void;
  onAddTask: (column: 'todo' | 'inprogress' | 'done') => void;
}

const WorkSiteTaskBoard: React.FC<WorkSiteTaskBoardProps> = ({
  todoTasks,
  inProgressTasks,
  doneTasks,
  onTasksChange,
  onAddTask
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Task Board</h2>
      <DraggableKanbanBoard
        todoTasks={todoTasks}
        inProgressTasks={inProgressTasks}
        doneTasks={doneTasks}
        onTasksChange={onTasksChange}
        onAddTask={onAddTask}
      />
    </div>
  );
};

export default WorkSiteTaskBoard;
