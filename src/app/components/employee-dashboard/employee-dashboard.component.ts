import { Component, OnInit } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { EmployeeService } from '../../services/employee.service';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { LeaveBalance, LeaveBalanceDisplay, LEAVE_TYPES } from '../../models/leave-balance';
import { forkJoin } from 'rxjs';

interface LeaveStats {
  total: number;
  accepted: number;
  pending: number;
  refused: number;
}

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  leaveStats: LeaveStats = {
    total: 0,
    accepted: 0,
    pending: 0,
    refused: 0
  };
  
  nextLeave: any = null;
  leaveBalances: LeaveBalanceDisplay[] = [];
  recentLeaves: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private leaveBalanceService: LeaveBalanceService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  loadEmployeeData(): void {
  const email = this.keycloakService.keycloak.tokenParsed?.email;
  if (!email) {
    this.errorMessage = 'Email non trouvé dans le token';
    this.isLoading = false;
    return;
  }

  this.employeeService.getEmployeeByEmail(email).subscribe({
    next: employe => {
      // on lance les deux appels en parallèle
      forkJoin({
        leaves:    this.leaveService.getLeavesByEmployee(employe.id),
        balances: this.leaveBalanceService.getCurrentYearBalances(employe.id)
      }).subscribe({
        next: ({ leaves, balances }) => {
          // traitement des congés
          this.processLeaveStats(leaves);
          this.processNextLeave(leaves);
          this.processRecentLeaves(leaves);
          // traitement des soldes
          this.processLeaveBalances(balances);
          // on désactive le loader
          this.isLoading = false;
        },
        error: err => {
          console.error('Erreur chargement dashboard', err);
          this.errorMessage = 'Erreur lors du chargement des données';
          this.isLoading = false;  // toujours désactiver le spinner
        }
      });
    },
    error: err => {
      console.error('Erreur chargement employé', err);
      this.errorMessage = 'Erreur chargement données employé';
      this.isLoading = false;
    }
  });
}

  loadLeaves(employeeId: number): void {
    this.leaveService.getLeavesByEmployee(employeeId).subscribe({
      next: (leaves) => {
        this.processLeaveStats(leaves);
        this.processNextLeave(leaves);
        this.processRecentLeaves(leaves);
      },
      error: (err) => {
        this.errorMessage = 'Error loading leave data';
        console.error('Error loading leaves', err);
        this.isLoading = false;
      }
    });
  }

  private processLeaveStats(leaves: any[]): void {
    this.leaveStats = {
      total: leaves.length,
      accepted: leaves.filter(l => l.statut === 'approuvé').length,
      pending: leaves.filter(l => l.statut === 'en attente').length,
      refused: leaves.filter(l => l.statut === 'rejeté').length
    };
  }

  private processNextLeave(leaves: any[]): void {
    const now = new Date();
    const upcomingApproved = leaves
      .filter(l => l.statut === 'approuvé' && new Date(l.dateDebut) > now)
      .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime());
    
    this.nextLeave = upcomingApproved[0] || null;
  }

  private processRecentLeaves(leaves: any[]): void {
    this.recentLeaves = leaves
      .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
      .slice(0, 3);
  }

  loadLeaveBalances(employeeId: number): void {
    this.leaveBalanceService
      .getCurrentYearBalances(employeeId)
      .subscribe({
        next: (balances) => {
          this.processLeaveBalances(balances);
          this.isLoading = false;
        },
        error: (err) => { /* … */ }
      });
  }

  // private processLeaveBalances(balances: LeaveBalance[]): void {
  //   // Pour chaque type défini dans LEAVE_TYPES
  //   this.leaveBalances = LEAVE_TYPES.map(typeConfig => {
  //     // on cherche le solde correspondant
  //     const solde = balances.find(b => b.typeConge === typeConfig.type);
  //     const remaining = solde ? solde.nombreJoursRestants : typeConfig.total;
  //     const used = typeConfig.total - remaining;
  //     return {
  //       type: typeConfig.label,
  //       total: typeConfig.total,
  //       used,
  //       remaining,
  //       percentage: (remaining / typeConfig.total) * 100
  //     } as LeaveBalanceDisplay;
  //   });
  // }


  // Remplacer la méthode processLeaveBalances par :
private processLeaveBalances(balances: LeaveBalance[]): void {
  this.leaveBalances = LEAVE_TYPES.map(typeConfig => {
    const balance = balances.find(b => b.typeConge === typeConfig.type);
    
    if (!balance) {
      return {
        type: typeConfig.label,
        total: typeConfig.total,
        used: 0,
        remaining: typeConfig.total,
        percentage: 100
      };
    }

    if (typeConfig.behavior === 'increment') {
      return {
        type: typeConfig.label,
        total: typeConfig.total,
        used: balance.nombreJoursRestants,
        remaining: 0,
        percentage: 0
      };
    } else {
      const remaining = balance.nombreJoursRestants;
      const used = typeConfig.total - remaining;
      return {
        type: typeConfig.label,
        total: typeConfig.total,
        used,
        remaining,
        percentage: (remaining / typeConfig.total) * 100
      };
    }
  });
}
  

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'approuvé': return 'status-accepted';
      case 'rejeté': return 'status-refused';
      default: return 'status-pending';
    }
  }

  getProgressBarColor(percentage: number | undefined): string {
    if (percentage === undefined) return 'primary';
    if (percentage > 50) return 'primary';
    if (percentage > 25) return 'accent';
    return 'warn';
  }
}