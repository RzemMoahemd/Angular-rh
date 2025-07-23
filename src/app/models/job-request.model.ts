export interface JobRequest {
  id?: number
  title: string
  description: string
  department: string
  experienceLevel: ExperienceLevel
  requiredSkills: string[]
  deadline: Date
  createdAt?: Date
  updatedAt?: Date
  status: JobStatus
  createdBy?: number
  applicationsCount?: number // Added for dashboard/admin view
}

export interface JobRequestDto extends JobRequest {
  applicationsCount: number
}

export enum ExperienceLevel {
  JUNIOR = "JUNIOR",
  INTERMEDIATE = "INTERMEDIATE",
  SENIOR = "SENIOR",
  EXPERT = "EXPERT",
}

export enum JobStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
}
