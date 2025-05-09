export interface LeaveBalance {
  id?: number;
  employeId: number;
  nombreJoursRestants: number;
  typeConge: 'PAYÉ' | 'RTT' | 'MALADIE' | 'SANS SOLDE';
  anneeReference: number;
  dateCreation?: string;
  dateMiseAJour?: string;
}

export interface LeaveBalanceDisplay {
  type: string;
  total: number;
  used: number;
  remaining: number;
  percentage?: number;
}

// Modifier LEAVE_TYPES comme suit
export const LEAVE_TYPES = [
  { 
    type: 'PAYÉ', 
    label: 'Congés payés', 
    total: 25,
    behavior: 'decrement' // Nouvelle propriété
  },
  { 
    type: 'RTT', 
    label: 'RTT', 
    total: 5,
    behavior: 'decrement' 
  },
  { 
    type: 'MALADIE', 
    label: 'Maladie', 
    total: 0,
    behavior: 'increment' 
  },
  { 
    type: 'SANS SOLDE', 
    label: 'Congés sans solde', 
    total: 0,
    behavior: 'increment' 
  }
];