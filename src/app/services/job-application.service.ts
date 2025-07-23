import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable, of } from "rxjs"
import { delay } from "rxjs/operators"
import { JobApplicationDto, ApplicationStatus, AIAnalysisResult } from "../models/job-application.model"
import { environment } from "../../environments/environment"

import { catchError } from "rxjs/operators"
import { throwError } from "rxjs" // of déjà présent


@Injectable({
  providedIn: "root",
})
export class JobApplicationService {
  private apiUrl = `${environment.apiUrl}/api/job-applications`

  constructor(private http: HttpClient) {}

  getAllApplications(): Observable<JobApplicationDto[]> {
    return this.http.get<JobApplicationDto[]>(this.apiUrl)
  }

  getApplicationsByJobRequest(jobRequestId: number): Observable<JobApplicationDto[]> {
    return this.http.get<JobApplicationDto[]>(`${this.apiUrl}/job/${jobRequestId}`)
  }

  getApplicationsByEmployee(employeeId: number): Observable<JobApplicationDto[]> {
    return this.http.get<JobApplicationDto[]>(`${this.apiUrl}/employee/${employeeId}`)
  }

  getApplicationById(id: number): Observable<JobApplicationDto> {
    return this.http.get<JobApplicationDto>(`${this.apiUrl}/${id}`)
  }

  applyForJob(
    jobRequestId: number,
    employeeId: number,
    motivationText: string,
    cvFile?: File,
  ): Observable<JobApplicationDto> {
    const formData = new FormData()
    formData.append("jobRequestId", jobRequestId.toString())
    formData.append("employeeId", employeeId.toString())
    formData.append("motivationText", motivationText)

    if (cvFile) {
      formData.append("cvFile", cvFile)
    }

    return this.http.post<JobApplicationDto>(`${this.apiUrl}/apply`, formData)
  }

  checkIfEmployeeApplied(jobRequestId: number, employeeId: number): Observable<{ hasApplied: boolean }> {
    return this.http.get<{ hasApplied: boolean }>(`${this.apiUrl}/check/${jobRequestId}/${employeeId}`)
  }

  updateApplicationStatus(id: number, status: ApplicationStatus): Observable<JobApplicationDto> {
    return this.http.put<JobApplicationDto>(`${this.apiUrl}/${id}/status`, { status })
  }

  // analyzeApplication(id: number): Observable<JobApplicationDto> {
  //   // This should trigger an AI analysis on the backend
  //   // For now, simulating a response
  //   console.log(`Simulating AI analysis for application ID: ${id}`)
  //   const mockAnalysisResult: AIAnalysisResult = {
  //     matchPercentage: Math.floor(Math.random() * 40) + 60, // Between 60 and 99
  //     strengths: "Excellente correspondance des compétences techniques, expérience pertinente.",
  //     weaknesses: "Manque d'expérience en gestion de projet, quelques lacunes en soft skills.",
  //     recommendations: "Proposer une formation en gestion de projet. Évaluer les soft skills lors de l'entretien.",
  //     success: true,
  //   }

  //   return of({
  //     id: id,
  //     jobRequestId: 1, // Placeholder
  //     employeeId: 1, // Placeholder
  //     motivationText: "Simulated motivation text",
  //     cvFileName: "simulated_cv.pdf",
  //     status: ApplicationStatus.UNDER_REVIEW,
  //     appliedAt: new Date(),
  //     employeeFirstName: "John",
  //     employeeLastName: "Doe",
  //     employeeEmail: "john.doe@example.com",
  //     employeePosition: "Software Engineer",
  //     aiMatchPercentage: mockAnalysisResult.matchPercentage,
  //     aiStrengths: mockAnalysisResult.strengths,
  //     aiWeaknesses: mockAnalysisResult.weaknesses,
  //     aiRecommendations: mockAnalysisResult.recommendations,
  //     aiAnalyzedAt: new Date(),
  //   } as JobApplicationDto).pipe(delay(1500))
  // }

  analyzeApplication(id: number): Observable<JobApplicationDto> {
    const url = `${this.apiUrl}/${id}/analyze`
    return this.http.post<JobApplicationDto>(url, null).pipe(
      catchError((err) => {
        console.error("Erreur lors de l'analyse IA (application):", err)
        return throwError(() => err)
      }),
    )
  }

  // analyzeAllApplicationsForJob(jobRequestId: number): Observable<JobApplicationDto[]> {
  //   // This should trigger AI analysis for all applications of a specific job on the backend
  //   console.log(`Simulating AI analysis for all applications of job ID: ${jobRequestId}`)
  //   // You would typically get the applications for this job and then trigger analysis for each
  //   // For now, returning an empty array or a mock list
  //   return of([] as JobApplicationDto[]).pipe(delay(1500))
  // }

  analyzeAllApplicationsForJob(jobRequestId: number): Observable<JobApplicationDto[]> {
    const url = `${this.apiUrl}/job/${jobRequestId}/analyze-all`
    return this.http.post<JobApplicationDto[]>(url, null).pipe(
      catchError((err) => {
        console.error("Erreur lors de l'analyse IA (toutes candidatures du job):", err)
        return throwError(() => err)
      }),
    )
  }

  downloadCv(applicationId: number): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/${applicationId}/cv`, { responseType: "blob" });
}


}
