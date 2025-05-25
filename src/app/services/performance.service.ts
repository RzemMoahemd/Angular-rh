import { Injectable } from "@angular/core"
import {  HttpClient, HttpParams , HttpHeaders } from "@angular/common/http"
import  { Observable, catchError, of, throwError } from "rxjs"
import  { Evaluation } from "app/models/Evaluation"
import  { PerformanceTrend } from "app/models/PerformanceTrend"
import  { DepartmentPerformance } from "app/models/DepartmentPerformance"
import  { CriterionAverage } from "app/models/CriterionAverage"
import  { KeycloakService } from "./keycloak/keycloak.service"
import { Goal } from "app/models/Goal"

@Injectable({
  providedIn: "root",
})
export class PerformanceService {
  private apiUrl = "http://localhost:8222/api/performances"

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

  // Méthodes générales
  getAllEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/evaluations`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des évaluations", error)
        return throwError(() => new Error("Impossible de récupérer les évaluations"))
      }),
    )
  }

  getEvaluationById(id: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/evaluations/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la récupération de l'évaluation ${id}`, error)
        return throwError(() => new Error(`Impossible de récupérer l'évaluation ${id}`))
      }),
    )
  }

  getEvaluationsByEmployeeId(employeeId: number): Observable<Evaluation[]> {
    return this.http
      .get<Evaluation[]>(`${this.apiUrl}/employees/${employeeId}/evaluations`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error(`Erreur lors de la récupération des évaluations de l'employé ${employeeId}`, error)
          return of([])
        }),
      )
  }

  getMyEvaluations(employeeId: number): Observable<Evaluation[]> {
    const params = new HttpParams().set("employeeId", employeeId.toString())
    return this.http.get<Evaluation[]>(`${this.apiUrl}/my-evaluations`, { params, headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération de mes évaluations", error)
        return of([])
      }),
    )
  }

  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.apiUrl}/evaluations`, evaluation, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la création de l'évaluation", error)
        return throwError(() => new Error("Impossible de créer l'évaluation"))
      }),
    )
  }

  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http
      .put<Evaluation>(`${this.apiUrl}/evaluations/${id}`, evaluation, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error(`Erreur lors de la mise à jour de l'évaluation ${id}`, error)
          return throwError(() => new Error(`Impossible de mettre à jour l'évaluation ${id}`))
        }),
      )
  }

  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/evaluations/${id}`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error(`Erreur lors de la suppression de l'évaluation ${id}`, error)
        return throwError(() => new Error(`Impossible de supprimer l'évaluation ${id}`))
      }),
    )
  }

  acknowledgeEvaluation(id: number): Observable<Evaluation> {
    return this.http
      .post<Evaluation>(`${this.apiUrl}/evaluations/${id}/acknowledge`, {}, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error(`Erreur lors de l'accusé de réception de l'évaluation ${id}`, error)
          return throwError(() => new Error(`Impossible d'accuser réception de l'évaluation ${id}`))
        }),
      )
  }

  addEmployeeComment(id: number, comment: string): Observable<Evaluation> {
    return this.http
      .post<Evaluation>(`${this.apiUrl}/evaluations/${id}/comments`, { comment }, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error(`Erreur lors de l'ajout du commentaire à l'évaluation ${id}`, error)
          return throwError(() => new Error(`Impossible d'ajouter un commentaire à l'évaluation ${id}`))
        }),
      )
  }

  // Méthodes pour les statistiques et tendances
  getPerformanceTrends(): Observable<PerformanceTrend[]> {
    return this.http.get<PerformanceTrend[]>(`${this.apiUrl}/trends`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des tendances de performance", error)
        return of([])
      }),
    )
  }

  getMyPerformanceEvolution(employeeId: number): Observable<PerformanceTrend[]> {
    const params = new HttpParams().set("employeeId", employeeId.toString())
    return this.http
      .get<PerformanceTrend[]>(`${this.apiUrl}/my-evolution`, { params, headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error("Erreur lors de la récupération de mon évolution de performance", error)
          return of([])
        }),
      )
  }

  getDepartmentPerformances(): Observable<DepartmentPerformance[]> {
    return this.http.get<DepartmentPerformance[]>(`${this.apiUrl}/departments`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des performances par département", error)
        return of([])
      }),
    )
  }

  getCriteriaAverages(): Observable<CriterionAverage[]> {
    return this.http.get<CriterionAverage[]>(`${this.apiUrl}/criteria/averages`, { headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des moyennes par critère", error)
        return of([])
      }),
    )
  }

  getMySkillScores(employeeId: number): Observable<CriterionAverage[]> {
    const params = new HttpParams().set("employeeId", employeeId.toString())
    return this.http.get<CriterionAverage[]>(`${this.apiUrl}/my-skills`, { params, headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération de mes scores de compétences", error)
        return of([])
      }),
    )
  }

  getTopPerformers(limit = 5): Observable<Evaluation[]> {
    const params = new HttpParams().set("limit", limit.toString())
    return this.http.get<Evaluation[]>(`${this.apiUrl}/top-performers`, { params, headers: this.getHeaders() }).pipe(
      catchError((error) => {
        console.error("Erreur lors de la récupération des meilleurs performeurs", error)
        return of([])
      }),
    )
  }

  getNextEvaluation(employeeId: number): Observable<{ period: string; date: string }> {
    const params = new HttpParams().set("employeeId", employeeId.toString())
    return this.http
      .get<{ period: string; date: string }>(`${this.apiUrl}/next-evaluation`, { params, headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error("Erreur lors de la récupération de la prochaine évaluation", error)
          return of({ period: "Non disponible", date: "Non disponible" })
        }),
      )
  }


  // Ajoutez cette méthode dans PerformanceService
updateGoalStatus(goalId: number, newStatus: string): Observable<Goal> {
  return this.http.patch<Goal>(
    `${this.apiUrl}/goals/${goalId}/status`,
    { status: newStatus },
    { headers: this.getHeaders() }
  ).pipe(
    catchError((error) => {
      console.error('Erreur lors de la mise à jour du statut', error);
      return throwError(() => new Error('Impossible de mettre à jour le statut'));
    })
  );
}


}
