
import React from 'react';
import TaskCard, { TaskProps } from './TaskCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  tasks: TaskProps[];
  colorClass: string;
  onAddTask: () => void;
  id?: string;
  setNodeRef?: (element: HTMLElement | null) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
  title, 
  tasks, 
  colorClass, 
  onAddTask,
  id,
  setNodeRef
}) => {
  return (
    <div 
      ref={setNodeRef} 
      id={id}
      className="flex-1 min-w-[250px] glass rounded-xl p-4 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="text-xs text-muted-foreground bg-secondary/80 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={onAddTask}
          className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      
      <div className="overflow-y-auto flex-grow pr-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
        
        {tasks.length === 0 && (
          <div className="h-24 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  todoTasks: TaskProps[];
  inProgressTasks: TaskProps[];
  doneTasks: TaskProps[];
  onAddTask: (column: 'todo' | 'inprogress' | 'done') => void;
  setNodeRef?: (id: string) => (element: HTMLElement | null) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  todoTasks, 
  inProgressTasks, 
  doneTasks,
  onAddTask,
  setNodeRef
}) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 animate-fade-in">
      <KanbanColumn 
        title="To Do" 
        tasks={todoTasks} 
        colorClass="bg-todo" 
        onAddTask={() => onAddTask('todo')}
        id="todo"
        setNodeRef={setNodeRef ? setNodeRef('todo') : undefined}
      />
      <KanbanColumn 
        title="In Progress" 
        tasks={inProgressTasks} 
        colorClass="bg-inprogress" 
        onAddTask={() => onAddTask('inprogress')}
        id="in-progress"
        setNodeRef={setNodeRef ? setNodeRef('in-progress') : undefined}
      />
      <KanbanColumn 
        title="Done" 
        tasks={doneTasks} 
        colorClass="bg-done" 
        onAddTask={() => onAddTask('done')}
        id="done"
        setNodeRef={setNodeRef ? setNodeRef('done') : undefined}
      />
    </div>
  );
};

export default KanbanBoard;
