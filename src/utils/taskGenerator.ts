import type { Task, TaskLOE, TaskRisk } from '@/contexts/TasksContext';

interface TaskTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  phase_name: string;
  weather_dependent: boolean;
  requires_inspection: boolean;
  safety_requirements?: string[];
  equipment_needed?: string[];
  materials_needed?: string[];
  subtasks?: string[];
  loe: TaskLOE;
  risks: TaskRisk[];
  // Enhanced automation properties
  is_recurring?: boolean;
  recurrence_pattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  recurrence_end_condition?: 'project_completion' | 'phase_completion' | 'date' | 'count';
  recurrence_end_value?: string | number;
  depends_on?: string[]; // Task titles this depends on
  triggers_tasks?: string[]; // Task titles to create when this is completed
  milestone_trigger?: string; // Create this task when milestone is reached
}

interface RecurringTaskTemplate {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  phase_name: string;
  pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  applicable_phases: string[];
  weather_dependent: boolean;
  safety_requirements?: string[];
}

interface MilestoneTaskTemplate {
  milestone_name: string;
  completion_percentage: number;
  triggered_tasks: TaskTemplate[];
}

// Construction project phases and common tasks
const CONSTRUCTION_TASK_TEMPLATES: Record<string, TaskTemplate[]> = {
  residential: [
    {
      title: 'Site Survey and Preparation',
      description: 'Conduct site survey, mark utilities, and prepare construction area',
      priority: 'high',
      estimated_hours: 16,
      phase_name: 'Pre-Construction',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['High-visibility vests', 'Hard hats', 'Safety boots'],
      equipment_needed: ['Transit', 'Measuring tools', 'Marking spray'],
      materials_needed: ['Survey stakes', 'Caution tape'],
      subtasks: ['Boundary Survey', 'Utility Marking', 'Topographical Survey', 'Soil Testing', 'Access Road Setup', 'Site Security Setup'],
      loe: {
        optimistic_hours: 12,
        most_likely_hours: 16,
        pessimistic_hours: 24,
        confidence_level: 85,
        complexity_factor: 'moderate',
        skill_level_required: 'intermediate'
      },
      risks: [
        {
          level: 'low',
          type: 'weather',
          description: 'Rain affecting survey accuracy',
          mitigation: 'Schedule for clear weather, use weather-resistant equipment',
          probability: 25,
          impact: 'low'
        },
        {
          level: 'medium',
          type: 'technical',
          description: 'Unknown utility lines not marked',
          mitigation: 'Call 811, use ground penetrating radar if needed',
          probability: 20,
          impact: 'high'
        }
      ]
    },
    {
      title: 'Foundation Excavation',
      description: 'Excavate foundation area according to architectural plans',
      priority: 'high',
      estimated_hours: 24,
      phase_name: 'Foundation',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['Shoring equipment', 'Hard hats', 'Safety boots'],
      equipment_needed: ['Excavator', 'Dump truck', 'Laser level'],
      materials_needed: ['Gravel backfill', 'Foundation forms'],
      subtasks: ['Site Layout', 'Rough Excavation', 'Fine Grading', 'Utilities Rough-in', 'Foundation Forms', 'Backfill Prep'],
      loe: {
        optimistic_hours: 20,
        most_likely_hours: 24,
        pessimistic_hours: 32,
        confidence_level: 80,
        complexity_factor: 'moderate',
        skill_level_required: 'intermediate'
      },
      risks: [
        {
          level: 'medium',
          type: 'weather',
          description: 'Rain causing excavation delays and safety issues',
          mitigation: 'Monitor weather, have dewatering equipment ready',
          probability: 40,
          impact: 'medium'
        },
        {
          level: 'high',
          type: 'technical',
          description: 'Unexpected soil conditions or groundwater',
          mitigation: 'Geotechnical survey, soil engineer consultation',
          probability: 30,
          impact: 'high'
        },
        {
          level: 'low',
          type: 'safety',
          description: 'Cave-in or slope failure',
          mitigation: 'Proper shoring, daily safety inspections',
          probability: 10,
          impact: 'critical'
        }
      ]
    },
    {
      title: 'Foundation Pour',
      description: 'Pour concrete foundation and install anchor bolts',
      priority: 'critical',
      estimated_hours: 32,
      phase_name: 'Foundation',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['Hard hats', 'Safety boots', 'Gloves'],
      equipment_needed: ['Concrete mixer', 'Vibrator', 'Float'],
      materials_needed: ['Ready-mix concrete', 'Rebar', 'Anchor bolts'],
      subtasks: ['Rebar Installation', 'Form Setup', 'Concrete Ordering', 'Pour Preparation', 'Concrete Pour', 'Finishing & Curing'],
      loe: {
        optimistic_hours: 28,
        most_likely_hours: 32,
        pessimistic_hours: 40,
        confidence_level: 75,
        complexity_factor: 'complex',
        skill_level_required: 'senior'
      },
      risks: [
        {
          level: 'high',
          type: 'weather',
          description: 'Temperature extremes affecting concrete quality',
          mitigation: 'Use appropriate concrete mix, temperature monitoring',
          probability: 35,
          impact: 'high'
        },
        {
          level: 'medium',
          type: 'quality',
          description: 'Improper concrete placement or finishing',
          mitigation: 'Experienced crew, quality control procedures',
          probability: 15,
          impact: 'critical'
        },
        {
          level: 'low',
          type: 'schedule',
          description: 'Concrete delivery delays',
          mitigation: 'Backup suppliers, early ordering',
          probability: 20,
          impact: 'medium'
        }
      ]
    },
    {
      title: 'Framing',
      description: 'Install wall framing, roof trusses, and structural elements',
      priority: 'high',
      estimated_hours: 80,
      phase_name: 'Structure',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Fall protection', 'Hard hats', 'Safety glasses'],
      equipment_needed: ['Nail guns', 'Circular saws', 'Crane'],
      materials_needed: ['Lumber', 'Nails', 'Structural hardware'],
      subtasks: ['Wall Layout', 'Bottom Plates', 'Wall Framing', 'Top Plates', 'Roof Trusses', 'Sheathing Installation'],
      loe: {
        optimistic_hours: 70,
        most_likely_hours: 80,
        pessimistic_hours: 96,
        confidence_level: 85,
        complexity_factor: 'moderate',
        skill_level_required: 'intermediate'
      },
      risks: [
        {
          level: 'medium',
          type: 'safety',
          description: 'Falls from elevated work areas',
          mitigation: 'Proper fall protection, safety training',
          probability: 20,
          impact: 'critical'
        },
        {
          level: 'low',
          type: 'technical',
          description: 'Framing alignment and square issues',
          mitigation: 'Regular measurements, experienced crew',
          probability: 15,
          impact: 'medium'
        },
        {
          level: 'low',
          type: 'weather',
          description: 'High winds affecting crane operations',
          mitigation: 'Wind monitoring, work restrictions',
          probability: 25,
          impact: 'low'
        }
      ]
    },
    {
      title: 'Roofing Installation',
      description: 'Install roofing materials and weatherproofing',
      priority: 'high',
      estimated_hours: 40,
      phase_name: 'Structure',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['Fall protection', 'Hard hats', 'Safety harnesses'],
      equipment_needed: ['Roofing nailer', 'Safety ropes', 'Ladders'],
      materials_needed: ['Shingles', 'Underlayment', 'Flashing']
    },
    {
      title: 'Electrical Rough-In',
      description: 'Install electrical wiring, panels, and rough electrical components',
      priority: 'medium',
      estimated_hours: 48,
      phase_name: 'Systems',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Electrical safety training', 'Insulated tools'],
      equipment_needed: ['Wire strippers', 'Drill', 'Fish tape'],
      materials_needed: ['Electrical wire', 'Conduit', 'Junction boxes']
    },
    {
      title: 'Plumbing Rough-In',
      description: 'Install plumbing pipes, fixtures rough-in, and water lines',
      priority: 'medium',
      estimated_hours: 40,
      phase_name: 'Systems',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Eye protection', 'Gloves'],
      equipment_needed: ['Pipe cutters', 'Soldering torch', 'Pipe wrenches'],
      materials_needed: ['PVC pipes', 'Copper pipes', 'Fittings']
    },
    {
      title: 'Insulation Installation',
      description: 'Install thermal insulation in walls, ceiling, and floors',
      priority: 'medium',
      estimated_hours: 24,
      phase_name: 'Insulation',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Respirator', 'Long sleeves', 'Eye protection'],
      equipment_needed: ['Staple gun', 'Utility knife'],
      materials_needed: ['Fiberglass insulation', 'Vapor barrier', 'Staples']
    },
    {
      title: 'Drywall Installation',
      description: 'Hang, tape, and finish drywall throughout structure',
      priority: 'medium',
      estimated_hours: 56,
      phase_name: 'Interior',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Dust masks', 'Eye protection'],
      equipment_needed: ['Drywall lift', 'Taping tools', 'Sanders'],
      materials_needed: ['Drywall sheets', 'Joint compound', 'Tape']
    },
    {
      title: 'Interior Painting',
      description: 'Prime and paint all interior walls and ceilings',
      priority: 'low',
      estimated_hours: 40,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Ventilation', 'Drop cloths'],
      equipment_needed: ['Brushes', 'Rollers', 'Sprayer'],
      materials_needed: ['Primer', 'Paint', 'Drop cloths']
    },
    {
      title: 'Flooring Installation',
      description: 'Install flooring materials throughout the structure',
      priority: 'medium',
      estimated_hours: 32,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Knee pads', 'Eye protection'],
      equipment_needed: ['Miter saw', 'Nailer', 'Spacers'],
      materials_needed: ['Flooring material', 'Underlayment', 'Trim']
    },
    {
      title: 'Final Electrical',
      description: 'Install outlets, switches, fixtures, and final electrical components',
      priority: 'medium',
      estimated_hours: 24,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Electrical safety training', 'Circuit tester'],
      equipment_needed: ['Wire strippers', 'Screwdrivers', 'Multimeter'],
      materials_needed: ['Outlets', 'Switches', 'Light fixtures']
    },
    {
      title: 'Final Plumbing',
      description: 'Install plumbing fixtures, faucets, and final connections',
      priority: 'medium',
      estimated_hours: 16,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Eye protection', 'Gloves'],
      equipment_needed: ['Wrenches', 'Caulk gun', 'Level'],
      materials_needed: ['Fixtures', 'Faucets', 'Caulk']
    },
    {
      title: 'Final Cleanup and Inspection',
      description: 'Complete final cleanup and prepare for final inspection',
      priority: 'high',
      estimated_hours: 16,
      phase_name: 'Completion',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Standard PPE'],
      equipment_needed: ['Cleaning supplies', 'Vacuum', 'Touch-up tools'],
      materials_needed: ['Cleaning materials', 'Touch-up paint']
    }
  ],
  commercial: [
    {
      title: 'Site Analysis and Preparation',
      description: 'Comprehensive site survey, soil analysis, and construction area preparation',
      priority: 'critical',
      estimated_hours: 40,
      phase_name: 'Pre-Construction',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['High-visibility vests', 'Hard hats', 'Safety boots'],
      equipment_needed: ['Survey equipment', 'Soil testing tools'],
      materials_needed: ['Survey markers', 'Safety barriers']
    },
    {
      title: 'Foundation and Structural',
      description: 'Commercial-grade foundation and structural framework installation',
      priority: 'critical',
      estimated_hours: 120,
      phase_name: 'Foundation',
      weather_dependent: true,
      requires_inspection: true,
      safety_requirements: ['Fall protection', 'Heavy equipment safety'],
      equipment_needed: ['Crane', 'Heavy machinery', 'Welding equipment'],
      materials_needed: ['Steel beams', 'Commercial concrete', 'Rebar']
    },
    {
      title: 'MEP Systems Installation',
      description: 'Mechanical, Electrical, and Plumbing systems for commercial use',
      priority: 'high',
      estimated_hours: 160,
      phase_name: 'Systems',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Electrical certification', 'Confined space training'],
      equipment_needed: ['Commercial electrical tools', 'Pipe threading machines'],
      materials_needed: ['Commercial-grade wiring', 'HVAC equipment', 'Commercial plumbing']
    },
    {
      title: 'Fire Safety and Security Systems',
      description: 'Install fire suppression, alarm, and security systems',
      priority: 'critical',
      estimated_hours: 80,
      phase_name: 'Systems',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Fire safety training', 'System certification'],
      equipment_needed: ['System testing tools', 'Cable pullers'],
      materials_needed: ['Fire suppression equipment', 'Security cameras', 'Alarm systems']
    },
    {
      title: 'Commercial Finishes',
      description: 'Commercial-grade interior finishes and furnishings',
      priority: 'medium',
      estimated_hours: 100,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Standard commercial PPE'],
      equipment_needed: ['Commercial finishing tools'],
      materials_needed: ['Commercial flooring', 'Ceiling systems', 'Commercial fixtures']
    },
    {
      title: 'Final Commissioning',
      description: 'System testing, commissioning, and final approvals',
      priority: 'critical',
      estimated_hours: 60,
      phase_name: 'Completion',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['System operation training'],
      equipment_needed: ['Testing equipment', 'Commissioning tools'],
      materials_needed: ['Documentation materials']
    }
  ],
  renovation: [
    {
      title: 'Existing Conditions Assessment',
      description: 'Document existing conditions and identify renovation scope',
      priority: 'high',
      estimated_hours: 16,
      phase_name: 'Pre-Construction',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Hard hats', 'Safety glasses'],
      equipment_needed: ['Camera', 'Measuring tools', 'Inspection equipment'],
      materials_needed: ['Documentation materials']
    },
    {
      title: 'Selective Demolition',
      description: 'Carefully remove specified existing elements',
      priority: 'high',
      estimated_hours: 32,
      phase_name: 'Demolition',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Dust masks', 'Eye protection', 'Heavy gloves'],
      equipment_needed: ['Demolition tools', 'Dumpster', 'Dust barriers'],
      materials_needed: ['Plastic sheeting', 'Disposal bags']
    },
    {
      title: 'System Upgrades',
      description: 'Update electrical, plumbing, and HVAC systems as needed',
      priority: 'high',
      estimated_hours: 64,
      phase_name: 'Systems',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Trade-specific safety requirements'],
      equipment_needed: ['Trade-specific tools'],
      materials_needed: ['Updated system components']
    },
    {
      title: 'Renovation Construction',
      description: 'Execute renovation work according to design plans',
      priority: 'medium',
      estimated_hours: 80,
      phase_name: 'Construction',
      weather_dependent: false,
      requires_inspection: true,
      safety_requirements: ['Standard construction PPE'],
      equipment_needed: ['Construction tools'],
      materials_needed: ['New construction materials']
    },
    {
      title: 'Finish Work',
      description: 'Apply final finishes and complete renovation details',
      priority: 'medium',
      estimated_hours: 40,
      phase_name: 'Finishes',
      weather_dependent: false,
      requires_inspection: false,
      safety_requirements: ['Finish work PPE'],
      equipment_needed: ['Finishing tools'],
      materials_needed: ['Finish materials']
    }
  ]
};

