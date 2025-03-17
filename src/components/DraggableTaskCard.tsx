
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard, { TaskProps } from './TaskCard';

interface DraggableTaskCardProps extends TaskProps {
  containerId: string;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = (props) => {
  const { id, containerId, ...taskProps } = props;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id, 
    data: { 
      type: 'task',
      task: props,
      containerId 
    } 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard id={id} {...taskProps} />
    </div>
  );
};

export default DraggableTaskCard;
