export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface Kpi {
  name: string;
  target: string;
  targetScore: string;
  actual: string;
  weight: string;
  weightedScore: string;
  evidence: string;
  evidenceMeta?: string;
}

export interface QualitativeKpi {
  name: string;
  score: string;
  scoreValue: string;
  weight: string;
  evidence: string;
  evidenceMeta?: string;
}

export interface Task {
  id: number;
  name: string;
  projectName: string;
  dueDate: string;
  status: 'Completed' | 'Pending' | 'Overdue';
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
}

export interface Feedback {
  from: string;
  comment: string;
}

export interface ActivityLogEntry {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface UserProfile {
  id: number;
  name: string;
  title: string;
  email?: string;
  avatarUrl: string; // from avatar_url
  score: number;
  performanceData: ChartDataPoint[]; // from performance_data
  quantitativeKpis: Kpi[]; // from quantitative_kpis
  qualitativeKpis: QualitativeKpi[]; // from qualitative_kpis
  division: string;
  region: string;
  tasks: Task[];
  badges: Badge[];
  feedback: Feedback[];
  activityLog: ActivityLogEntry[]; // from activity_log
}

export interface Milestone {
    name: string;
    status: string;
    dueDate: string;
}

export interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  budgetUtilization: number; // from budget_utilization
  milestones: Milestone[];
  team: number[]; // array of user ids
}

export interface FileItem {
  id: string;
  name: string;
  metadata?: {
    mimetype?: string;
    size?: number;
  };
  created_at?: string;
}

export interface Report {
    id: number;
    name: string;
    date: string;
    format: 'PDF' | 'CSV' | 'XLSX';
    generatedById: number; // from generated_by_id
}

export interface Appeal {
    id: number;
    subject: string;
    recipientId: number;
    date: string;
    status: 'Pending Review' | 'In Progress' | 'Completed';
    assigned: string; // Name of assigner
}

export interface AppraisalContent {
  id: number;
  message: string;
  events: { name: string }[];
}

export interface Alert {
    id: number;
    title: string;
    description: string;
    date: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

export interface DprTask {
  id: number;
  userId: number; // from user_id
  taskDate: string; // from task_date, YYYY-MM-DD
  description: string;
  status: 'Pending' | 'Completed' | 'Approved' | 'Rejected';
  mentorNotes?: string; // from mentor_notes
  projectId: number; // from project_id
}
