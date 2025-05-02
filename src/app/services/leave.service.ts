import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import type { Leave } from "../models/leave"

@Injectable({
  providedIn: "root",
})
export class LeaveService {
  private apiUrl = "http://localhost:8222/api/conge"

  constructor(private http: HttpClient) {}

  getLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(this.apiUrl)
  }

  getLeave(id: number): Observable<Leave> {
    return this.http.get<Leave>(`${this.apiUrl}/${id}`)
  }

  createLeave(leave: Leave): Observable<void> {
    return this.http.post<void>(this.apiUrl, leave)
  }

  updateLeave(id: number, leave: Leave): Observable<Leave> {
    return this.http.put<Leave>(`${this.apiUrl}/${id}`, leave)
  }

  deleteLeave(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
  updateLeaveStatus(id: number, statut: string) {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { statut });
  }
  
  
  
}

