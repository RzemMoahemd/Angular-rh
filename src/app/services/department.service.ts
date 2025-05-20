import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable , catchError, map, of} from 'rxjs';
import { Department } from '../models/department';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8222/api/Departement';

  constructor(private http: HttpClient) {}

  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des départements", error)
        return of([])
      }),
    )
  }

  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération du département ${id}`, error)
        // Retourner un département par défaut en cas d'erreur
        return of({ id: id, code: "N/A", name: "Département non disponible", description: "" })
      }),
    )
  }

  createDepartment(department: Department): Observable<void> {
    return this.http.post<void>(this.apiUrl, department)
  }

  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department)
  }

  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  // Méthode pour obtenir le nom du département à partir de l'ID
  getDepartmentName(id: number): Observable<string> {
    return this.getDepartmentById(id).pipe(
      map((department) => department.name),
      catchError(() => of("Département inconnu")),
    )
  }
}