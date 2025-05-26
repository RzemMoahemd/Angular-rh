import type { Criterion } from "./Criterion"
import type { Employee } from "./employee"
import type { Goal } from "./Goal"

export interface Evaluation {
  id?: number
  employee: Employee
  evaluator?: string
  evaluatorId?: number;
  period: string
  startDate: Date | string
  endDate: Date | string
  evaluationDate?: Date | string
  status: "EN_ATTENTE" | "EN_COURS" | "COMPLETE" | "ANNULE"
  overallScore: number
  comments?: string
  criteria: Criterion[]
  strengths: string[]
  areasForImprovement: string[]
  goals: Goal[]
  createdAt?: Date | string
  updatedAt?: Date | string
  acknowledgementDate?: Date | string
  employeeComments?: string
}