// Recurring tasks that should be created throughout the project lifecycle
const RECURRING_TASK_TEMPLATES: RecurringTaskTemplate[] = [
  {
    title: 'Daily Safety Meeting',
    description: 'Conduct morning safety briefing with all team members',
    priority: 'high',
    estimated_hours: 0.5,
    phase_name: 'Construction',
    pattern: 'daily',
    applicable_phases: ['Construction', 'Excavation', 'Foundation', 'Framing', 'Electrical', 'Plumbing', 'Finishing'],
    weather_dependent: false,
    safety_requirements: ['Team attendance']
  },
  {
    title: 'Weekly Progress Report',
    description: 'Generate and submit weekly progress report to stakeholders',
    priority: 'medium',
    estimated_hours: 2,
    phase_name: 'Administration',
    pattern: 'weekly',
    applicable_phases: ['Pre-Construction', 'Construction', 'Post-Construction'],
    weather_dependent: false
  },
  {
    title: 'Weekly Site Cleanup',
    description: 'Comprehensive site cleanup and waste removal',
    priority: 'medium',
    estimated_hours: 4,
    phase_name: 'Maintenance',
    pattern: 'weekly',
    applicable_phases: ['Construction', 'Excavation', 'Foundation', 'Framing', 'Electrical', 'Plumbing', 'Finishing'],
    weather_dependent: false,
    safety_requirements: ['Work gloves', 'Safety boots']
  },
  {
    title: 'Monthly Equipment Inspection',
    description: 'Inspect and maintain all construction equipment and tools',
    priority: 'medium',
    estimated_hours: 3,
    phase_name: 'Equipment',
    pattern: 'monthly',
    applicable_phases: ['Pre-Construction', 'Construction', 'Post-Construction'],
    weather_dependent: false,
    safety_requirements: ['Equipment safety protocols']
  },
  {
    title: 'Biweekly Quality Control Inspection',
    description: 'Comprehensive quality control inspection of completed work',
    priority: 'high',
    estimated_hours: 4,
    phase_name: 'Quality Control',
    pattern: 'biweekly',
    applicable_phases: ['Construction', 'Finishing'],
    weather_dependent: false,
    safety_requirements: ['Inspection checklist']
  }
];

