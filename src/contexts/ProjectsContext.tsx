import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectApi } from '@/services/api';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'planning';
  progress: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  location: string;
  latitude?: number;
  longitude?: number;
  manager: string;
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
  health: 'excellent' | 'good' | 'warning' | 'critical';
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  projectType?: string;
}

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id'>, customId?: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  // Initialize from localStorage if available, otherwise seed with demo data
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem('siteboss_projects');
      if (stored) {
        return JSON.parse(stored) as Project[];
      }
    } catch {}
    return [
      {
        id: 'demo',
        name: 'Luxury Residential Complex - Phase 1',
        description: 'Modern 48-unit residential building with underground parking and amenities',
        status: 'active',
        progress: 67,
        budget: 2500000,
        spent: 1675000,
        startDate: '2024-03-15',
        endDate: '2025-01-30',
        location: 'Downtown Metro Area',
        manager: 'Sarah Johnson',
        teamSize: 15,
        priority: 'high',
        health: 'good',
        clientName: 'Metro Development Corp',
        clientEmail: 'contact@metrodev.com',
        clientPhone: '(555) 123-4567',
        projectType: 'residential'
      },
      {
        id: '2',
        name: 'Commercial Office Tower',
        description: '12-story office building with retail space on ground floor',
        status: 'active',
        progress: 34,
        budget: 8500000,
        spent: 2890000,
        startDate: '2024-01-10',
        endDate: '2025-12-15',
        location: 'Business District',
        manager: 'Mike Chen',
        teamSize: 28,
        priority: 'high',
        health: 'excellent',
        clientName: 'Corporate Solutions LLC',
        clientEmail: 'projects@corpsolutions.com',
        clientPhone: '(555) 987-6543',
        projectType: 'commercial'
      },
      {
        id: '3',
        name: 'Shopping Center Renovation',
        description: 'Complete renovation of existing shopping center with modern amenities',
        status: 'active',
        progress: 89,
        budget: 1200000,
        spent: 1068000,
        startDate: '2024-05-01',
        endDate: '2024-11-30',
        location: 'Suburban Mall',
        manager: 'Lisa Rodriguez',
        teamSize: 12,
        priority: 'medium',
        health: 'warning',
        clientName: 'Retail Properties Inc',
        clientEmail: 'info@retailprops.com',
        clientPhone: '(555) 456-7890',
        projectType: 'renovation'
      },
      {
        id: '4',
        name: 'Industrial Warehouse Complex',
        description: 'Three-building warehouse facility with distribution center',
        status: 'planning',
        progress: 0,
        budget: 4200000,
        spent: 125000,
        startDate: '2024-12-01',
        endDate: '2025-08-15',
        location: 'Industrial Park',
        manager: 'Tom Wilson',
        teamSize: 0,
        priority: 'medium',
        health: 'good',
        clientName: 'Logistics Hub Corp',
        clientEmail: 'projects@logihub.com',
        clientPhone: '(555) 321-0987',
        projectType: 'industrial'
      },
      {
        id: '5',
        name: 'School Building Expansion',
        description: 'Adding new classrooms and gymnasium to existing school',
        status: 'completed',
        progress: 100,
        budget: 3200000,
        spent: 3150000,
        startDate: '2023-06-01',
        endDate: '2024-08-15',
        location: 'Education District',
        manager: 'David Park',
        teamSize: 18,
        priority: 'high',
        health: 'excellent',
        clientName: 'Metro School District',
        clientEmail: 'facilities@metroschools.edu',
        clientPhone: '(555) 654-3210',
        projectType: 'institutional'
      },
      {
        id: '6',
        name: 'Hospital Emergency Wing',
        description: 'New emergency department with advanced medical facilities',
        status: 'on-hold',
        progress: 23,
        budget: 6800000,
        spent: 1564000,
        startDate: '2024-02-15',
        endDate: '2025-10-30',
        location: 'Medical Center',
        manager: 'Dr. Jennifer Adams',
        teamSize: 22,
        priority: 'high',
        health: 'critical',
        clientName: 'Metro General Hospital',
        clientEmail: 'construction@metrogeneral.org',
        clientPhone: '(555) 789-0123',
        projectType: 'healthcare'
      },
      {
        id: '1757454115704',
        name: 'Enterprise Project Dashboard',
        description: 'Sample project for testing the enterprise dashboard',
        status: 'active',
        progress: 67,
        budget: 2500000,
        spent: 1675000,
        startDate: '2024-03-15',
        endDate: '2025-01-30',
        location: 'Downtown Metro Area',
        manager: 'Sarah Johnson',
        teamSize: 15,
        priority: 'high',
        health: 'good',
        clientName: 'Metro Development Corp',
        clientEmail: 'contact@metrodev.com',
        clientPhone: '(555) 123-4567',
        projectType: 'residential'
    }
  ];
  });

  // Persist projects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('siteboss_projects', JSON.stringify(projects));
    } catch {}
  }, [projects]);

  // Attempt to load projects from API (Supabase via backend) on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // Optional: disable backend API calls during frontend-only development
      const disableApi = ((import.meta as any).env?.VITE_DISABLE_API === 'true') ||
                         (typeof localStorage !== 'undefined' && localStorage.getItem('siteboss_disable_api') === 'true');
      if (disableApi) {
        if (process.env.NODE_ENV !== 'production') {
          try { console.info('[Projects] API disabled via VITE_DISABLE_API/siteboss_disable_api; using local data'); } catch {}
        }
        return;
      }
      try {
        const resp = await projectApi.getProjects();
        const rows = (resp as any).data || [];
        if (!cancelled && Array.isArray(rows)) {
          const mapped: Project[] = rows.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || '',
            status: (p.status === 'on_hold' ? 'on-hold' : p.status) || 'planning',
            progress: 0,
            budget: p.total_budget ? parseFloat(p.total_budget) : 0,
            spent: 0,
            startDate: p.start_date || '',
            endDate: p.end_date || '',
            location: (() => {
              const parts = [p.street_address, p.city, [p.state, p.postal_code].filter(Boolean).join(' '), p.country].filter(Boolean).join(', ');
              return parts || p.address || '';
            })(),
            manager: p.project_manager_name || '',
            teamSize: 0,
            priority: 'medium',
            health: 'good',
            clientName: p.client_name || undefined,
            clientEmail: undefined,
            clientPhone: undefined,
            projectType: undefined,
          }));
          // Merge: prefer API list; keep any locally-added not present yet
          setProjects(prev => {
            const existingIds = new Set(mapped.map(m => m.id));
            const localExtras = prev.filter(p => !existingIds.has(p.id));
            return [...mapped, ...localExtras];
          });
        }
      } catch {
        // ignore, stay with local data
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const addProject = (projectData: Omit<Project, 'id'>, customId?: string): string => {
    // Generate unique ID with timestamp and random number to avoid collisions
    const projectId = customId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProject: Project = {
      ...projectData,
      id: projectId,
      progress: 0,
      spent: 0,
      health: 'good' as const
    };
    setProjects(prev => [...prev, newProject]);
    return projectId;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  return (
    <ProjectsContext.Provider value={{
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProject
    }}>
      {children}
    </ProjectsContext.Provider>
  );
};
