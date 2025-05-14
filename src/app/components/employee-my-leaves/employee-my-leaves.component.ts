import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeRequestLeaveComponent } from '../employee-request-leave/employee-request-leave.component';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { EmployeeService } from '../../services/employee.service';
import { LeaveService } from '../../services/leave.service';
import { LeaveBalanceService } from '../../services/leave-balance.service';
import { forkJoin } from 'rxjs';
import { LeaveBalance, LEAVE_TYPES } from '../../models/leave-balance';
import { LeaveDetailsDialogEmpComponent } from '../dialogs/leave-details-dialog-emp/leave-details-dialog-emp.component';

interface LeaveBalanceDisplay {
  type: string;
  total: number;
  used: number;
  remaining: number;
}

@Component({
  selector: 'app-employee-my-leaves',
  templateUrl: './employee-my-leaves.component.html',
  styleUrls: ['./employee-my-leaves.component.css']
})
export class EmployeeMyLeavesComponent implements OnInit {
  leaveBalances: LeaveBalanceDisplay[] = [];
  allLeaves: any[] = [];
  approvedLeaves: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  activeTab: 'requests' | 'history' = 'requests';
  currentYear = new Date().getFullYear();
  months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  daysPerMonth: number[] = new Array(12).fill(0);

  constructor(
    private leaveService: LeaveService,
    private employeeService: EmployeeService,
    private leaveBalanceService: LeaveBalanceService,
    private keycloakService: KeycloakService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployeeData();
  }

  openDetailsDialog(leave: any): void {
  this.dialog.open(LeaveDetailsDialogEmpComponent, { // <-- Nouveau nom de composant
    width: '600px',
    data: leave,
    autoFocus: false
  });
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
        forkJoin({
          leaves: this.leaveService.getLeavesByEmployee(employe.id),
          balances: this.leaveBalanceService.getCurrentYearBalances(employe.id)
        }).subscribe({
          next: ({ leaves, balances }) => {
            this.allLeaves = leaves;
            this.approvedLeaves = leaves.filter(leave => 
              leave.statut.toLowerCase() === 'approuvé'
            );
            this.processLeaveBalances(balances);
            this.calculateMonthlyAbsences();
            this.isLoading = false;
          },
          error: err => {
            console.error('Erreur chargement des données', err);
            this.errorMessage = 'Erreur lors du chargement des données';
            this.isLoading = false;
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

  private processLeaveBalances(balances: LeaveBalance[]): void {
    this.leaveBalances = LEAVE_TYPES.map(typeConfig => {
      const balance = balances.find(b => b.typeConge === typeConfig.type);
      
      if (!balance) {
        if (typeConfig.behavior === 'increment') {
          return {
            type: typeConfig.label,
            total: 0,
            used: 0,
            remaining: 0
          };
        } else {
          return {
            type: typeConfig.label,
            total: typeConfig.total,
            used: 0,
            remaining: typeConfig.total
          };
        }
      }
  
      if (typeConfig.behavior === 'increment') {
        return {
          type: typeConfig.label,
          total: balance.nombreJoursRestants,
          used: balance.nombreJoursRestants,
          remaining: 0
        };
      } else {
        const remaining = balance.nombreJoursRestants;
        const used = typeConfig.total - remaining;
        return {
          type: typeConfig.label,
          total: typeConfig.total,
          used,
          remaining
        };
      }
    });
  }

  private calculateMonthlyAbsences(): void {
    this.daysPerMonth = new Array(12).fill(0);
    
    this.approvedLeaves.forEach(leave => {
      const startDate = new Date(leave.dateDebut);
      const endDate = new Date(leave.dateFin);
      const month = startDate.getMonth();
      const days = this.calculateDays(leave.dateDebut, leave.dateFin);
      
      this.daysPerMonth[month] += days;
    });
  }

  calculateDays(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Exclure samedi (6) et dimanche (0)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  calculateTotalDaysTaken(): number {
    return this.daysPerMonth.reduce((total, days) => total + days, 0);
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'approuvé': return 'status-approved';
      case 'rejeté': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  openLeaveRequestDialog(): void {
    const dialogRef = this.dialog.open(EmployeeRequestLeaveComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'success') {
        this.loadEmployeeData();
      }
    });
  }

  getMonthBarHeight(days: number): string {
    const maxDays = Math.max(...this.daysPerMonth, 10);
    const height = (days / maxDays) * 100;
    return `${height}%`;
  }

  getMaxDays(): number {
    return Math.max(...this.daysPerMonth, 5);
  }
}