// Milestone-based task templates that trigger when project reaches certain completion percentages
const MILESTONE_TASK_TEMPLATES: MilestoneTaskTemplate[] = [
  {
    milestone_name: '25% Project Completion',
    completion_percentage: 25,
    triggered_tasks: [
      {
        title: 'First Quarter Review Meeting',
        description: 'Review progress, budget, and timeline at 25% completion milestone',
        priority: 'high',
        estimated_hours: 3,
        phase_name: 'Administration',
        weather_dependent: false,
        requires_inspection: false,
        loe: {
          optimistic_hours: 2,
          most_likely_hours: 3,
          pessimistic_hours: 4,
          confidence_level: 90,
          complexity_factor: 'low',
          skill_level_required: 'basic'
        },
        risks: []
      },
      {
        title: 'Budget Reconciliation',
        description: 'Reconcile actual costs with budget projections at quarter milestone',
        priority: 'medium',
        estimated_hours: 2,
        phase_name: 'Administration',
        weather_dependent: false,
        requires_inspection: false,
        loe: {
          optimistic_hours: 1.5,
          most_likely_hours: 2,
          pessimistic_hours: 3,
          confidence_level: 85,
          complexity_factor: 'low',
          skill_level_required: 'intermediate'
        },
        risks: []
      }
    ]
  },
  {
    milestone_name: '50% Project Completion',
    completion_percentage: 50,
    triggered_tasks: [
      {
        title: 'Mid-Project Assessment',
        description: 'Comprehensive mid-project assessment and course correction planning',
        priority: 'high',
        estimated_hours: 4,
        phase_name: 'Administration',
        weather_dependent: false,
        requires_inspection: false,
        loe: {
          optimistic_hours: 3,
          most_likely_hours: 4,
          pessimistic_hours: 6,
          confidence_level: 85,
          complexity_factor: 'moderate',
          skill_level_required: 'intermediate'
        },
        risks: []
      }
    ]
  },
  {
    milestone_name: '75% Project Completion',
    completion_percentage: 75,
    triggered_tasks: [
      {
        title: 'Pre-Completion Checklist Review',
        description: 'Review completion checklist and prepare for final phase',
        priority: 'high',
        estimated_hours: 3,
        phase_name: 'Quality Control',
        weather_dependent: false,
        requires_inspection: true,
        loe: {
          optimistic_hours: 2,
          most_likely_hours: 3,
          pessimistic_hours: 5,
          confidence_level: 80,
          complexity_factor: 'moderate',
          skill_level_required: 'intermediate'
        },
        risks: []
      },
      {
        title: 'Client Walkthrough Preparation',
        description: 'Prepare site and documentation for client walkthrough',
        priority: 'medium',
        estimated_hours: 2,
        phase_name: 'Client Relations',
        weather_dependent: false,
        requires_inspection: false,
        loe: {
          optimistic_hours: 1.5,
          most_likely_hours: 2,
          pessimistic_hours: 3,
          confidence_level: 90,
          complexity_factor: 'low',
          skill_level_required: 'basic'
        },
        risks: []
      }
    ]
  }
];

