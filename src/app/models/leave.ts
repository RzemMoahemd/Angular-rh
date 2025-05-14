export interface Leave {
    id?: number
    employeId: number
    dateDebut: Date
    dateFin: Date
    motif: string
    type?: string
    statut: string
    commentaire?: string
    duration?: number
    dateSoumission?: Date;
    dateRepance?: Date;
  }
  
  