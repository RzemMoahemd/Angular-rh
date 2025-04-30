export interface Leave {
    id?: number
    employeId: number
    dateDebut: Date
    dateFin: Date
    motif: string
    statut: string
    commentaireManager?: string
  }
  
  