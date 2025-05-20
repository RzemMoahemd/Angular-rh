import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, of } from "rxjs";
import { Employee } from "../models/employee";
import { KeycloakService } from "./keycloak/keycloak.service";


@Injectable({
  providedIn: "root",
})
export class EmployeeService {
  private apiUrl = "http://localhost:8222/api/employee";
  private Keyclaok

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.keycloakService.keycloak.token
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    })
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des employés", error)
        return of([])
      }),
    )
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération de l'employé ${id}`, error)
        // Retourner un employé par défaut en cas d'erreur
        return of({
          id: id,
          firstName: "Employé",
          lastName: "Non disponible",
          email: "non.disponible@example.com",
          phoneNumber: 0,
          hireDate: new Date(),
          position: "Non disponible",
          departmentId: 0,
          status: "ACTIF",
        })
      }),
    )
  }

  createEmployee(employee: Employee): Observable<void> {
    return this.http.post<void>(this.apiUrl, employee, { headers: this.getHeaders() })
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee, { headers: this.getHeaders() })
  }

  deleteEmployee(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
  }

  getEmployeeByEmail(email: string): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/by-email/${email}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération de l'employé par email ${email}`, error)
        return of({
          id: 0,
          firstName: "Employé",
          lastName: "Non disponible",
          email: email,
          phoneNumber: 0,
          hireDate: new Date(),
          position: "Non disponible",
          departmentId: 0,
          status: "ACTIF",
        })
      }),
    )
  }

  getCurrentEmployee(): Observable<Employee> {
    const email = this.keycloakService.keycloak.tokenParsed?.email
    if (!email) {
      console.error("Email non disponible dans le token")
      return of({
        id: 0,
        firstName: "Utilisateur",
        lastName: "Actuel",
        email: "utilisateur.actuel@example.com",
        phoneNumber: 0,
        hireDate: new Date(),
        position: "Non disponible",
        departmentId: 0,
        status: "ACTIF",
      })
    }

    return this.getEmployeeByEmail(email).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération de l'employé actuel", error)
        return of({
          id: 0,
          firstName: "Utilisateur",
          lastName: "Actuel",
          email: email,
          phoneNumber: 0,
          hireDate: new Date(),
          position: "Non disponible",
          departmentId: 0,
          status: "ACTIF",
        })
      }),
    )
  }
}