// Analyze project title and description to determine project type and scale
function analyzeProject(title: string, description: string): {
  projectType: string;
  scale: 'small' | 'medium' | 'large';
  keywords: string[];
} {
  const text = (title + ' ' + description).toLowerCase();
  const keywords = text.split(/\W+/).filter(word => word.length > 2);
  
  // Determine project type
  let projectType = 'residential'; // default
  if (text.includes('commercial') || text.includes('office') || text.includes('retail') || text.includes('warehouse')) {
    projectType = 'commercial';
  } else if (text.includes('renovation') || text.includes('remodel') || text.includes('upgrade') || text.includes('retrofit')) {
    projectType = 'renovation';
  }
  
  // Determine scale based on keywords and description length
  let scale: 'small' | 'medium' | 'large' = 'medium';
  if (text.includes('small') || text.includes('minor') || description.length < 100) {
    scale = 'small';
  } else if (text.includes('large') || text.includes('major') || text.includes('complex') || description.length > 300) {
    scale = 'large';
  }
  
  return { projectType, scale, keywords };
}

// Generate tasks based on project analysis
export function generateTasksFromProject(
  projectId: string,
  projectTitle: string,
  projectDescription: string,
  projectType?: string,
  projectStartDate?: string
): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] {
  const analysis = analyzeProject(projectTitle, projectDescription);
  const finalProjectType = projectType || analysis.projectType;
  
  // Get base task templates
  const templates = CONSTRUCTION_TASK_TEMPLATES[finalProjectType] || CONSTRUCTION_TASK_TEMPLATES.residential;
  
  // Adjust tasks based on scale
  const scaledTemplates = templates.filter((template, index) => {
    if (analysis.scale === 'small') {
      // For small projects, skip some tasks and reduce scope
      return index % 2 === 0; // Take every other task
    } else if (analysis.scale === 'large') {
      // For large projects, include all tasks
      return true;
    }
    // Medium projects get standard templates
    return true;
  });
  
  // Calculate task start and due dates
  const baseStartDate = projectStartDate ? new Date(projectStartDate) : new Date();
  let cumulativeDays = 0;

  // Convert templates to tasks
  const tasks = scaledTemplates.map((template, index): Omit<Task, 'id' | 'created_at' | 'updated_at'> => {
    // Adjust estimated hours based on scale
    let estimatedHours = template.estimated_hours;
    if (analysis.scale === 'small') {
      estimatedHours = Math.ceil(estimatedHours * 0.7);
    } else if (analysis.scale === 'large') {
      estimatedHours = Math.ceil(estimatedHours * 1.5);
    }

    // Adjust LOE estimates based on scale
    const baseLOE = template.loe || {
      optimistic_hours: Math.ceil(estimatedHours * 0.8),
      most_likely_hours: estimatedHours,
      pessimistic_hours: Math.ceil(estimatedHours * 1.3),
      confidence_level: 75,
      complexity_factor: 'moderate' as const,
      skill_level_required: 'intermediate' as const
    };

    const scaledLOE = {
      ...baseLOE,
      optimistic_hours: Math.ceil(baseLOE.optimistic_hours * (analysis.scale === 'small' ? 0.7 : analysis.scale === 'large' ? 1.5 : 1)),
      most_likely_hours: estimatedHours,
      pessimistic_hours: Math.ceil(baseLOE.pessimistic_hours * (analysis.scale === 'small' ? 0.7 : analysis.scale === 'large' ? 1.5 : 1))
    };

    // Calculate task dates
    const taskDurationDays = Math.ceil(estimatedHours / 8); // Assuming 8-hour workdays
    const taskStartDate = new Date(baseStartDate);
    taskStartDate.setDate(taskStartDate.getDate() + cumulativeDays);
    
    const taskDueDate = new Date(taskStartDate);
    taskDueDate.setDate(taskDueDate.getDate() + taskDurationDays);
    
    // Add some buffer days between tasks (1-2 days depending on complexity)
    const bufferDays = template.requires_inspection ? 2 : 1;
    cumulativeDays += taskDurationDays + bufferDays;
    
    return {
      projectId,
      title: template.title,
      description: template.description,
      status: 'not_started',
      priority: template.priority,
      completion_percentage: 0,
      due_date: taskDueDate.toISOString().split('T')[0],
      start_date: taskStartDate.toISOString().split('T')[0],
      estimated_hours: estimatedHours,
      actual_hours: 0,
      weather_dependent: template.weather_dependent,
      requires_inspection: template.requires_inspection,
      inspection_passed: undefined,
      safety_requirements: template.safety_requirements || [],
      equipment_needed: template.equipment_needed || [],
      materials_needed: template.materials_needed || [],
      dependencies: [],
      before_photos: [],
      progress_photos: [],
      after_photos: [],
      time_entries_count: 0,
      billable_hours: 0,
      quality_score: undefined,
      rework_required: false,
      phase_name: template.phase_name,
      subtasks: template.subtasks || [],
      loe: scaledLOE,
      risks: template.risks || [
        {
          level: 'medium' as const,
          type: 'schedule' as const,
          description: 'Task may experience delays due to dependencies',
          mitigation: 'Monitor dependencies and adjust schedule as needed',
          probability: 30,
          impact: 'medium' as const
        }
      ]
    };
  });
  
  // Set up basic dependencies (each task depends on the previous one in the same phase)
  const tasksWithDependencies = tasks.map((task, index) => {
    const dependencies = [];
    
    // Find previous task in same phase or previous phase
    for (let i = index - 1; i >= 0; i--) {
      const prevTask = tasks[i];
      if (prevTask.phase_name === task.phase_name || i === index - 1) {
        dependencies.push({
          id: `task-${i}`,
          title: prevTask.title,
          status: prevTask.status,
          completion_percentage: prevTask.completion_percentage
        });
        break; // Only depend on immediate predecessor
      }
    }
    
    return {
      ...task,
      dependencies
    };
  });
  
  return tasksWithDependencies;
}

