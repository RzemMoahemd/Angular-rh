import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import type { Leave } from "../models/leave";

@Injectable({
  providedIn: "root",
})
export class LeaveService {
  private apiUrl = "http://10.112.62.182:8222/api/conge";

  constructor(private http: HttpClient) {}

  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl);
  }

  getLeave(id: number): Observable<Leave> {
    return this.http.get<Leave>(`${this.apiUrl}/${id}`);
  }

  // leave.service.ts
createLeave(leave: Leave): Observable<void> {
  return this.http.post<void>(this.apiUrl, leave).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nouvelle structure d'erreur
      const serverMessage = error.error?.message || error.message;
      return throwError(() => new Error(serverMessage));
    })
  );
}

  updateLeave(id: number, leave: Leave): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}`, leave);
  }

  deleteLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateLeaveStatus(id: number, statut: string) {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { statut });
  }

  getLeavesByEmployee(employeeId: number): Observable<Leave[]> {
    return this.http.get<Leave[]>(`${this.apiUrl}/employee/${employeeId}`);
  }
}