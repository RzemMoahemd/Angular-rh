export interface Goal {
  id?: number
  description: string
  targetDate?: Date | string
  priority?: "HAUTE" | "MOYENNE" | "BASSE"
  measurableOutcome?: string
  status?: "NON_COMMENCE" | "EN_COURS" | "COMPLETE"
}