// Generate recurring tasks for a project based on duration and phases
export function generateRecurringTasks(
  projectId: string,
  projectStartDate: string,
  projectEndDate: string,
  projectPhases: string[]
): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] {
  const startDate = new Date(projectStartDate);
  const endDate = new Date(projectEndDate);
  const projectDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const recurringTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  RECURRING_TASK_TEMPLATES.forEach(template => {
    // Check if this recurring task applies to any of the project phases
    const hasApplicablePhase = template.applicable_phases.some(phase => 
      projectPhases.some(projectPhase => 
        projectPhase.toLowerCase().includes(phase.toLowerCase())
      )
    );
    
    if (!hasApplicablePhase) return;
    
    let intervalDays: number;
    switch (template.pattern) {
      case 'daily': intervalDays = 1; break;
      case 'weekly': intervalDays = 7; break;
      case 'biweekly': intervalDays = 14; break;
      case 'monthly': intervalDays = 30; break;
      default: intervalDays = 7;
    }
    
    // Generate instances of this recurring task
    let currentDate = new Date(startDate);
    let instanceCount = 0;
    
    while (currentDate <= endDate && instanceCount < 100) { // Limit to prevent infinite loops
      const taskDueDate = new Date(currentDate);
      taskDueDate.setDate(taskDueDate.getDate() + 1); // Due next day
      
      recurringTasks.push({
        projectId,
        title: `${template.title} (Instance ${instanceCount + 1})`,
        description: template.description,
        status: 'not_started',
        priority: template.priority,
        completion_percentage: 0,
        due_date: taskDueDate.toISOString().split('T')[0],
        start_date: currentDate.toISOString().split('T')[0],
        estimated_hours: template.estimated_hours,
        actual_hours: 0,
        weather_dependent: template.weather_dependent,
        requires_inspection: false,
        inspection_passed: undefined,
        safety_requirements: template.safety_requirements || [],
        equipment_needed: [],
        materials_needed: [],
        dependencies: [],
        before_photos: [],
        progress_photos: [],
        after_photos: [],
        time_entries_count: 0,
        billable_hours: 0,
        quality_score: undefined,
        rework_required: false,
        phase_name: template.phase_name,
        subtasks: [],
        loe: {
          optimistic_hours: template.estimated_hours * 0.8,
          most_likely_hours: template.estimated_hours,
          pessimistic_hours: template.estimated_hours * 1.2,
          confidence_level: 85,
          complexity_factor: 'low',
          skill_level_required: 'basic'
        },
        risks: []
      });
      
      currentDate.setDate(currentDate.getDate() + intervalDays);
      instanceCount++;
    }
  });
  
  return recurringTasks;
}

