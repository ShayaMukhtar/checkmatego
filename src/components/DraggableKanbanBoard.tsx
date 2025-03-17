
import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import KanbanBoard from './KanbanBoard';
import { TaskProps } from './TaskCard';
import DraggableTaskCard from './DraggableTaskCard';

interface DraggableKanbanBoardProps {
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

type ColumnId = 'todo' | 'in-progress' | 'done';

interface TasksStateType {
  todo: TaskProps[];
  'in-progress': TaskProps[];
  done: TaskProps[];
}

const DraggableKanbanBoard: React.FC<DraggableKanbanBoardProps> = ({
  todoTasks: initialTodoTasks,
  inProgressTasks: initialInProgressTasks,
  doneTasks: initialDoneTasks,
  onTasksChange,
  onAddTask
}) => {
  // Merge initial tasks into a single state object for easier manipulation
  const [tasks, setTasks] = useState<TasksStateType>({
    todo: initialTodoTasks,
    'in-progress': initialInProgressTasks,
    done: initialDoneTasks
  });
  
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use sensors to detect drag gestures
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Helper to find which column a task is in
  const findColumnOfTask = (taskId: string): ColumnId | null => {
    if (tasks.todo.some(task => task.id === taskId)) return 'todo';
    if (tasks['in-progress'].some(task => task.id === taskId)) return 'in-progress';
    if (tasks.done.some(task => task.id === taskId)) return 'done';
    return null;
  };

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // Handle drag over - for column change detection
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Find the columns of the active and over items
    const activeColumnId = findColumnOfTask(activeId);
    
    // If over a column directly (not a task)
    if (['todo', 'in-progress', 'done'].includes(overId)) {
      const overColumnId = overId as ColumnId;
      
      if (activeColumnId && activeColumnId !== overColumnId) {
        setTasks(prev => {
          // Find the task in the source column
          const activeTask = prev[activeColumnId].find(task => task.id === activeId);
          
          if (!activeTask) return prev;
          
          // Add timestamps based on column
          let updatedTask = { ...activeTask };
          
          if (overColumnId === 'in-progress' && !updatedTask.startTime) {
            updatedTask.startTime = new Date().toLocaleTimeString();
          }
          
          if (overColumnId === 'done' && !updatedTask.finishTime) {
            updatedTask.finishTime = new Date().toLocaleTimeString();
          }
          
          // Create new state with task moved to new column
          return {
            ...prev,
            [activeColumnId]: prev[activeColumnId].filter(task => task.id !== activeId),
            [overColumnId]: [...prev[overColumnId], updatedTask]
          };
        });
      }
    }
  };

  // Handle drag end - for reordering within a column
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    
    if (!over) return;
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Skip if dropping on the same item
    if (activeId === overId) return;
    
    const activeColumnId = findColumnOfTask(activeId);
    const overColumnId = findColumnOfTask(overId);
    
    // Only reorder if the task is being dropped on another task in the same column
    if (activeColumnId && overColumnId && activeColumnId === overColumnId) {
      setTasks(prev => {
        const column = prev[activeColumnId];
        const oldIndex = column.findIndex(task => task.id === activeId);
        const newIndex = column.findIndex(task => task.id === overId);
        
        // Reorder the column
        const reordered = arrayMove(column, oldIndex, newIndex);
        
        // Update state
        return {
          ...prev,
          [activeColumnId]: reordered
        };
      });
    }
    
    // Notify parent of changes
    onTasksChange(tasks.todo, tasks['in-progress'], tasks.done);
  };

  // Create droppable containers for each column
  const DroppableColumn = ({ id }: { id: ColumnId }) => {
    const { setNodeRef } = useDroppable({ id });
    return (
      <SortableContext
        items={tasks[id].map(task => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 min-w-[250px] glass rounded-xl p-4 flex flex-col" ref={setNodeRef}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${
                id === 'todo' ? 'bg-todo' : 
                id === 'in-progress' ? 'bg-inprogress' : 
                'bg-done'
              }`} />
              <h3 className="font-medium text-sm">
                {id === 'todo' ? 'To Do' : 
                 id === 'in-progress' ? 'In Progress' : 
                 'Done'}
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary/80 rounded-full px-2 py-0.5">
                {tasks[id].length}
              </span>
            </div>
            <button 
              onClick={() => onAddTask(
                id === 'todo' ? 'todo' : 
                id === 'in-progress' ? 'inprogress' : 
                'done'
              )}
              className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <span className="text-xl">+</span>
            </button>
          </div>
          
          <div className="overflow-y-auto flex-grow pr-1">
            {tasks[id].map((task) => (
              <DraggableTaskCard 
                key={task.id} 
                containerId={id} 
                {...task} 
              />
            ))}
            
            {tasks[id].length === 0 && (
              <div className="h-24 flex items-center justify-center border border-dashed border-border/50 rounded-lg">
                <p className="text-sm text-muted-foreground">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    );
  };

  // Render the kanban board
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 animate-fade-in">
        <DroppableColumn id="todo" />
        <DroppableColumn id="in-progress" />
        <DroppableColumn id="done" />
      </div>
    </DndContext>
  );
};

export default DraggableKanbanBoard;
