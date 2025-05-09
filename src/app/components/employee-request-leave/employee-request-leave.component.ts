import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveService } from '../../services/leave.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KeycloakService } from '../../services/keycloak/keycloak.service';
import { EmployeeService } from 'app/services/employee.service';
import { LeaveBalanceService } from 'app/services/leave-balance.service';
import { take } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

interface Balance {
  typeConge: string;
  nombreJoursRestants: number;
}

@Component({
  selector: 'app-employee-request-leave',
  templateUrl: './employee-request-leave.component.html',
  styleUrls: ['./employee-request-leave.component.css']
})
export class EmployeeRequestLeaveComponent {
  leaveForm: FormGroup;
  loading = false;
  leaveBalances: Balance[] = [];
  minDate: Date;

  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private snackBar: MatSnackBar,
    private keycloakService: KeycloakService,
    private employeeService: EmployeeService,
    private leaveBalanceService: LeaveBalanceService,
    public dialogRef: MatDialogRef<EmployeeRequestLeaveComponent>
  ) {
    this.minDate = new Date();
    this.leaveForm = this.fb.group({
      dateDebut: ['', [Validators.required, this.weekendValidator]],
      dateFin: ['', [Validators.required, this.weekendValidator]],
      motif: ['', Validators.required],
      motifPrecision: ['']
    }, { validator: this.dateOrderValidator });

    this.loadLeaveBalances();
  }

  weekendValidator = (control: { value: Date }) => {
    const date = new Date(control.value);
    const day = date.getDay();
    return day === 0 || day === 6 ? { weekend: true } : null;
  };

  dateOrderValidator = (group: FormGroup) => {
    const start = group.get('dateDebut')?.value;
    const end = group.get('dateFin')?.value;
    
    if (!start || !end) return null;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return endDate <= startDate ? { dateOrder: true } : null;
  };

  loadLeaveBalances(): void {
    const userEmail = this.keycloakService.keycloak.tokenParsed?.email;
    if (!userEmail) return;

    this.employeeService.getEmployeeByEmail(userEmail).subscribe({
      next: (employee) => {
        this.leaveBalanceService.getCurrentYearBalances(employee.id)
          .pipe(take(1))
          .subscribe((balances: Balance[]) => {
            this.leaveBalances = balances;
          });
      }
    });
  }

  onDateChange(type: 'start' | 'end', event: MatDatepickerInputEvent<Date>) {
    if (type === 'start' && this.leaveForm.get('dateFin')?.value) {
      this.leaveForm.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;
  
    this.loading = true;
    const formValue = this.leaveForm.value;
    const userEmail = this.keycloakService.keycloak.tokenParsed?.email;
    
    if (!userEmail) {
      this.handleError('Email utilisateur non trouvé');
      return;
    }
  
    this.employeeService.getEmployeeByEmail(userEmail).subscribe({
      next: (employee) => {
        const leaveType = this.getLeaveType(formValue.motif);
        const days = this.calculateDays(formValue.dateDebut, formValue.dateFin);
  
        const leave = {
          employeId: employee.id,
          dateDebut: formValue.dateDebut,
          dateFin: formValue.dateFin,
          motif: formValue.motif === 'autre' ? formValue.motifPrecision : formValue.motif,
          statut: 'en attente'
        };
  
        this.leaveService.createLeave(leave).subscribe({
          next: () => {
            this.handleSuccess();
          },
          error: () => this.handleError('Erreur lors de la création du congé')
        });
      },
      error: () => this.handleError('Employé non trouvé')
    });
  }

  private handleSuccess(): void {
    this.snackBar.open('Demande de congé envoyée avec succès', 'Fermer', { 
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    this.dialogRef.close('success');
  }

  private handleError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    this.loading = false;
  }

  private getLeaveType(motif: string): string {
    switch (motif) {
      case 'Maladie': return 'MALADIE';
      case 'Congés sans solde': return 'SANS SOLDE';
      case 'Congés payés': return 'PAYÉ';
      case 'RTT': return 'RTT';
      default: return 'AUTRE';
    }
  }
  
  private calculateDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    const endDate = new Date(end);
    
    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) { // Exclure samedi (6) et dimanche (0)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Empêche la sélection des week-ends dans le datepicker
  dateFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day !== 0 && day !== 6;
  };
}