
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import NavBar from '@/components/NavBar';
import WorkSites, { WorkSiteProps } from '@/components/WorkSite';
import KanbanBoard from '@/components/KanbanBoard';
import WorkSiteDetail from '@/components/WorkSiteDetail';
import { TaskProps } from '@/components/TaskCard';
import { v4 as uuid } from 'uuid';

// Mock data
const initialWorkSites: WorkSiteProps[] = [
  { id: uuid(), name: "Fatemah's AirBnB", status: 'done' },
  { id: uuid(), name: "Abhishek's AirBnB", status: 'done' },
];

const initialTasks: Record<string, TaskProps[]> = {
  todo: [],
  inprogress: [],
  done: [
    { 
      id: uuid(), 
      title: "Fatemah's AirBnB", 
      startTime: "5:24:15 PM", 
      finishTime: "5:26:29 PM" 
    },
    { 
      id: uuid(), 
      title: "Abhishek's AirBnB", 
      startTime: "5:26:18 PM", 
      finishTime: "5:26:40 PM" 
    }
  ]
};

const Index = () => {
  const { toast } = useToast();
  const [userName] = useState("Shaya Mukhtar");
  const [workSites, setWorkSites] = useState<WorkSiteProps[]>(initialWorkSites);
  const [selectedSite, setSelectedSite] = useState<WorkSiteProps | null>(null);
  const [tasks, setTasks] = useState<Record<string, TaskProps[]>>(initialTasks);
  const [siteDescription, setSiteDescription] = useState<Record<string, string>>({});

  // Work Sites handlers
  const handleAddWorkSite = (name: string) => {
    const newSite = { id: uuid(), name, status: 'todo' as const };
    setWorkSites([...workSites, newSite]);
    toast({
      title: "Work site created",
      description: `${name} has been added to your work sites.`,
    });
  };

  const handleEditWorkSite = (id: string, name: string) => {
    setWorkSites(workSites.map(site => 
      site.id === id ? { ...site, name } : site
    ));
    
    if (selectedSite?.id === id) {
      setSelectedSite({ ...selectedSite, name });
    }
    
    toast({
      title: "Work site updated",
      description: `Work site has been renamed to ${name}.`,
    });
  };

  const handleDeleteWorkSite = (id: string) => {
    setWorkSites(workSites.filter(site => site.id !== id));
    
    if (selectedSite?.id === id) {
      setSelectedSite(null);
    }
    
    toast({
      title: "Work site deleted",
      description: "The work site has been removed.",
    });
  };

  const handleSelectWorkSite = (site: WorkSiteProps) => {
    setSelectedSite(site);
  };

  // Task handlers
  const handleAddTask = (column: 'todo' | 'inprogress' | 'done') => {
    if (!selectedSite) {
      toast({
        title: "No work site selected",
        description: "Please select a work site first.",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const newTask: TaskProps = {
      id: uuid(),
      title: selectedSite.name,
      startTime: column !== 'done' ? timeString : undefined,
      finishTime: column === 'done' ? timeString : undefined,
    };
    
    setTasks({
      ...tasks,
      [column]: [...tasks[column], newTask]
    });
    
    toast({
      title: "Task added",
      description: `Task added to ${column === 'todo' ? 'To Do' : column === 'inprogress' ? 'In Progress' : 'Done'}.`,
    });
  };

  const handleUpdateSiteStatus = (id: string, status: 'todo' | 'inprogress' | 'done') => {
    setWorkSites(workSites.map(site => 
      site.id === id ? { ...site, status } : site
    ));
    
    if (selectedSite?.id === id) {
      setSelectedSite({ ...selectedSite, status });
    }
    
    toast({
      title: "Status updated",
      description: `Work site status updated to ${status === 'todo' ? 'To Do' : status === 'inprogress' ? 'In Progress' : 'Done'}.`,
    });
  };

  const handleUpdateDescription = (id: string, description: string) => {
    setSiteDescription({
      ...siteDescription,
      [id]: description
    });
    
    toast({
      title: "Description updated",
      description: "Work site description has been saved.",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-background to-secondary/50">
      <NavBar userName={userName} />
      
      <main className="container mx-auto px-4 pt-24">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-inprogress rounded-full blur-lg opacity-20 animate-float"></div>
              <h1 className="text-3xl font-bold relative">Welcome, {userName.split(' ')[0]}</h1>
            </div>
          </div>
          <p className="text-muted-foreground mt-2">Manage your work sites and tasks efficiently</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <WorkSites 
              sites={workSites}
              onAdd={handleAddWorkSite}
              onEdit={handleEditWorkSite}
              onDelete={handleDeleteWorkSite}
              onSelect={handleSelectWorkSite}
              selectedSite={selectedSite}
            />
          </div>
          
          <div className="md:col-span-2">
            {selectedSite ? (
              <WorkSiteDetail 
                site={selectedSite}
                onUpdateStatus={handleUpdateSiteStatus}
                onUpdateDescription={handleUpdateDescription}
              />
            ) : (
              <div className="h-40 flex items-center justify-center border border-dashed border-gray-300 rounded-xl">
                <p className="text-muted-foreground">Select a work site to view details</p>
              </div>
            )}
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Task Board</h2>
              <KanbanBoard 
                todoTasks={tasks.todo}
                inProgressTasks={tasks.inprogress}
                doneTasks={tasks.done}
                onAddTask={handleAddTask}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