// Generate milestone-based tasks when project reaches certain completion levels
export function generateMilestoneTasks(
  projectId: string,
  completionPercentage: number
): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] {
  const milestoneTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  MILESTONE_TASK_TEMPLATES.forEach(milestone => {
    if (completionPercentage >= milestone.completion_percentage) {
      milestone.triggered_tasks.forEach((template, index) => {
        const startDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days
        
        milestoneTasks.push({
          projectId,
          title: template.title,
          description: template.description,
          status: 'not_started',
          priority: template.priority,
          completion_percentage: 0,
          due_date: dueDate.toISOString().split('T')[0],
          start_date: startDate.toISOString().split('T')[0],
          estimated_hours: template.estimated_hours,
          actual_hours: 0,
          weather_dependent: template.weather_dependent,
          requires_inspection: template.requires_inspection,
          inspection_passed: undefined,
          safety_requirements: template.safety_requirements || [],
          equipment_needed: template.equipment_needed || [],
          materials_needed: template.materials_needed || [],
          dependencies: [],
          before_photos: [],
          progress_photos: [],
          after_photos: [],
          time_entries_count: 0,
          billable_hours: 0,
          quality_score: undefined,
          rework_required: false,
          phase_name: template.phase_name,
          subtasks: template.subtasks || [],
          loe: template.loe,
          risks: template.risks
        });
      });
    }
  });
  
  return milestoneTasks;
}

