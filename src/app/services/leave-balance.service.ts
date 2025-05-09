import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeaveBalance } from '../models/leave-balance';
import { switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class LeaveBalanceService {
  private apiUrl = "http://localhost:8222/api/conge/soldeConge";

  constructor(private http: HttpClient) {}

  getAllLeaveBalances(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(this.apiUrl);
  }

  getLeaveBalanceById(id: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/${id}`);
  }
 
  createLeaveBalance(leaveBalance: Omit<LeaveBalance, 'id'>): Observable<LeaveBalance> {
    return this.http.post<LeaveBalance>(this.apiUrl, leaveBalance);
  }

  updateLeaveBalance(id: number, leaveBalance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.apiUrl}/${id}`, leaveBalance);
  }

  updateRemainingDays(id: number, joursRestants: number): Observable<LeaveBalance> {
    return this.http.patch<LeaveBalance>(
      `${this.apiUrl}/${id}/jours?jours=${joursRestants}`,
      {}
    );
  }

  deleteLeaveBalance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  getCurrentYearBalances(employeeId: number): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(
      `${this.apiUrl}/employee/${employeeId}/current-year`
    );
  }











// Ajouter cette nouvelle méthode dans la classe
updateLeaveDays(
  employeeId: number, 
  leaveType: 'PAYÉ' | 'MALADIE' | 'RTT' | 'SANS SOLDE', 
  days: number
): Observable<LeaveBalance[]> {
  return this.getCurrentYearBalances(employeeId).pipe(
    switchMap(balances => {
      const balance = balances.find(b => b.typeConge === leaveType);
      if (!balance) throw new Error('Solde non trouvé');

      let newValue = balance.nombreJoursRestants;

      // Logique métier
      if (leaveType === 'MALADIE' || leaveType === 'SANS SOLDE') {
        newValue += days; // Incrémentation
      } else {
        newValue = Math.max(0, newValue - days); // Décrémentation avec protection négatif
      }

      return this.updateRemainingDays(balance.id!, newValue).pipe(
        switchMap(() => this.getCurrentYearBalances(employeeId))
      );
    })
  );
}



}