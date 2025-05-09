import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import type { Employee } from "../models/employee";

@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private apiUrl = "http://localhost:8222/api/employee";

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("access_token"); // Récupérez le token stocké après connexion
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEmployee(employee: Employee): Observable<void> {
    return this.http.post<void>(this.apiUrl, employee, { headers: this.getHeaders() });
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, { headers: this.getHeaders() });
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  getEmployeeByEmail(email: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/by-email/${email}`);
  }
}
