// ─── Core Envelope Types ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export type MemberRole = 'owner' | 'member';

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  memberCount: number;
  taskCount: number;
  role: MemberRole;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  members: ProjectMember[];
  tasks: Task[];
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export interface TaskFilters {
  project_id?: string;
  status?: TaskStatus;
  priority?: Priority;
  page?: number;
  limit?: number;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Export {
  id: string;
  projectId: string;
  userId: string;
  status: ExportStatus;
  filePath: string | null;
  createdAt: string;
  completedAt: string | null;
  project?: {
    id: string;
    name: string;
  };
}
