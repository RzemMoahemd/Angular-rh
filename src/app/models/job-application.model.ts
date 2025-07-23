export interface JobApplication {
  id?: number
  jobRequestId: number
  employeeId: number
  motivationText?: string
  cvFileName?: string
  status: ApplicationStatus
  appliedAt?: Date
  // Informations employé (pour affichage côté admin)
  employeeFirstName?: string
  employeeLastName?: string
  employeeEmail?: string
  employeePosition?: string
  // Résultats IA
  aiMatchPercentage?: number
  aiStrengths?: string
  aiWeaknesses?: string
  aiRecommendations?: string
  aiAnalyzedAt?: Date
}

export interface JobApplicationDto extends JobApplication {
  jobTitle?: string;
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface AIAnalysisResult {
  matchPercentage: number
  strengths: string
  weaknesses: string
  recommendations: string
  success: boolean
  errorMessage?: string
}
