import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import type { LeaveBalance } from "../models/leave-balance"

@Injectable({
  providedIn: "root",
})
export class LeaveBalanceService {
  private apiUrl = "http://localhost:8222/api/conge/soldeConge"

  constructor(private http: HttpClient) {}

  getLeaveBalances(): Observable<LeaveBalance[]> {
    return this.http.get<LeaveBalance[]>(this.apiUrl)
  }

  getLeaveBalance(id: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}/${id}`)
  }

  createLeaveBalance(leaveBalance: LeaveBalance): Observable<void> {
    return this.http.post<void>(this.apiUrl, leaveBalance)
  }

  updateLeaveBalance(id: number, leaveBalance: LeaveBalance): Observable<LeaveBalance> {
    return this.http.put<LeaveBalance>(`${this.apiUrl}/${id}`, leaveBalance)
  }

  deleteLeaveBalance(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}