// Generate dependency-based tasks when prerequisite tasks are completed
export function generateDependencyBasedTasks(
  projectId: string,
  completedTaskTitle: string,
  allProjectTasks: Task[]
): Omit<Task, 'id' | 'created_at' | 'updated_at'>[] {
  const dependencyTasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[] = [];
  
  // Find templates that should trigger when this task is completed
  const allTemplates = Object.values(CONSTRUCTION_TASK_TEMPLATES).flat();
  const triggerTemplates = allTemplates.filter(template => 
    template.depends_on?.includes(completedTaskTitle)
  );
  
  triggerTemplates.forEach(template => {
    // Check if this task already exists in the project
    const taskExists = allProjectTasks.some(task => 
      task.title === template.title && task.projectId === projectId
    );
    
    if (!taskExists) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1); // Start tomorrow
      const dueDate = new Date(startDate);
      const taskDurationDays = Math.ceil(template.estimated_hours / 8); // Assuming 8-hour work days
      dueDate.setDate(dueDate.getDate() + taskDurationDays);
      
      dependencyTasks.push({
        projectId,
        title: template.title,
        description: template.description,
        status: 'not_started',
        priority: template.priority,
        completion_percentage: 0,
        due_date: dueDate.toISOString().split('T')[0],
        start_date: startDate.toISOString().split('T')[0],
        estimated_hours: template.estimated_hours,
        actual_hours: 0,
        weather_dependent: template.weather_dependent,
        requires_inspection: template.requires_inspection,
        inspection_passed: undefined,
        safety_requirements: template.safety_requirements || [],
        equipment_needed: template.equipment_needed || [],
        materials_needed: template.materials_needed || [],
        dependencies: [{
          id: 'completed-task',
          title: completedTaskTitle,
          status: 'completed',
          completion_percentage: 100
        }],
        before_photos: [],
        progress_photos: [],
        after_photos: [],
        time_entries_count: 0,
        billable_hours: 0,
        quality_score: undefined,
        rework_required: false,
        phase_name: template.phase_name,
        subtasks: template.subtasks || [],
        loe: template.loe,
        risks: template.risks
      });
    }
  });
  
  return dependencyTasks;
}

// Helper function to get suggested tasks based on common construction phases
export function getSuggestedTasksByPhase(phase: string): TaskTemplate[] {
  const allTemplates = Object.values(CONSTRUCTION_TASK_TEMPLATES).flat();
  return allTemplates.filter(template => template.phase_name.toLowerCase().includes(phase.toLowerCase()));
}

// Helper function to estimate project duration based on generated tasks
export function estimateProjectDuration(tasks: Omit<Task, 'id' | 'created_at' | 'updated_at'>[]): number {
  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  // Assume 8 hours per day, 5 days per week
  const workingHoursPerWeek = 40;
  return Math.ceil(totalHours / workingHoursPerWeek);
}